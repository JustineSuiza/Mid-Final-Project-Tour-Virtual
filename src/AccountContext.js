import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from './firebase';
import { hashPassword, verifyPassword } from './utils/passwords';

const AccountContext = createContext(null);
const SESSION_KEY = 'gala-tour-firebase-session-v1';
const LEGACY_ACCOUNTS_KEY = 'gala-tour-local-accounts-v1';
const LEGACY_SESSION_KEY = 'gala-tour-local-session-v1';
const USERS_COL = 'users';
const DEFAULT_PROFILE = {
  name: '',
  aboutMe: '',
  streetAddress: '',
  city: '',
  province: '',
  postalCode: '',
  birthDate: '',
  phone: '',
  country: { name: 'Philippines', flag: '🇵🇭', flagCode: 'ph', code: '+63' },
  profilePhoto: '',
  twitter: '',
  google: '',
  facebook: '',
};

const userDoc = (email) => doc(firestore, USERS_COL, email);
const normalizeEmail = (email) => email.trim().toLowerCase();
const normalizeProfile = (profile = {}) => ({ ...DEFAULT_PROFILE, ...profile, name: (profile.name || '').trim() });

export function AccountProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await AsyncStorage.multiRemove([LEGACY_ACCOUNTS_KEY, LEGACY_SESSION_KEY]);
        const savedEmail = await AsyncStorage.getItem(SESSION_KEY);
        if (!active || !savedEmail) return;
        const email = normalizeEmail(savedEmail);
        const snap = await getDoc(userDoc(email));
        if (!active) return;
        if (snap.exists()) {
          const account = snap.data();
          setCurrentUser({ email, ...normalizeProfile(account.profile) });
        } else {
          await AsyncStorage.removeItem(SESSION_KEY);
        }
      } catch (error) {
        if (active) setStorageError(`Could not load account data: ${error.message || error}`);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const normalizedEmail = normalizeEmail(email);
    let snap;
    try {
      snap = await Promise.race([
        getDoc(userDoc(normalizedEmail)),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out. Check internet/Firebase config and try again.')), 15000)),
      ]);
    } catch (e) {
      throw new Error(e?.code ? `Could not sign in (${e.code}). ${e.message}` : `Could not sign in. ${e?.message || e}`);
    }
    if (!snap.exists()) {
      throw new Error('No account was found for this email. Please create an account first.');
    }

    let account = { ...snap.data(), profile: normalizeProfile(snap.data().profile) };
    if (!account.passwordHash) {
      throw new Error('This account needs to be recreated. Please create a new account.');
    }
    const passwordMatches = await verifyPassword(password, account.passwordHash);
    if (!passwordMatches) {
      throw new Error('The email or password is incorrect.');
    }

    await AsyncStorage.setItem(SESSION_KEY, normalizedEmail);
    setCurrentUser({ email: normalizedEmail, ...account.profile });
    setStorageError('');
  }, []);

  const createAccount = useCallback(async ({ email, password, profile }) => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !password || !profile?.name?.trim()) {
      throw new Error('Complete the required account information.');
    }
    if (password.length < 8) {
      throw new Error('Your password must be at least 8 characters long.');
    }

    const ref = userDoc(normalizedEmail);
    let existing;
    try {
      existing = await Promise.race([
        getDoc(ref),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out. Check internet/Firebase config and try again.')), 15000)),
      ]);
    } catch (e) {
      throw new Error(e?.code ? `Could not check account (${e.code}). ${e.message}` : `Could not check account. ${e?.message || e}`);
    }
    if (existing.exists()) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }

    const savedProfile = normalizeProfile(profile);
    let passwordHash;
    try {
      passwordHash = await Promise.race([
        hashPassword(password),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Password hashing timed out.')), 15000)),
      ]);
    } catch (e) {
      throw new Error(`Could not secure password: ${e?.message || e}`);
    }
    const account = {
      email: normalizedEmail,
      profile: savedProfile,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    try {
      await Promise.race([
        setDoc(ref, account),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out. Check internet/Firebase config and try again.')), 15000)),
      ]);
    } catch (e) {
      throw new Error(e?.code ? `Could not save account (${e.code}). ${e.message}` : `Could not save account. ${e?.message || e}`);
    }
    await AsyncStorage.setItem(SESSION_KEY, normalizedEmail);
    setCurrentUser({ email: normalizedEmail, ...savedProfile });
    setStorageError('');
  }, []);

  const saveProfile = useCallback(async (profile) => {
    if (!currentUser) throw new Error('Sign in before saving profile information.');
    const email = normalizeEmail(currentUser.email);
    const ref = userDoc(email);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('The account could not be found.');
    const account = snap.data();

    const nextAccount = {
      ...account,
      email,
      profile: normalizeProfile({ ...account.profile, ...profile }),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(ref, nextAccount, { merge: true });
    setCurrentUser({ email, ...nextAccount.profile });
    setStorageError('');
  }, [currentUser]);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    setStorageError('');
  }, []);

  const value = useMemo(() => ({
    accounts: {},
    currentUser,
    loading,
    storageError,
    createAccount,
    login,
    saveProfile,
    logout,
  }), [currentUser, loading, storageError, createAccount, login, saveProfile, logout]);

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const account = useContext(AccountContext);
  if (!account) throw new Error('useAccount must be used within AccountProvider');
  return account;
}
