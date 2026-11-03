import React, { useEffect, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { SvgUri } from 'react-native-svg';
import Button from '../components/Button';
import Field from '../components/Field';
import { useAppTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { pickPhotos } from '../utils/photos';
import { useAccount } from '../AccountContext';

const PHONE_COUNTRIES = [
  { name: 'Philippines', flag: '🇵🇭', flagCode: 'ph', code: '+63' },
  { name: 'United States', flag: '🇺🇸', flagCode: 'us', code: '+1' },
  { name: 'Canada', flag: '🇨🇦', flagCode: 'ca', code: '+1' },
  { name: 'United Kingdom', flag: '🇬🇧', flagCode: 'gb', code: '+44' },
  { name: 'Australia', flag: '🇦🇺', flagCode: 'au', code: '+61' },
  { name: 'New Zealand', flag: '🇳🇿', flagCode: 'nz', code: '+64' },
  { name: 'Japan', flag: '🇯🇵', flagCode: 'jp', code: '+81' },
  { name: 'South Korea', flag: '🇰🇷', flagCode: 'kr', code: '+82' },
  { name: 'China', flag: '🇨🇳', flagCode: 'cn', code: '+86' },
  { name: 'India', flag: '🇮🇳', flagCode: 'in', code: '+91' },
  { name: 'Singapore', flag: '🇸🇬', flagCode: 'sg', code: '+65' },
  { name: 'Malaysia', flag: '🇲🇾', flagCode: 'my', code: '+60' },
  { name: 'Indonesia', flag: '🇮🇩', flagCode: 'id', code: '+62' },
  { name: 'Thailand', flag: '🇹🇭', flagCode: 'th', code: '+66' },
  { name: 'Vietnam', flag: '🇻🇳', flagCode: 'vn', code: '+84' },
  { name: 'United Arab Emirates', flag: '🇦🇪', flagCode: 'ae', code: '+971' },
  { name: 'Saudi Arabia', flag: '🇸🇦', flagCode: 'sa', code: '+966' },
  { name: 'Germany', flag: '🇩🇪', flagCode: 'de', code: '+49' },
  { name: 'France', flag: '🇫🇷', flagCode: 'fr', code: '+33' },
  { name: 'Italy', flag: '🇮🇹', flagCode: 'it', code: '+39' },
  { name: 'Spain', flag: '🇪🇸', flagCode: 'es', code: '+34' },
  { name: 'Brazil', flag: '🇧🇷', flagCode: 'br', code: '+55' },
  { name: 'Mexico', flag: '🇲🇽', flagCode: 'mx', code: '+52' },
  { name: 'South Africa', flag: '🇿🇦', flagCode: 'za', code: '+27' },
];

const MODES = {
  signIn: 'Sign in',
  register: 'Create account',
  forgotPassword: 'Reset password',
  profile: 'Personal information',
};

export default function AccountScreen() {
  const { background, surface, text, mutedText, border, accent } = useAppTheme();
  const { currentUser, loading, storageError, register, login, saveProfile, logout } = useAccount();
  const [mode, setMode] = useState('signIn');
  const [notice, setNotice] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState(PHONE_COUNTRIES[0]);
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState('');
  const [photoError, setPhotoError] = useState('');

  useEffect(() => {
    if (loading) return;
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setCountry(currentUser.country || PHONE_COUNTRIES[0]);
      setProfilePhoto(currentUser.profilePhoto || '');
      setEmail(currentUser.email);
      setMode('profile');
    } else {
      setMode('signIn');
    }
  }, [currentUser, loading]);

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setNotice('');
  };

  const submit = async () => {
    setNotice('');
    if (mode === 'forgotPassword') {
      setNotice('Password reset is unavailable in local demo mode because no email service is connected.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setNotice('Enter a valid email address.');
      return;
    }
    if (mode === 'profile') {
      if (!name.trim()) {
        setNotice('Enter your full name.');
        return;
      }
      if (!phone.trim()) {
        setNotice('Enter your phone/mobile number.');
        return;
      }
      try {
        await saveProfile({
          name: name.trim(),
          phone: phone.trim(),
          country,
          profilePhoto,
        });
        setNotice('Personal information saved on this device.');
      } catch (error) {
        setNotice(error.message || 'Could not save your profile.');
      }
      return;
    }
    if (password.length < 8) {
      setNotice('Password must contain at least 8 characters.');
      return;
    }
    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          setNotice('The passwords do not match.');
          return;
        }
        await register({ email, password });
        setMode('profile');
        setNotice('Account created on this device. Complete your personal information below.');
      } else {
        await login({ email, password });
        setMode('profile');
        setNotice('');
      }
    } catch (error) {
      setNotice(error.message || 'Could not complete the account request.');
    }
  };

  const chooseProfilePhoto = async () => {
    setPhotoError('');
    try {
      const photos = await pickPhotos(false);
      if (photos.length) setProfilePhoto(photos[0]);
    } catch (error) {
      setPhotoError(`Could not choose a profile photo: ${error.message || error}`);
    }
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: background }]}
      contentContainerStyle={[styles.content, mode === 'profile' && styles.profileContent]}
      keyboardShouldPersistTaps="handled"
    >
      {mode !== 'profile' ? (
        <View style={[styles.iconCircle, { backgroundColor: accent }]}>
          <Icon name="account-outline" size={38} color="#FFFFFF" />
        </View>
      ) : null}
      <Text style={[styles.title, mode === 'profile' && styles.profileTitle, { color: text }]}>
        {loading ? 'Loading account…' : MODES[mode]}
      </Text>
      <Text style={[styles.subtitle, mode === 'profile' && styles.profileSubtitle, { color: mutedText }]}>
        {loading
          ? 'Checking local account information.'
          : mode === 'signIn'
          ? 'Sign in to your Gala Tour account.'
          : mode === 'register'
          ? 'Demo account only: credentials are stored on this device and do not sync.'
          : mode === 'profile'
          ? 'Review your profile details.'
          : 'Enter your email to reset your password.'}
      </Text>

      {storageError ? <Text style={styles.error}>{storageError}</Text> : null}
      {!loading && (
      <View style={[
        styles.form,
        mode === 'profile' && styles.profileForm,
        mode !== 'profile' && { backgroundColor: surface, borderColor: border },
      ]}>
        {mode === 'profile' ? (
          <>
            <View style={[styles.profileHeader, { borderBottomColor: border }]}>
              {profilePhoto ? (
                <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
              ) : (
                <View style={[styles.profilePhoto, styles.photoPlaceholder, { backgroundColor: surface, borderColor: border }]}>
                  <Icon name="account" size={40} color={mutedText} />
                </View>
              )}
              <View style={styles.profileIdentity}>
                <Text style={[styles.profileName, { color: text }]}>{name || 'Your profile'}</Text>
                <Text style={[styles.accountEmail, { color: mutedText }]}>{currentUser?.email}</Text>
                <AccountLink
                  label={profilePhoto ? 'Change photo' : 'Add profile photo'}
                  onPress={chooseProfilePhoto}
                  color={accent}
                />
              </View>
            </View>
            {photoError ? <Text style={styles.fieldError}>{photoError}</Text> : null}
            <Text style={[styles.sectionLabel, { color: mutedText }]}>PROFILE DETAILS</Text>
            <Field
              label="Full name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              textContentType="name"
              placeholder="Your full name"
            />
            <Text style={[styles.fieldLabel, { color: text }]}>Country of residence</Text>
            <Pressable
              style={[styles.countryButton, { backgroundColor: surface, borderColor: border }]}
              onPress={() => setCountryPickerVisible(true)}
              accessibilityRole="button"
              accessibilityLabel={`Choose country of residence. Current country: ${country.name}`}
            >
              <CountryFlag key={country.flagCode} country={country} fallback={PHONE_COUNTRIES[0]} />
              <Text style={[styles.countryName, { color: text }]}>{country.name}</Text>
              <Icon name="chevron-down" size={22} color={mutedText} />
            </Pressable>
            <View style={styles.phoneLabelRow}>
              <Text style={[styles.fieldLabel, { color: text }]}>Phone/mobile number</Text>
            </View>
            <View style={[styles.phoneInput, { backgroundColor: surface, borderColor: border }]}>
              <View style={[styles.phoneCode, { borderRightColor: border }]}>
                <CountryFlag key={country.flagCode} country={country} fallback={PHONE_COUNTRIES[0]} style={styles.phoneFlag} />
                <Text style={[styles.dialCodeLabel, { color: text }]}>{country.code}</Text>
              </View>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                placeholder="Enter your number"
                placeholderTextColor="#8A979C"
                style={[styles.phoneTextInput, { color: text }]}
              />
            </View>
          </>
        ) : null}
        {mode !== 'profile' ? (
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            placeholder="you@example.com"
          />
        ) : null}
        {mode !== 'forgotPassword' && mode !== 'profile' ? (
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType={mode === 'register' ? 'newPassword' : 'password'}
            placeholder="Enter your password"
          />
        ) : null}
        {mode === 'register' ? (
          <Field
            label="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            textContentType="newPassword"
            placeholder="Re-enter your password"
          />
        ) : null}

        <Button
          label={mode === 'signIn'
            ? 'Sign in'
            : mode === 'register'
            ? 'Create account'
            : mode === 'profile'
            ? 'Save profile'
            : 'Send reset link'}
          icon={mode === 'forgotPassword' ? 'email-outline' : mode === 'profile' ? 'content-save-outline' : 'login'}
          onPress={submit}
          style={styles.submitButton}
        />
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

        {mode === 'signIn' ? (
          <AccountLink
            label="Forgot password?"
            onPress={() => changeMode('forgotPassword')}
            color={accent}
          />
        ) : null}
      </View>
      )}

      {!loading && <View style={styles.modeSwitch}>
        <Text style={[styles.modePrompt, { color: mutedText }]}>
          {mode === 'profile'
            ? 'Finished viewing your profile?'
            : mode === 'register'
            ? 'Already have an account?'
            : 'New to Gala Tour?'}
        </Text>
        <AccountLink
          label={mode === 'profile' ? 'Sign out' : mode === 'register' ? 'Sign in' : 'Register'}
          onPress={async () => {
            if (mode === 'profile') {
              try {
                await logout();
                setName('');
                setPhone('');
                setProfilePhoto('');
                setPassword('');
                setConfirmPassword('');
              } catch (error) {
                setNotice(error.message || 'Could not sign out.');
              }
            } else {
              changeMode(mode === 'register' ? 'signIn' : 'register');
            }
          }}
          color={accent}
        />
      </View>}
      {!loading && mode === 'forgotPassword' ? (
        <AccountLink
          label="Back to sign in"
          onPress={() => changeMode('signIn')}
          color={accent}
          style={styles.backLink}
        />
      ) : null}
      <Modal
        visible={countryPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCountryPickerVisible(false)}
      >
        <View style={styles.modalLayer}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setCountryPickerVisible(false)}
            accessibilityRole="button"
            accessibilityLabel="Close country picker"
          />
          <View style={[styles.countryModal, { backgroundColor: surface, borderColor: border }]}>
            <Text style={[styles.countryModalTitle, { color: text }]}>Choose your country</Text>
            <ScrollView style={styles.countryList} keyboardShouldPersistTaps="handled">
              {PHONE_COUNTRIES.map((item) => (
                <Pressable
                  key={item.name}
                  style={[styles.countryOption, { borderBottomColor: border }]}
                  onPress={() => {
                    setCountry(item);
                    setCountryPickerVisible(false);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.name}, dialing code ${item.code}`}
                >
                  <CountryFlag country={item} fallback={PHONE_COUNTRIES[0]} />
                  <Text style={[styles.countryName, { color: text }]}>{item.name}</Text>
                  <Text style={[styles.countryCode, { color: mutedText }]}>{item.code}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function AccountLink({ label, onPress, color, style }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={style}>
      <Text style={[styles.link, { color }]}>{label}</Text>
    </Pressable>
  );
}

function CountryFlag({ country, fallback, style }) {
  const [failed, setFailed] = useState(false);
  const countryCode = country.flagCode
    || PHONE_COUNTRIES.find((item) => item.name === country.name)?.flagCode
    || fallback.flagCode;

  if (failed) {
    return <Text style={[styles.countryFlagFallback, style]}>{country.flag || fallback.flag}</Text>;
  }
  return (
    <SvgUri
      uri={`https://hatscripts.github.io/circle-flags/flags/${countryCode}.svg`}
      style={[styles.countryFlagImage, style]}
      onError={() => setFailed(true)}
      accessibilityLabel={`${country.name} flag`}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flexGrow: 1, alignItems: 'center', padding: 20, paddingTop: 40, paddingBottom: 36 },
  profileContent: { alignItems: 'stretch', paddingTop: 24 },
  profileTitle: { width: '100%', maxWidth: 520, alignSelf: 'center', textAlign: 'left', fontSize: 26 },
  profileSubtitle: { width: '100%', maxWidth: 520, alignSelf: 'center', textAlign: 'left', marginBottom: 16 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontFamily: fonts.serif, fontSize: 28, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 6, marginBottom: 24 },
  form: {
    width: '100%',
    maxWidth: 480,
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
  },
  profileForm: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    borderWidth: 0,
    borderRadius: 0,
    padding: 0,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
    marginBottom: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  profilePhoto: { width: 84, height: 84, borderRadius: 42, marginRight: 16 },
  profileIdentity: { flex: 1, alignItems: 'flex-start', gap: 5 },
  profileName: { fontSize: 19, fontWeight: '700' },
  accountEmail: { fontSize: 14 },
  photoPlaceholder: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  sectionLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 14 },
  fieldError: { color: '#A8432F', fontSize: 13, lineHeight: 18, marginTop: 8, textAlign: 'center' },
  fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  countryButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  countryFlagImage: {
    width: 32,
    height: 32,
    marginRight: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  countryFlagFallback: {
    fontSize: 20,
    width: 32,
    height: 32,
    lineHeight: 32,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 10,
    textAlign: 'center',
  },
  countryName: { flex: 1, fontSize: 15 },
  phoneLabelRow: { flexDirection: 'row', alignItems: 'center' },
  phoneInput: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
  },
  phoneCode: { height: 48, flexDirection: 'row', alignItems: 'center', borderRightWidth: 1, paddingHorizontal: 12 },
  phoneFlag: { width: 28, height: 28, borderRadius: 14, marginRight: 6 },
  dialCodeLabel: { fontSize: 14, fontWeight: '600' },
  phoneTextInput: { flex: 1, minWidth: 0, paddingHorizontal: 12, paddingVertical: 11, fontSize: 16 },
  modalLayer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  countryModal: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '80%',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 8,
  },
  countryModalTitle: { fontFamily: fonts.serif, fontSize: 20, fontWeight: '700', marginBottom: 8 },
  countryList: { flexGrow: 0 },
  countryOption: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  countryCode: { fontSize: 14, marginLeft: 8 },
  submitButton: { marginTop: 4 },
  notice: { fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 12 },
  modeSwitch: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 20 },
  modePrompt: { fontSize: 14 },
  link: { fontSize: 14, fontWeight: '700' },
  backLink: { marginTop: 18 },
});
