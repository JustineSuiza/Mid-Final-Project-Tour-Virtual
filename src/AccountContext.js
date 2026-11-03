import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { pbkdf2Async } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';

const AccountContext = createContext(null);
const ACCOUNTS_KEY = 'gala-tour-local-accounts-v1';
const SESSION_KEY = 'gala-tour-local-session-v1';
const PASSWORD_HASH_ITERATIONS = 310_000;

async function hashPassword(password, salt) {
  const hash = await pbkdf2Async(sha256, password, salt, {
    c: PASSWORD_HASH_ITERATIONS,
    dkLen: 32,
  });
  return bytesToHex(hash);
}

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
        ? { email: savedEmail, ...parsedAccounts[savedEmail].profile }
        : null);
    }).catch((error) => {
      if (active) setStorageError(`Could not load local account data: ${error.message || error}`);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const register = useCallback(async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (accounts[normalizedEmail]) throw new Error('An account with this email already exists on this device.');

    const salt = await Crypto.getRandomBytesAsync(16);
    const record = {
      salt: bytesToHex(salt),
      passwordHash: await hashPassword(password, salt),
      profile: {
        name: '',
        phone: '',
        country: { name: 'Philippines', flag: '🇵🇭', code: '+63' },
        profilePhoto: '',
      },
    };
    const nextAccounts = { ...accounts, [normalizedEmail]: record };
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(nextAccounts));
    await AsyncStorage.setItem(SESSION_KEY, normalizedEmail);
    setAccounts(nextAccounts);
    setCurrentUser({ email: normalizedEmail, ...record.profile });
    setStorageError('');
  }, [accounts]);

  const login = useCallback(async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const account = accounts[normalizedEmail];
    if (!account) throw new Error('No local account was found for this email.');

    const salt = Uint8Array.from(account.salt.match(/.{2}/g).map((byte) => parseInt(byte, 16)));
    const candidateHash = await hashPassword(password, salt);
    if (candidateHash !== account.passwordHash) throw new Error('The password is incorrect.');

    await AsyncStorage.setItem(SESSION_KEY, normalizedEmail);
    setCurrentUser({ email: normalizedEmail, ...account.profile });
    setStorageError('');
  }, [accounts]);

  const saveProfile = useCallback(async (profile) => {
    if (!currentUser) throw new Error('Sign in before saving profile information.');
    const account = accounts[currentUser.email];
    if (!account) throw new Error('The local account could not be found.');

    const nextAccount = { ...account, profile: { ...account.profile, ...profile } };
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
    register,
    login,
    saveProfile,
    logout,
  }), [accounts, currentUser, loading, storageError, register, login, saveProfile, logout]);

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const account = useContext(AccountContext);
  if (!account) throw new Error('useAccount must be used within AccountProvider');
  return account;
}
