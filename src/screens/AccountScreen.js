import React, { useEffect, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { FontAwesome6, MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../components/Button';
import Field from '../components/Field';
import { useAppTheme } from '../ThemeContext';
import { fonts } from '../theme';
import { pickPhotos } from '../utils/photos';
import { useAccount } from '../AccountContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  profile: 'Personal information',
};

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { background, surface, text, mutedText, border, accent } = useAppTheme();
  const { currentUser, loading, storageError, login, saveProfile, logout } = useAccount();
  const [mode, setMode] = useState('signIn');
  const [profileView, setProfileView] = useState('preview');
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [notice, setNotice] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [twitter, setTwitter] = useState('');
  const [google, setGoogle] = useState('');
  const [facebook, setFacebook] = useState('');
  const [country, setCountry] = useState(PHONE_COUNTRIES[0]);
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState('');
  const [photoError, setPhotoError] = useState('');

  useEffect(() => {
    if (loading) return;
    if (currentUser) {
      setName(currentUser.name || '');
      setStreetAddress(currentUser.streetAddress || '');
      setCity(currentUser.city || '');
      setProvince(currentUser.province || '');
      setPostalCode(currentUser.postalCode || '');
      setBirthDate(currentUser.birthDate || '');
      setPhone(currentUser.phone || '');
      setAboutMe(currentUser.aboutMe || currentUser.jobTitle || '');
      setTwitter(currentUser.twitter || '');
      setGoogle(currentUser.google || '');
      setFacebook(currentUser.facebook || '');
      setCountry(currentUser.country || PHONE_COUNTRIES[0]);
      setProfilePhoto(currentUser.profilePhoto || '');
      setEmail(currentUser.email);
      setMode('profile');
      setProfileView('preview');
    } else {
      setMode('signIn');
    }
  }, [currentUser, loading]);

  const submit = async () => {
    setNotice('');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setNotice('Enter a valid email address.');
      return;
    }
    if (mode === 'profile') {
      const hasMissingFields = [name, streetAddress, city, province, postalCode, phone]
        .some((value) => !value.trim());
      if (hasMissingFields) {
        setWarningMessage('Please complete all required fields.');
        return;
      }
      try {
        await saveProfile({
          name: name.trim(),
          streetAddress: streetAddress.trim(),
          city: city.trim(),
          province: province.trim(),
          postalCode: postalCode.trim(),
          birthDate: birthDate.trim(),
          phone: phone.trim(),
          country,
          profilePhoto,
          aboutMe: aboutMe.trim(),
          twitter: twitter.trim(),
          google: google.trim(),
          facebook: facebook.trim(),
        });
        setProfileView('preview');
        setNotice('Personal information updated.');
      } catch (error) {
        setNotice(error.message || 'Could not save your profile.');
      }
      return;
    }
    if (!password) {
      setNotice('Enter a password to continue.');
      return;
    }
    try {
      await login({ email });
      setMode('profile');
      setNotice('Signed in to your local demo account.');
    } catch (error) {
      setNotice(error.message || 'Could not complete the account request.');
    }
  };

  const isEditingProfile = profileView === 'edit';

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
      contentContainerStyle={[
        styles.content,
        mode === 'profile' && styles.profileContent,
        { paddingTop: mode === 'profile' ? insets.top : Math.max(insets.top, 40) },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {mode !== 'profile' ? (
        <View style={[styles.iconCircle, { backgroundColor: accent }]}>
          <Icon name="account-outline" size={38} color="#FFFFFF" />
        </View>
      ) : null}
      {mode !== 'profile' ? (
        <>
          <Text style={[styles.title, { color: text }]}>
            {loading ? 'Loading account…' : MODES[mode]}
          </Text>
          <Text style={[styles.subtitle, { color: mutedText }]}>
            {loading
              ? 'Checking local account information.'
              : 'Demo sign-in: enter an email and any password to continue.'}
          </Text>
        </>
      ) : null}

      {storageError ? <Text style={styles.error}>{storageError}</Text> : null}
      {!loading && (
      <View style={[
        styles.form,
        mode === 'profile' && styles.profileForm,
        mode !== 'profile' && { backgroundColor: surface, borderColor: border },
      ]}>
        {mode === 'profile' ? (
          <>
            <LinearGradient
              colors={['#302CF4', '#6768F5', '#9381ED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.profileBanner}
            >
              <View style={styles.bannerTop}>
                <Text style={styles.bannerTitle}>Personal Information</Text>
                <Pressable
                  onPress={() => setProfileMenuVisible(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Profile options"
                  hitSlop={10}
                >
                  <Icon name="account-cog-outline" size={20} color="#FFFFFF" />
                </Pressable>
              </View>
              <Pressable
                onPress={isEditingProfile ? chooseProfilePhoto : undefined}
                disabled={!isEditingProfile}
                accessibilityRole="button"
                accessibilityLabel="Choose profile picture"
                style={styles.avatarButton}
              >
                {profilePhoto ? (
                  <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Icon name="account" size={40} color="#6B72DF" />
                  </View>
                )}
              </Pressable>
              {isEditingProfile ? (
                <AccountLink
                  label={profilePhoto ? 'Change profile photo' : 'Add profile photo'}
                  onPress={chooseProfilePhoto}
                  color="#FFFFFF"
                  style={styles.bannerPhotoLink}
                />
              ) : null}
              {isEditingProfile ? (
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Full name"
                  placeholderTextColor="rgba(255,255,255,0.75)"
                  autoCapitalize="words"
                  textContentType="name"
                  style={styles.bannerNameInput}
                  accessibilityLabel="Full name"
                />
              ) : (
                <Text style={styles.bannerNameText}>{name || 'Full name'}</Text>
              )}
              <Text style={styles.aboutMeLabel}>About myself</Text>
              {isEditingProfile ? (
                <TextInput
                  value={aboutMe}
                  onChangeText={setAboutMe}
                  placeholder="Write a little about yourself"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  multiline
                  textAlignVertical="top"
                  style={styles.aboutMeInput}
                  accessibilityLabel="About myself"
                />
              ) : (
                <Text style={styles.aboutMeText}>
                  {aboutMe || 'Write a little about yourself'}
                </Text>
              )}
            </LinearGradient>

            {photoError ? <Text style={styles.fieldError}>{photoError}</Text> : null}
            <View style={styles.profileDetails}>
              <ProfileRow
                icon="email-outline"
                label="Email"
                value={currentUser?.email || ''}
                editable={false}
                text={text}
                mutedText={mutedText}
                border={border}
              />
              <ProfileRow
                icon="map-marker-outline"
                label="Country"
                value={country.name}
                editable={false}
                flag={<CountryFlag key={country.flagCode} country={country} fallback={PHONE_COUNTRIES[0]} style={styles.rowFlag} />}
                onPress={isEditingProfile ? () => setCountryPickerVisible(true) : undefined}
                text={text}
                mutedText={mutedText}
                border={border}
              />
              <ProfileRow
                icon="home-city-outline"
                label="Street address"
                value={streetAddress}
                onChangeText={setStreetAddress}
                editable={isEditingProfile}
                placeholder="e.g. 123 Rizal Street"
                text={text}
                mutedText={mutedText}
                border={border}
              />
              <ProfileRow
                icon="city-variant-outline"
                label="City"
                value={city}
                onChangeText={setCity}
                editable={isEditingProfile}
                placeholder="e.g. Calamba"
                text={text}
                mutedText={mutedText}
                border={border}
              />
              <ProfileRow
                icon="map-outline"
                label="Province"
                value={province}
                onChangeText={setProvince}
                editable={isEditingProfile}
                placeholder="e.g. Laguna"
                text={text}
                mutedText={mutedText}
                border={border}
              />
              <ProfileRow
                icon="mailbox-outline"
                label="Postal code"
                value={postalCode}
                onChangeText={setPostalCode}
                editable={isEditingProfile}
                placeholder="e.g. 4027"
                text={text}
                mutedText={mutedText}
                border={border}
              />
              <ProfileRow
                icon="cake-variant"
                label="Birth date"
                value={birthDate}
                onChangeText={setBirthDate}
                editable={isEditingProfile}
                keyboardType="numbers-and-punctuation"
                placeholder="MM/DD/YYYY"
                text={text}
                mutedText={mutedText}
                border={border}
              />
              <ProfileRow
                icon="cellphone"
                label="Mobile"
                value={phone}
                onChangeText={setPhone}
                editable={isEditingProfile}
                keyboardType="phone-pad"
                prefix={<CountryFlag key={country.flagCode} country={country} fallback={PHONE_COUNTRIES[0]} style={styles.rowFlag} />}
                prefixText={country.code}
                placeholder="e.g. 912 345 6789"
                text={text}
                mutedText={mutedText}
                border={border}
              />
              <ProfileRow
                icon="x-twitter"
                IconComponent={FontAwesome6}
                label="X (optional)"
                value={twitter}
                onChangeText={setTwitter}
                editable={isEditingProfile}
                placeholder="@juantravels"
                text={text}
                mutedText={mutedText}
                border={border}
              />
              <ProfileRow
                icon="google"
                IconComponent={FontAwesome6}
                label="Google (optional)"
                value={google}
                onChangeText={setGoogle}
                editable={isEditingProfile}
                placeholder="e.g. google.com/username"
                text={text}
                mutedText={mutedText}
                border={border}
              />
              <ProfileRow
                icon="facebook"
                label="Facebook (optional)"
                value={facebook}
                onChangeText={setFacebook}
                editable={isEditingProfile}
                placeholder="e.g. facebook.com/username"
                text={text}
                mutedText={mutedText}
                border={border}
                last
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
        {mode !== 'profile' ? (
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
            placeholder="Enter any password"
          />
        ) : null}

        {mode !== 'profile' ? <Button
          label="Sign in"
          icon="login"
          onPress={submit}
          style={styles.submitButton}
        /> : null}
        {mode === 'profile' && isEditingProfile ? (
          <AccountLink
            label="Update"
            onPress={submit}
            color={accent}
            style={styles.saveChangesLink}
          />
        ) : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

      </View>
      )}

      {!loading && mode === 'profile' ? <View style={styles.modeSwitch}>
        <AccountLink
          label="Sign out"
          onPress={async () => {
            try {
              await logout();
              setName('');
              setPhone('');
              setProfilePhoto('');
              setPassword('');
            } catch (error) {
              setNotice(error.message || 'Could not sign out.');
            }
          }}
          color={accent}
        />
      </View> : null}
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
      <Modal
        visible={profileMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileMenuVisible(false)}
      >
        <View style={styles.profileMenuOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setProfileMenuVisible(false)}
            accessibilityRole="button"
            accessibilityLabel="Close profile options"
          />
          <View style={[styles.profileMenu, { backgroundColor: surface, borderColor: border }]}>
            <Pressable
              style={styles.profileMenuItem}
              onPress={() => {
                setProfileView('edit');
                setNotice('');
                setProfileMenuVisible(false);
              }}
              accessibilityRole="button"
            >
              <Icon name="pencil-outline" size={20} color={accent} />
              <Text style={[styles.profileMenuText, { color: text }]}>Edit</Text>
            </Pressable>
            <View style={[styles.profileMenuDivider, { backgroundColor: border }]} />
            <Pressable
              style={styles.profileMenuItem}
              onPress={() => {
                setProfileView('preview');
                setProfileMenuVisible(false);
              }}
              accessibilityRole="button"
            >
              <Icon name="eye-outline" size={20} color={accent} />
              <Text style={[styles.profileMenuText, { color: text }]}>Preview</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal
        visible={!!warningMessage}
        transparent
        animationType="fade"
        onRequestClose={() => setWarningMessage('')}
      >
        <View style={styles.warningOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setWarningMessage('')}
            accessibilityRole="button"
            accessibilityLabel="Close warning"
          />
          <View style={[styles.warningPopover, { backgroundColor: surface, borderColor: border }]}>
            <Icon name="alert-circle-outline" size={20} color="#B45309" />
            <Text style={[styles.warningMessage, { color: mutedText }]}>{warningMessage}</Text>
            <Pressable
              onPress={() => setWarningMessage('')}
              accessibilityRole="button"
              accessibilityLabel="Dismiss warning"
              hitSlop={8}
            >
              <Icon name="close" size={18} color={mutedText} />
            </Pressable>
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

function ProfileRow({
  icon,
  IconComponent = Icon,
  label,
  value,
  onChangeText,
  onPress,
  editable = true,
  keyboardType,
  placeholder,
  prefix,
  prefixText,
  text,
  mutedText,
  border,
  last = false,
}) {
  const content = (
    <>
      <IconComponent name={icon} size={19} color={mutedText} />
      <View style={[styles.profileRowContent, !last && { borderBottomColor: border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
        <Text style={[styles.profileRowLabel, { color: mutedText }]}>{label}</Text>
        <View style={styles.profileRowValue}>
          {prefix}
          {prefixText ? <Text style={[styles.profileRowPrefixText, { color: text }]}>{prefixText}</Text> : null}
          {editable ? (
            <TextInput
              value={value}
              onChangeText={onChangeText}
              keyboardType={keyboardType}
              placeholder={placeholder}
              placeholderTextColor="#8A979C"
              style={[styles.profileRowInput, { color: text }]}
              accessibilityLabel={label}
            />
          ) : (
            <Text style={[styles.profileRowText, { color: text }]} numberOfLines={1}>{value}</Text>
          )}
          {onPress ? <Icon name="chevron-right" size={20} color={mutedText} /> : null}
        </View>
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={styles.profileRow}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value}. Change`}
      >
        {content}
      </Pressable>
    );
  }
  return <View style={styles.profileRow}>{content}</View>;
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
    <Image
      source={{ uri: `https://flagcdn.com/w80/${countryCode}.png` }}
      style={[styles.countryFlagImage, style]}
      resizeMode="cover"
      onError={() => setFailed(true)}
      accessibilityLabel={`${country.name} flag`}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flexGrow: 1, alignItems: 'center', padding: 20, paddingTop: 40, paddingBottom: 36 },
  profileContent: { alignItems: 'stretch', paddingTop: 0 },
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
    maxWidth: '100%',
    alignSelf: 'stretch',
    borderWidth: 0,
    borderRadius: 0,
    padding: 0,
  },
  profileBanner: {
    minHeight: 290,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
    marginHorizontal: -20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  bannerTop: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bannerTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  avatarButton: { marginTop: 18 },
  profilePhoto: { width: 78, height: 78, borderRadius: 39, borderWidth: 2, borderColor: '#FFFFFF' },
  photoPlaceholder: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  bannerPhotoLink: { marginTop: 5 },
  bannerNameInput: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    minWidth: 160,
    marginTop: 6,
  },
  bannerNameText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', textAlign: 'center', marginTop: 6 },
  aboutMeLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', marginTop: 8 },
  aboutMeInput: {
    width: '100%',
    minHeight: 64,
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 4,
  },
  aboutMeText: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 8,
  },
  profileDetails: {
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  profileRow: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileRowContent: { flex: 1, minHeight: 62, justifyContent: 'center', paddingVertical: 9, gap: 3 },
  profileRowLabel: { fontSize: 12 },
  profileRowValue: { minHeight: 24, flexDirection: 'row', alignItems: 'center', gap: 6 },
  profileRowText: { flex: 1, fontSize: 14 },
  profileRowInput: { flex: 1, minWidth: 0, fontSize: 14, paddingVertical: 2 },
  profileRowPrefixText: { fontSize: 14, fontWeight: '600' },
  rowFlag: { width: 26, height: 26, borderRadius: 13, marginRight: 0 },
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
  warningOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  warningPopover: {
    width: '100%',
    maxWidth: 380,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  profileMenuOverlay: {
    flex: 1,
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: 56,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  profileMenu: {
    width: 180,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 4,
  },
  profileMenuItem: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14 },
  profileMenuText: { fontSize: 15, fontWeight: '600' },
  profileMenuDivider: { height: StyleSheet.hairlineWidth, marginHorizontal: 12 },
  warningMessage: { flex: 1, fontSize: 14, lineHeight: 20 },
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
  saveChangesLink: { alignSelf: 'flex-end', paddingVertical: 12, paddingHorizontal: 4 },
  notice: { fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 12 },
  modeSwitch: { width: '100%', alignItems: 'flex-end', marginTop: 20, marginBottom: 24 },
  link: { fontSize: 14, fontWeight: '700' },
  backLink: { marginTop: 18 },
});
