import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hashPassword, verifyPassword } from './utils/passwords';

const AccountContext = createContext(null);
const ACCOUNTS_KEY = 'gala-tour-local-accounts-v1';
const SESSION_KEY = 'gala-tour-local-session-v1';
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

export function AccountProvider({ children }) {
  const [accounts, setAccounts] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      AsyncStorage.getItem(ACCOUNTS_KEY),
      AsyncStorage.getItem(SESSION_KEY),
    ]).then(([savedAccounts, savedEmail]) => {
      if (!active) return;
      const parsedAccounts = savedAccounts ? JSON.parse(savedAccounts) : {};
      if (!parsedAccounts || typeof parsedAccounts !== 'object' || Array.isArray(parsedAccounts)) {
        throw new Error('Stored account data is invalid.');
      }
      setAccounts(parsedAccounts);
      setCurrentUser(savedEmail && parsedAccounts[savedEmail]?.profile
        ? { email: savedEmail, ...DEFAULT_PROFILE, ...parsedAccounts[savedEmail].profile }
        : null);
    }).catch((error) => {
      if (active) setStorageError(`Could not load local account data: ${error.message || error}`);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    let account = accounts[normalizedEmail];
    if (!account) {
      throw new Error('No account was found for this email. Please create an account first.');
    }

    account = { ...account, profile: { ...DEFAULT_PROFILE, ...account.profile } };
    if (account.passwordHash) {
      const passwordMatches = await verifyPassword(password, account.passwordHash);
      if (!passwordMatches) {
        throw new Error('The email or password is incorrect.');
      }
    } else {
      const nextAccount = {
        ...account,
        passwordHash: await hashPassword(password),
      };
      const nextAccounts = { ...accounts, [normalizedEmail]: nextAccount };
      await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(nextAccounts));
      setAccounts(nextAccounts);
      account = nextAccount;
    }

    await AsyncStorage.setItem(SESSION_KEY, normalizedEmail);
    setCurrentUser({ email: normalizedEmail, ...DEFAULT_PROFILE, ...account.profile });
    setStorageError('');
  }, [accounts]);

  const createAccount = useCallback(async ({ email, password, profile }) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password || !profile?.name?.trim()) {
      throw new Error('Complete the required account information.');
    }
    if (password.length < 8) {
      throw new Error('Your password must be at least 8 characters long.');
    }
    if (accounts[normalizedEmail]) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }

    const savedProfile = { ...DEFAULT_PROFILE, ...profile, name: profile.name.trim() };
    const nextAccounts = {
      ...accounts,
      [normalizedEmail]: {
        profile: savedProfile,
        passwordHash: await hashPassword(password),
      },
    };
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(nextAccounts));
    await AsyncStorage.setItem(SESSION_KEY, normalizedEmail);
    setAccounts(nextAccounts);
    setCurrentUser({ email: normalizedEmail, ...savedProfile });
    setStorageError('');
  }, [accounts]);

  const saveProfile = useCallback(async (profile) => {
    if (!currentUser) throw new Error('Sign in before saving profile information.');
    const account = accounts[currentUser.email];
    if (!account) throw new Error('The local account could not be found.');

    const nextAccount = { ...account, profile: { ...DEFAULT_PROFILE, ...account.profile, ...profile } };
    const nextAccounts = { ...accounts, [currentUser.email]: nextAccount };
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(nextAccounts));
    setAccounts(nextAccounts);
    setCurrentUser({ email: currentUser.email, ...nextAccount.profile });
    setStorageError('');
  }, [accounts, currentUser]);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    setStorageError('');
  }, []);

  const value = useMemo(() => ({
    accounts,
    currentUser,
    loading,
    storageError,
    createAccount,
    login,
    saveProfile,
    logout,
  }), [accounts, currentUser, loading, storageError, createAccount, login, saveProfile, logout]);

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const account = useContext(AccountContext);
  if (!account) throw new Error('useAccount must be used within AccountProvider');
  return account;
}
