import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AccountContext = createContext(null);
const ACCOUNTS_KEY = 'gala-tour-local-accounts-v1';
const SESSION_KEY = 'gala-tour-local-session-v1';
const DEFAULT_PROFILE = {
  name: '',
  jobTitle: '',
  streetAddress: '',
  city: '',
  province: '',
  postalCode: '',
  phone: '',
  country: { name: 'Philippines', flag: '🇵🇭', flagCode: 'ph', code: '+63' },
  profilePhoto: '',
  twitter: '',
  behance: '',
  facebook: '',
  followers: '0',
  following: '0',
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

  const login = useCallback(async ({ email }) => {
    const normalizedEmail = email.trim().toLowerCase();
    let account = accounts[normalizedEmail];

    if (!account) {
      account = { profile: { ...DEFAULT_PROFILE } };
      const nextAccounts = { ...accounts, [normalizedEmail]: account };
      await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(nextAccounts));
      setAccounts(nextAccounts);
    } else {
      account = { ...account, profile: { ...DEFAULT_PROFILE, ...account.profile } };
    }

    await AsyncStorage.setItem(SESSION_KEY, normalizedEmail);
    setCurrentUser({ email: normalizedEmail, ...DEFAULT_PROFILE, ...account.profile });
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
    login,
    saveProfile,
    logout,
  }), [accounts, currentUser, loading, storageError, login, saveProfile, logout]);

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const account = useContext(AccountContext);
  if (!account) throw new Error('useAccount must be used within AccountProvider');
  return account;
}
