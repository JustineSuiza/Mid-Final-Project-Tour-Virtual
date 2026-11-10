import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { FontAwesome6, MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DatePickerModal from '../components/DatePickerModal';
import { useAppTheme } from '../ThemeContext';
import { colors, fonts } from '../theme';
import { pickPhotos } from '../utils/photos';
import { confirmAction } from '../utils/confirm';
import { useAccount } from '../AccountContext';
import { getProgressDashboard } from '../db/database';
import { levelMeta } from '../utils/progressStats';

export const PHONE_COUNTRIES = [
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

function getInitials(fullName) {
  if (!fullName || !fullName.trim()) return 'CT';
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(dateStr).trim());
  if (match) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const m = parseInt(match[1], 10) - 1;
    const d = parseInt(match[2], 10);
    const y = parseInt(match[3], 10);
    if (m >= 0 && m < 12) {
      return `${months[m]} ${d}, ${y}`;
    }
  }
  return dateStr;
}

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, background, surface, text, mutedText, border, accent } = useAppTheme();
  const { currentUser, loading, storageError, login, saveProfile, logout } = useAccount();

  const [mode, setMode] = useState('signIn');
  const [profileView, setProfileView] = useState('preview'); // 'preview' | 'edit'
  const [notice, setNotice] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  // Form states
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
  const [profilePhoto, setProfilePhoto] = useState('');
  const [photoError, setPhotoError] = useState('');

  // Modals & Search
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [birthDatePickerVisible, setBirthDatePickerVisible] = useState(false);

  // Explorer Progress Stats
  const [progressData, setProgressData] = useState(null);

  // Animated feedback
  const toastFade = useRef(new Animated.Value(0)).current;

  // Load account data
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
      setEmail(currentUser.email || '');
      setMode('profile');
    } else {
      setMode('signIn');
    }
  }, [currentUser, loading]);

  // Load explorer stats for profile header
  useEffect(() => {
    let active = true;
    getProgressDashboard()
      .then((data) => {
        if (active && data) setProgressData(data);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [currentUser]);

  // Toast notification timer
  useEffect(() => {
    if (notice) {
      Animated.timing(toastFade, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }).start();
      const timer = setTimeout(() => {
        Animated.timing(toastFade, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setNotice(''));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notice, toastFade]);

  const rankInfo = useMemo(() => {
    return levelMeta(progressData?.xp || 0);
  }, [progressData?.xp]);

  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return PHONE_COUNTRIES;
    return PHONE_COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [countrySearch]);

  const isEditingProfile = profileView === 'edit';

  const chooseProfilePhoto = async () => {
    setPhotoError('');
    try {
      const photos = await pickPhotos(false);
      if (photos.length) {
        setProfilePhoto(photos[0]);
      }
    } catch (error) {
      setPhotoError(`Could not select photo: ${error.message || error}`);
    }
  };

  const removeProfilePhoto = () => {
    setProfilePhoto('');
    setPhotoError('');
  };

  const prefillSampleData = () => {
    setName('Jose Rizal');
    setStreetAddress('Real Street, Poblacion');
    setCity('Calamba');
    setProvince('Laguna');
    setPostalCode('4027');
    setBirthDate('06/19/1861');
    setPhone('917 186 1896');
    setAboutMe('Writer, polymath, and explorer of historical landmarks and nature trails across Calabarzon.');
    setTwitter('@jrizal_hero');
    setCountry(PHONE_COUNTRIES[0]);
    setNotice('Prefilled sample explorer details.');
  };

  const cancelEdit = () => {
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
    }
    setWarningMessage('');
    setPhotoError('');
    setProfileView('preview');
  };

  const submit = async () => {
    setNotice('');
    setWarningMessage('');

    if (mode === 'profile') {
      const requiredList = [
        { label: 'Full name', val: name },
        { label: 'Street address', val: streetAddress },
        { label: 'City', val: city },
        { label: 'Province', val: province },
        { label: 'Postal code', val: postalCode },
        { label: 'Mobile phone', val: phone },
      ];
      const missing = requiredList.filter((item) => !item.val.trim());
      if (missing.length > 0) {
        setWarningMessage(`Please complete all required fields:\n• ${missing.map((m) => m.label).join('\n• ')}`);
        return;
      }

      setIsSaving(true);
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
        setNotice('Personal information updated successfully!');
      } catch (error) {
        setNotice(error.message || 'Could not save profile.');
      } finally {
        setIsSaving(false);
      }
      return;
    }

    // Sign in mode validation
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setNotice('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setNotice('Please enter a password to continue.');
      return;
    }

    setIsSaving(true);
    try {
      await login({ email });
      setMode('profile');
      setNotice('Welcome back! Signed into your Calabarzon Tour account.');
    } catch (error) {
      setNotice(error.message || 'Could not complete sign in.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsSaving(true);
    setNotice('');
    try {
      await login({ email: 'traveler@calabarzon.ph' });
      setMode('profile');
      setNotice('Signed into Demo Explorer account.');
    } catch (error) {
      setNotice(error.message || 'Could not log into demo account.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    confirmAction({
      title: 'Sign Out',
      message: 'Are you sure you want to log out of your Calabarzon Tour account on this device?',
      confirmLabel: 'Sign Out',
      onConfirm: async () => {
        try {
          await logout();
          setName('');
          setPhone('');
          setProfilePhoto('');
          setPassword('');
          setNotice('You have been signed out.');
        } catch (error) {
          setNotice(error.message || 'Could not sign out.');
        }
      },
    });
  };

  // Modern UI theme variables
  const inputBg = isDark ? '#192634' : '#F7FAFC';
  const heroGradients = isDark
    ? ['#051820', '#0D3845', '#165C6D']
    : ['#072832', '#0F4C5C', '#1B6A7D'];

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: insets.top, paddingBottom: insets.bottom + 48 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: mutedText }]}>
              Loading account information…
            </Text>
          </View>
        )}

        {/* Storage Error */}
        {storageError ? (
          <View style={styles.errorBanner}>
            <Icon name="alert-circle-outline" size={20} color="#D64545" />
            <Text style={styles.errorBannerText}>{storageError}</Text>
          </View>
        ) : null}

        {!loading && mode === 'profile' && (
          <>
            {/* HERO PASSPORT BANNER (PRESERVED AS REQUESTED) */}
            <LinearGradient
              colors={heroGradients}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroBanner}
            >
              <View style={styles.heroInnerContainer}>
                {/* Decorative background glow circles */}
                <View style={styles.glowCircleTopRight} />
                <View style={styles.glowCircleBottomLeft} />

                {/* Top Navigation Row: Passport Badge & Segmented Control */}
                <View style={styles.bannerHeaderRow}>
                  <View style={styles.passportBadge}>
                    <Icon name="compass-outline" size={15} color="#F5B942" />
                    <Text style={styles.passportBadgeText}>PERSONAL INFORMATION</Text>
                  </View>

                  {/* View / Edit Mode Segmented Control */}
                  <View style={styles.segmentedControl}>
                    <Pressable
                      onPress={() => {
                        setProfileView('preview');
                        setNotice('');
                      }}
                      style={[
                        styles.segmentedTab,
                        !isEditingProfile && styles.segmentedTabActive,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel="Preview Mode"
                    >
                      <Icon
                        name="eye-outline"
                        size={14}
                        color={!isEditingProfile ? '#072832' : 'rgba(255,255,255,0.78)'}
                      />
                      <Text
                        style={[
                          styles.segmentedTabText,
                          !isEditingProfile && styles.segmentedTabTextActive,
                        ]}
                      >
                        View
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => {
                        setProfileView('edit');
                        setNotice('');
                      }}
                      style={[
                        styles.segmentedTab,
                        isEditingProfile && styles.segmentedTabActive,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel="Edit Profile Mode"
                    >
                      <Icon
                        name="pencil-outline"
                        size={14}
                        color={isEditingProfile ? '#072832' : 'rgba(255,255,255,0.78)'}
                      />
                      <Text
                        style={[
                          styles.segmentedTabText,
                          isEditingProfile && styles.segmentedTabTextActive,
                        ]}
                      >
                        Edit
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* Avatar Centerpiece */}
                <SlideIn key={profileView} from={isEditingProfile ? 36 : -36} style={styles.avatarSection}>
                  <Pressable
                    onPress={isEditingProfile ? chooseProfilePhoto : undefined}
                    disabled={!isEditingProfile}
                    style={styles.avatarRingOuter}
                    accessibilityRole="button"
                    accessibilityLabel={isEditingProfile ? "Change profile picture" : "Profile picture"}
                  >
                    <View style={styles.avatarRingInner}>
                      {profilePhoto ? (
                        <Image source={{ uri: profilePhoto }} style={styles.avatarImage} />
                      ) : (
                        <LinearGradient
                          colors={['#1F8396', '#114E5C', '#0A313A']}
                          style={styles.avatarFallback}
                        >
                          <Text style={styles.avatarInitials}>{getInitials(name)}</Text>
                        </LinearGradient>
                      )}
                    </View>

                    {/* Camera Badge in Edit Mode */}
                    {isEditingProfile && (
                      <View style={styles.cameraBadgeButton}>
                        <Icon name="camera-plus" size={17} color="#072832" />
                      </View>
                    )}
                  </Pressable>

                  {/* Edit Photo Actions */}
                  {isEditingProfile && (
                    <View style={styles.photoActionRow}>
                      <Pressable
                        onPress={chooseProfilePhoto}
                        style={styles.photoActionChip}
                        accessibilityRole="button"
                      >
                        <Icon name="image-edit-outline" size={15} color="#FFFFFF" />
                        <Text style={styles.photoActionChipText}>
                          {profilePhoto ? 'Change Photo' : 'Upload Photo'}
                        </Text>
                      </Pressable>
                      {profilePhoto ? (
                        <Pressable
                          onPress={removeProfilePhoto}
                          style={[styles.photoActionChip, styles.photoActionChipDanger]}
                          accessibilityRole="button"
                        >
                          <Icon name="trash-can-outline" size={14} color="#FFA4A4" />
                          <Text style={[styles.photoActionChipText, { color: '#FFA4A4' }]}>Remove</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  )}
                  {photoError ? <Text style={styles.photoErrorText}>{photoError}</Text> : null}

                  {/* Name Presentation (View Mode Only) */}
                  {!isEditingProfile && (
                    <View style={styles.heroNameWrap}>
                      <Text style={styles.heroNameText}>{name || 'Calabarzon Traveler'}</Text>
                      <Icon name="shield-check" size={20} color="#F5B942" style={styles.verifiedIcon} />
                    </View>
                  )}

                  {/* Explorer Rank & Level Pill */}
                  <View style={styles.rankPill}>
                    <Icon name="trophy-outline" size={14} color="#F5B942" />
                    <Text style={styles.rankPillText}>
                      LVL {rankInfo.level} • {rankInfo.rank.toUpperCase()}
                    </Text>
                  </View>

                  {/* Bio / Traveler Motto in Hero */}
                  {isEditingProfile ? (
                    <View style={styles.heroBioInputWrap}>
                      <View style={styles.heroBioHeader}>
                        <Text style={styles.heroInputLabel}>TRAVELER BIO</Text>
                        <Text style={styles.heroBioCounter}>{aboutMe.length}/160</Text>
                      </View>
                      <TextInput
                        value={aboutMe}
                        onChangeText={(val) => {
                          if (val.length <= 160) setAboutMe(val);
                        }}
                        placeholder="Share your travel motto, favorite Calabarzon spots, or notes..."
                        placeholderTextColor="rgba(255,255,255,0.55)"
                        multiline
                        maxLength={160}
                        textAlignVertical="top"
                        style={styles.heroBioInput}
                        accessibilityLabel="Edit Traveler Bio"
                      />
                    </View>
                  ) : (
                    <View style={styles.heroBioCard}>
                      <Icon name="format-quote-open" size={16} color="rgba(245, 185, 66, 0.7)" style={styles.quoteIcon} />
                      <Text style={styles.heroBioText}>
                        {aboutMe || 'Exploring historical monuments, nature trails, and vibrant culture across the five provinces of CALABARZON.'}
                      </Text>
                    </View>
                  )}

                  {/* Explorer Snapshot Stats (Preview Mode) */}
                  {!isEditingProfile && (
                    <View style={styles.statsStrip}>
                      <View style={styles.statBox}>
                        <Icon name="map-check-outline" size={18} color="#F5B942" />
                        <Text style={styles.statNumber}>{progressData?.done ?? 0}</Text>
                        <Text style={styles.statLabel}>EXPLORED</Text>
                      </View>
                      <View style={styles.statDivider} />
                      <View style={styles.statBox}>
                        <Icon name="star-circle-outline" size={18} color="#F5B942" />
                        <Text style={styles.statNumber}>{progressData?.stars ?? 0}</Text>
                        <Text style={styles.statLabel}>STARS</Text>
                      </View>
                      <View style={styles.statDivider} />
                      <View style={styles.statBox}>
                        <Icon name="lightning-bolt" size={18} color="#F5B942" />
                        <Text style={styles.statNumber}>{progressData?.xp ?? 0}</Text>
                        <Text style={styles.statLabel}>TOTAL XP</Text>
                      </View>
                    </View>
                  )}
                </SlideIn>
              </View>
            </LinearGradient>

            {/* DOWN SECTION: SIMPLE BUT BEST UI */}
            <View style={styles.downSectionContainer}>
              <SlideIn key={profileView} from={isEditingProfile ? 36 : -36} style={styles.downSlide}>
              {!isEditingProfile ? (
                /* =================== VIEW MODE (MINIMAL & LUXURY) =================== */
                <>
                  {/* GROUP 1: Personal & Location */}
                  <View style={styles.groupHeaderWrap}>
                    <Text style={[styles.groupHeaderLabel, { color: mutedText }]}>PERSONAL & LOCATION</Text>
                  </View>
                  <View style={[styles.groupedCard, { backgroundColor: surface, borderColor: border }]}>
                    <SimpleRow
                      icon="account-outline"
                      label="Full Name"
                      value={name || 'Not set'}
                      text={text}
                      mutedText={mutedText}
                      border={border}
                    />
                    <SimpleRow
                      icon="calendar-month-outline"
                      label="Date of Birth"
                      value={birthDate ? formatDisplayDate(birthDate) : 'Not set'}
                      text={text}
                      mutedText={mutedText}
                      border={border}
                    />
                    <SimpleRow
                      icon="earth"
                      label="Country"
                      value={country.name}
                      extra={
                        <View style={styles.inlineFlagWrap}>
                          <CountryFlag country={country} fallback={PHONE_COUNTRIES[0]} style={styles.inlineFlag} />
                          <Text style={[styles.simpleRowValue, { color: text }]}>{country.name}</Text>
                          <Text style={[styles.countryCodeBadge, { color: mutedText }]}>({country.code})</Text>
                        </View>
                      }
                      text={text}
                      mutedText={mutedText}
                      border={border}
                    />
                    <SimpleRow
                      icon="home-city-outline"
                      label="Street Address"
                      value={streetAddress || 'Not set'}
                      text={text}
                      mutedText={mutedText}
                      border={border}
                    />
                    <SimpleRow
                      icon="city-variant-outline"
                      label="City & Province"
                      value={city && province ? `${city}, ${province}` : (city || province || 'Not set')}
                      text={text}
                      mutedText={mutedText}
                      border={border}
                    />
                    <SimpleRow
                      icon="mailbox-outline"
                      label="Postal Code"
                      value={postalCode || 'Not set'}
                      text={text}
                      mutedText={mutedText}
                      border={border}
                      last
                    />
                  </View>

                  {/* GROUP 2: Contact & Socials */}
                  <View style={styles.groupHeaderWrap}>
                    <Text style={[styles.groupHeaderLabel, { color: mutedText }]}>CONTACT & CONNECTIVITY</Text>
                  </View>
                  <View style={[styles.groupedCard, { backgroundColor: surface, borderColor: border }]}>
                    <SimpleRow
                      icon="email-outline"
                      label="Email"
                      value={email}
                      extra={
                        <View style={styles.inlineEmailWrap}>
                          <Text style={[styles.simpleRowValue, { color: text }]}>{email}</Text>
                          <View style={styles.verifiedDot}>
                            <Icon name="check" size={10} color="#2F7D4F" />
                          </View>
                        </View>
                      }
                      text={text}
                      mutedText={mutedText}
                      border={border}
                    />
                    <SimpleRow
                      icon="cellphone"
                      label="Phone"
                      value={phone ? `${country.code} ${phone}` : 'Not set'}
                      text={text}
                      mutedText={mutedText}
                      border={border}
                    />
                    <SimpleRow
                      IconComponent={FontAwesome6}
                      icon="x-twitter"
                      label="X (Twitter)"
                      value={twitter ? `@${twitter.replace(/^@/, '')}` : 'Not connected'}
                      isDimmed={!twitter}
                      text={text}
                      mutedText={mutedText}
                      border={border}
                    />
                    <SimpleRow
                      IconComponent={FontAwesome6}
                      icon="google"
                      label="Google"
                      value={google || 'Not connected'}
                      isDimmed={!google}
                      text={text}
                      mutedText={mutedText}
                      border={border}
                    />
                    <SimpleRow
                      IconComponent={FontAwesome6}
                      icon="facebook"
                      label="Facebook"
                      value={facebook || 'Not connected'}
                      isDimmed={!facebook}
                      text={text}
                      mutedText={mutedText}
                      border={border}
                      last
                    />
                  </View>

                  {/* Action Buttons in View Mode */}
                  <View style={styles.viewModeActions}>
                    <Pressable
                      onPress={handleLogout}
                      style={styles.simpleLogoutButton}
                      accessibilityRole="button"
                    >
                      <Text style={[styles.simpleLogoutText, { color: isDark ? '#FF8A8A' : '#C0392B' }]}>Log out</Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                /* =================== EDIT MODE (CLEAN & MINIMAL) =================== */
                <>
                  {/* Section 1: Personal & Location (Edit Mode) */}
                  <View style={styles.editSectionHeaderRow}>
                    <Text style={[styles.groupHeaderLabel, { color: mutedText, marginBottom: 0 }]}>
                      PERSONAL & LOCATION
                    </Text>
                    <Pressable onPress={prefillSampleData} style={styles.prefillChip} hitSlop={6}>
                      <Icon name="auto-fix" size={13} color="#D99A1E" />
                      <Text style={styles.prefillChipText}>Prefill Sample</Text>
                    </Pressable>
                  </View>

                  <View style={[styles.groupedCard, { backgroundColor: surface, borderColor: border, padding: 14, gap: 12 }]}>
                    {/* Full Name */}
                    <SimpleInputField
                      label="Full Name *"
                      value={name}
                      onChangeText={setName}
                      placeholder="e.g. Jose Rizal"
                      icon="account-outline"
                      text={text}
                      mutedText={mutedText}
                      border={border}
                      inputBg={inputBg}
                      accent={accent}
                    />

                    {/* Date of Birth */}
                    <Pressable
                      onPress={() => setBirthDatePickerVisible(true)}
                      style={styles.simpleFieldWrap}
                      accessibilityRole="button"
                    >
                      <Text style={[styles.fieldSmallLabel, { color: mutedText }]}>DATE OF BIRTH</Text>
                      <View style={[styles.simpleInputRow, { backgroundColor: inputBg, borderColor: border }]}>
                        <Icon name="calendar-month-outline" size={18} color={accent} />
                        <Text style={[styles.simpleInputText, { color: birthDate ? text : mutedText, flex: 1 }]}>
                          {birthDate ? formatDisplayDate(birthDate) : 'Select birth date'}
                        </Text>
                        <Icon name="chevron-down" size={18} color={mutedText} />
                      </View>
                    </Pressable>

                    {/* Country */}
                    <Pressable
                      onPress={() => setCountryPickerVisible(true)}
                      style={styles.simpleFieldWrap}
                      accessibilityRole="button"
                    >
                      <Text style={[styles.fieldSmallLabel, { color: mutedText }]}>COUNTRY / NATIONALITY *</Text>
                      <View style={[styles.simpleInputRow, { backgroundColor: inputBg, borderColor: border }]}>
                        <CountryFlag country={country} fallback={PHONE_COUNTRIES[0]} style={styles.inputFlag} />
                        <Text style={[styles.simpleInputText, { color: text, flex: 1, fontWeight: '600' }]}>
                          {country.name}
                        </Text>
                        <Text style={[styles.countryCodeBadge, { color: mutedText }]}>{country.code}</Text>
                        <Icon name="chevron-right" size={18} color={mutedText} />
                      </View>
                    </Pressable>

                    {/* Street Address */}
                    <SimpleInputField
                      label="Street Address *"
                      value={streetAddress}
                      onChangeText={setStreetAddress}
                      placeholder="e.g. Real Street, Poblacion"
                      icon="home-city-outline"
                      text={text}
                      mutedText={mutedText}
                      border={border}
                      inputBg={inputBg}
                      accent={accent}
                    />

                    {/* City and Province */}
                    <View style={styles.gridRow}>
                      <View style={{ flex: 1 }}>
                        <SimpleInputField
                          label="City / Town *"
                          value={city}
                          onChangeText={setCity}
                          placeholder="Calamba"
                          icon="city-variant-outline"
                          text={text}
                          mutedText={mutedText}
                          border={border}
                          inputBg={inputBg}
                          accent={accent}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <SimpleInputField
                          label="Province *"
                          value={province}
                          onChangeText={setProvince}
                          placeholder="Laguna"
                          icon="map-outline"
                          text={text}
                          mutedText={mutedText}
                          border={border}
                          inputBg={inputBg}
                          accent={accent}
                        />
                      </View>
                    </View>

                    {/* Postal Code */}
                    <SimpleInputField
                      label="Postal Code *"
                      value={postalCode}
                      onChangeText={setPostalCode}
                      placeholder="4027"
                      icon="mailbox-outline"
                      keyboardType="number-pad"
                      text={text}
                      mutedText={mutedText}
                      border={border}
                      inputBg={inputBg}
                      accent={accent}
                    />
                  </View>

                  {/* Section 2: Contact & Socials (Edit Mode) */}
                  <View style={styles.groupHeaderWrap}>
                    <Text style={[styles.groupHeaderLabel, { color: mutedText }]}>CONTACT & CONNECTIVITY</Text>
                  </View>

                  <View style={[styles.groupedCard, { backgroundColor: surface, borderColor: border, padding: 14, gap: 12 }]}>
                    {/* Email (Readonly) */}
                    <View style={styles.simpleFieldWrap}>
                      <Text style={[styles.fieldSmallLabel, { color: mutedText }]}>ACCOUNT EMAIL (LINKED)</Text>
                      <View style={[styles.simpleInputRow, { backgroundColor: inputBg, borderColor: border, opacity: 0.85 }]}>
                        <Icon name="email-check-outline" size={18} color={colors.primary} />
                        <Text style={[styles.simpleInputText, { color: text, flex: 1 }]}>{email}</Text>
                        <Icon name="lock-outline" size={16} color={mutedText} />
                      </View>
                    </View>

                    {/* Phone */}
                    <View style={styles.simpleFieldWrap}>
                      <Text style={[styles.fieldSmallLabel, { color: mutedText }]}>MOBILE PHONE *</Text>
                      <View style={[styles.simpleInputRow, { backgroundColor: inputBg, borderColor: border, paddingLeft: 6 }]}>
                        <Pressable
                          onPress={() => setCountryPickerVisible(true)}
                          style={[styles.phonePrefixPill, { borderRightColor: border }]}
                          accessibilityRole="button"
                        >
                          <CountryFlag country={country} fallback={PHONE_COUNTRIES[0]} style={styles.inputFlagSmall} />
                          <Text style={[styles.phonePrefixPillText, { color: text }]}>{country.code}</Text>
                          <Icon name="menu-down" size={14} color={mutedText} />
                        </Pressable>
                        <TextInput
                          value={phone}
                          onChangeText={setPhone}
                          placeholder="912 345 6789"
                          placeholderTextColor={mutedText}
                          keyboardType="phone-pad"
                          style={[styles.simpleInputText, { color: text, flex: 1, paddingLeft: 8 }]}
                        />
                      </View>
                    </View>

                    {/* X / Twitter */}
                    <SimpleInputField
                      label="X (Twitter)"
                      value={twitter}
                      onChangeText={setTwitter}
                      placeholder="@username"
                      IconComponent={FontAwesome6}
                      icon="x-twitter"
                      text={text}
                      mutedText={mutedText}
                      border={border}
                      inputBg={inputBg}
                      accent={accent}
                    />

                    {/* Google */}
                    <SimpleInputField
                      label="Google Profile"
                      value={google}
                      onChangeText={setGoogle}
                      placeholder="username or link"
                      IconComponent={FontAwesome6}
                      icon="google"
                      text={text}
                      mutedText={mutedText}
                      border={border}
                      inputBg={inputBg}
                      accent={accent}
                    />

                    {/* Facebook */}
                    <SimpleInputField
                      label="Facebook Profile"
                      value={facebook}
                      onChangeText={setFacebook}
                      placeholder="facebook.com/username"
                      IconComponent={FontAwesome6}
                      icon="facebook"
                      text={text}
                      mutedText={mutedText}
                      border={border}
                      inputBg={inputBg}
                      accent={accent}
                    />
                  </View>

                  {/* Edit Mode Actions */}
                  <View style={styles.editModeActions}>
                    <Pressable
                      onPress={cancelEdit}
                      disabled={isSaving}
                      style={[styles.simpleCancelButton, { borderColor: border }]}
                      accessibilityRole="button"
                    >
                      <Text style={[styles.simpleCancelButtonText, { color: mutedText }]}>Cancel</Text>
                    </Pressable>

                    <Pressable
                      onPress={submit}
                      disabled={isSaving}
                      style={styles.simpleSaveButton}
                      accessibilityRole="button"
                    >
                      <LinearGradient
                        colors={['#0F4C5C', '#1D7287']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.simpleSaveGradient}
                      >
                        {isSaving ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <>
                            <Icon name="check" size={18} color="#FFFFFF" />
                            <Text style={styles.simpleSaveButtonText}>Save Changes</Text>
                          </>
                        )}
                      </LinearGradient>
                    </Pressable>
                  </View>
                </>
              )}
              </SlideIn>
            </View>
          </>
        )}

        {/* SIGN IN VIEW (When no user is logged in) */}
        {!loading && mode !== 'profile' && (
          <View style={styles.signInCardWrap}>
            <LinearGradient
              colors={heroGradients}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.signInHeroHeader}
            >
              <View style={styles.signInEmblemRing}>
                <Icon name="compass-outline" size={44} color="#F5B942" />
              </View>
              <Text style={styles.signInHeroTitle}>Calabarzon Tour</Text>
              <Text style={styles.signInHeroSubtitle}>Official Traveler Passport & Progression</Text>
            </LinearGradient>

            <View style={[styles.signInFormCard, { backgroundColor: surface, borderColor: border }]}>
              <Text style={[styles.signInSectionTitle, { color: text }]}>Welcome Traveler</Text>
              <Text style={[styles.signInSectionSub, { color: mutedText }]}>
                Sign in to save your personal details, progress records, and provincial quiz badges.
              </Text>

              {/* Email Input */}
              <SimpleInputField
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="you@calabarzon.ph"
                icon="email-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                textContentType="emailAddress"
                text={text}
                mutedText={mutedText}
                border={border}
                inputBg={inputBg}
                accent={accent}
              />

              {/* Password Input */}
              <SimpleInputField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password (any for demo)"
                icon="lock-outline"
                secureTextEntry
                textContentType="password"
                text={text}
                mutedText={mutedText}
                border={border}
                inputBg={inputBg}
                accent={accent}
              />

              {/* Sign In Button */}
              <Pressable
                onPress={submit}
                disabled={isSaving}
                style={styles.signInSubmitButton}
                accessibilityRole="button"
              >
                <LinearGradient
                  colors={['#0F4C5C', '#1D7287']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.signInGradientButton}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Icon name="login-variant" size={20} color="#FFFFFF" />
                      <Text style={styles.signInGradientButtonText}>Sign In</Text>
                    </>
                  )}
                </LinearGradient>
              </Pressable>

              {/* Instant Demo Explorer Button */}
              <Pressable
                onPress={handleDemoLogin}
                disabled={isSaving}
                style={[styles.demoLoginButton, { borderColor: border }]}
                accessibilityRole="button"
              >
                <Icon name="flash-outline" size={18} color="#D99A1E" />
                <Text style={[styles.demoLoginButtonText, { color: text }]}>
                  One-Click Demo Traveler Login
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      {/* FLOATING SUCCESS / NOTICE TOAST */}
      {notice ? (
        <Animated.View
          style={[
            styles.floatingToast,
            {
              backgroundColor: isDark ? '#162534' : '#FFFFFF',
              borderColor: isDark ? '#2B4055' : '#CBD5E0',
              opacity: toastFade,
            },
          ]}
        >
          <Icon name="check-circle" size={20} color="#2F7D4F" />
          <Text style={[styles.floatingToastText, { color: text }]}>{notice}</Text>
          <Pressable onPress={() => setNotice('')} hitSlop={8}>
            <Icon name="close" size={16} color={mutedText} />
          </Pressable>
        </Animated.View>
      ) : null}

      {/* WARNING MODAL (FOR MISSING REQUIRED FIELDS) */}
      <Modal
        visible={!!warningMessage}
        transparent
        animationType="fade"
        onRequestClose={() => setWarningMessage('')}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setWarningMessage('')}
            accessibilityRole="button"
            accessibilityLabel="Close warning"
          />
          <View style={[styles.warningDialog, { backgroundColor: surface, borderColor: border }]}>
            <View style={styles.warningDialogHeader}>
              <View style={styles.warningIconCircle}>
                <Icon name="alert-circle-outline" size={26} color="#D97706" />
              </View>
              <Text style={[styles.warningDialogTitle, { color: text }]}>Required Information Missing</Text>
            </View>
            <Text style={[styles.warningDialogBody, { color: mutedText }]}>{warningMessage}</Text>
            <Pressable
              onPress={() => setWarningMessage('')}
              style={styles.warningDialogButton}
              accessibilityRole="button"
            >
              <Text style={styles.warningDialogButtonText}>Got It, Complete Form</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ENHANCED COUNTRY PICKER MODAL */}
      <Modal
        visible={countryPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setCountryPickerVisible(false);
          setCountrySearch('');
        }}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              setCountryPickerVisible(false);
              setCountrySearch('');
            }}
            accessibilityRole="button"
            accessibilityLabel="Close country picker"
          />
          <View style={[styles.countryPickerModal, { backgroundColor: surface, borderColor: border }]}>
            {/* Modal Header */}
            <View style={styles.countryModalHeader}>
              <View>
                <Text style={[styles.countryModalTitle, { color: text }]}>Select Country</Text>
                <Text style={[styles.countryModalSub, { color: mutedText }]}>
                  Choose your nationality & dialing code
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  setCountryPickerVisible(false);
                  setCountrySearch('');
                }}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Icon name="close" size={22} color={mutedText} />
              </Pressable>
            </View>

            {/* Country Search Bar */}
            <View style={[styles.countrySearchBox, { backgroundColor: inputBg, borderColor: border }]}>
              <Icon name="magnify" size={20} color={mutedText} style={styles.searchIcon} />
              <TextInput
                value={countrySearch}
                onChangeText={setCountrySearch}
                placeholder="Search country name or code (+63)…"
                placeholderTextColor={mutedText}
                style={[styles.countrySearchInput, { color: text }]}
                autoCorrect={false}
                clearButtonMode="while-editing"
                accessibilityLabel="Search country"
              />
              {countrySearch ? (
                <Pressable onPress={() => setCountrySearch('')} hitSlop={6}>
                  <Icon name="close-circle" size={18} color={mutedText} />
                </Pressable>
              ) : null}
            </View>

            {/* Countries List */}
            <ScrollView style={styles.countryScrollView} keyboardShouldPersistTaps="handled">
              {filteredCountries.map((item) => {
                const isSelected = item.name === country.name;
                return (
                  <Pressable
                    key={item.name}
                    style={[
                      styles.countryRowItem,
                      { borderBottomColor: border },
                      isSelected && { backgroundColor: isDark ? 'rgba(31, 131, 150, 0.20)' : 'rgba(15, 76, 92, 0.08)' },
                    ]}
                    onPress={() => {
                      setCountry(item);
                      setCountryPickerVisible(false);
                      setCountrySearch('');
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.name}, code ${item.code}`}
                  >
                    <CountryFlag country={item} fallback={PHONE_COUNTRIES[0]} style={styles.modalFlagIcon} />
                    <View style={styles.countryRowTextWrap}>
                      <Text style={[styles.countryRowName, { color: text, fontWeight: isSelected ? '700' : '500' }]}>
                        {item.name}
                      </Text>
                    </View>
                    <Text style={[styles.countryRowCode, { color: mutedText }]}>{item.code}</Text>
                    {isSelected && (
                      <Icon name="check-circle" size={18} color={colors.primary} style={styles.countrySelectedCheck} />
                    )}
                  </Pressable>
                );
              })}
              {filteredCountries.length === 0 && (
                <View style={styles.emptySearchWrap}>
                  <Icon name="file-search-outline" size={32} color={mutedText} />
                  <Text style={[styles.emptySearchText, { color: mutedText }]}>
                    No country matching "{countrySearch}"
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* BIRTH DATE PICKER MODAL */}
      <DatePickerModal
        visible={birthDatePickerVisible}
        value={birthDate}
        onClose={() => setBirthDatePickerVisible(false)}
        onSelect={(selectedFormattedDate) => setBirthDate(selectedFormattedDate)}
      />
    </View>
  );
}

/* =========================================================================
   CLEAN & MINIMAL SUB-COMPONENTS FOR DOWN SECTION
   ========================================================================= */

function SimpleRow({
  icon,
  IconComponent = Icon,
  label,
  value,
  extra,
  isDimmed = false,
  text,
  mutedText,
  border,
  last = false,
}) {
  return (
    <View style={[styles.simpleRowWrap, !last && { borderBottomColor: border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <View style={styles.simpleRowLeft}>
        <IconComponent name={icon} size={18} color={mutedText} />
        <Text style={[styles.simpleRowLabel, { color: mutedText }]}>{label}</Text>
      </View>
      <View style={styles.simpleRowRight}>
        {extra ? (
          extra
        ) : (
          <Text
            style={[
              styles.simpleRowValue,
              { color: isDimmed ? mutedText : text, fontStyle: isDimmed ? 'italic' : 'normal' },
            ]}
            numberOfLines={1}
          >
            {value}
          </Text>
        )}
      </View>
    </View>
  );
}

function SimpleInputField({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  IconComponent = Icon,
  keyboardType,
  secureTextEntry,
  autoCapitalize,
  textContentType,
  text,
  mutedText,
  border,
  inputBg,
  accent,
}) {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={styles.simpleFieldWrap}>
      <Text style={[styles.fieldSmallLabel, { color: mutedText }]}>{label.toUpperCase()}</Text>
      <View
        style={[
          styles.simpleInputRow,
          {
            backgroundColor: inputBg,
            borderColor: isFocused ? accent : border,
            borderWidth: isFocused ? 1.5 : 1,
          },
        ]}
      >
        {icon ? (
          <IconComponent
            name={icon}
            size={18}
            color={isFocused ? accent : mutedText}
          />
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#8A9CA9"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          textContentType={textContentType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.simpleInputText, { color: text }]}
          accessibilityLabel={label}
        />
        {value ? (
          <Pressable onPress={() => onChangeText('')} hitSlop={6}>
            <Icon name="close-circle" size={16} color="#8A9CA9" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function CountryFlag({ country, fallback, style }) {
  const [failed, setFailed] = useState(false);
  const countryCode =
    country?.flagCode ||
    PHONE_COUNTRIES.find((item) => item.name === country?.name)?.flagCode ||
    fallback?.flagCode ||
    'ph';

  if (failed) {
    return <Text style={[styles.countryFlagFallback, style]}>{country?.flag || fallback?.flag || '🇵🇭'}</Text>;
  }
  return (
    <Image
      source={{ uri: `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png` }}
      style={[styles.countryFlagImage, style]}
      resizeMode="cover"
      onError={() => setFailed(true)}
      accessibilityLabel={`${country?.name || 'Country'} flag`}
    />
  );
}

/* =========================================================================
   STYLESHEET
   ========================================================================= */

function SlideIn({ from, children, style }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [anim]);
  return (
    <Animated.View
      style={[{
        width: '100%',
        opacity: anim,
        transform: [{
          translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }),
        }],
      }, style]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: fonts.sans,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(214, 69, 69, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    gap: 10,
  },
  errorBannerText: {
    flex: 1,
    color: '#D64545',
    fontSize: 14,
    fontFamily: fonts.sans,
  },

  /* ------------------- HERO BANNER (PRESERVED) ------------------- */
  heroBanner: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#072832',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  heroInnerContainer: {
    width: '100%',
    maxWidth: 680,
    alignItems: 'center',
  },
  glowCircleTopRight: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(245, 185, 66, 0.14)',
  },
  glowCircleBottomLeft: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(31, 131, 150, 0.22)',
  },
  bannerHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  passportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 185, 66, 0.35)',
  },
  passportBadgeText: {
    color: '#F5B942',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    fontFamily: fonts.sans,
  },

  /* Segmented Control Pill */
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
    padding: 3,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  segmentedTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  segmentedTabActive: {
    backgroundColor: '#FFFFFF',
  },
  segmentedTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.78)',
    fontFamily: fonts.sans,
  },
  segmentedTabTextActive: {
    color: '#072832',
    fontWeight: '700',
  },

  /* Avatar */
  avatarSection: {
    alignItems: 'center',
    width: '100%',
  },
  avatarRingOuter: {
    position: 'relative',
    width: 106,
    height: 106,
    borderRadius: 53,
    borderWidth: 2.5,
    borderColor: 'rgba(245, 185, 66, 0.65)',
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  avatarRingInner: {
    width: 94,
    height: 94,
    borderRadius: 47,
    overflow: 'hidden',
    backgroundColor: '#0F4C5C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 94,
    height: 94,
    borderRadius: 47,
  },
  avatarFallback: {
    width: 94,
    height: 94,
    borderRadius: 47,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: fonts.sans,
    letterSpacing: 1,
  },
  cameraBadgeButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F5B942',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 },
      android: { elevation: 4 },
      default: {},
    }),
  },
  photoActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  photoActionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  photoActionChipDanger: {
    backgroundColor: 'rgba(214, 69, 69, 0.22)',
    borderColor: 'rgba(255, 164, 164, 0.4)',
  },
  photoActionChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: fonts.sans,
  },
  photoErrorText: {
    color: '#FFA4A4',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },

  /* Name & Bio */
  heroNameWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  heroNameText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: fonts.sans,
    textAlign: 'center',
  },
  verifiedIcon: {
    marginLeft: 2,
  },
  heroNameInputWrap: {
    width: '100%',
    maxWidth: 360,
    marginTop: 12,
    alignItems: 'center',
  },
  heroInputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(245, 185, 66, 0.9)',
    letterSpacing: 0.8,
    marginBottom: 4,
    fontFamily: fonts.sans,
  },
  heroNameInput: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  /* Explorer Rank Pill */
  rankPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 185, 66, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(245, 185, 66, 0.45)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 8,
  },
  rankPillText: {
    color: '#F5B942',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    fontFamily: fonts.sans,
  },

  /* Hero Bio */
  heroBioCard: {
    position: 'relative',
    width: '100%',
    maxWidth: 460,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  quoteIcon: {
    position: 'absolute',
    top: 6,
    left: 8,
  },
  heroBioText: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 12,
    fontFamily: fonts.sans,
  },
  heroBioInputWrap: {
    width: '100%',
    maxWidth: 460,
    marginTop: 14,
  },
  heroBioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  heroBioCounter: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
    fontFamily: fonts.sans,
  },
  heroBioInput: {
    width: '100%',
    minHeight: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    borderRadius: 12,
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
    padding: 10,
    textAlignVertical: 'top',
  },

  /* Stats Strip */
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 460,
    backgroundColor: 'rgba(0, 0, 0, 0.26)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    fontFamily: fonts.sans,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    fontFamily: fonts.sans,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },

  /* ------------------- DOWN SECTION: SIMPLE & BEST UI ------------------- */
  downSectionContainer: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 16,
  },
  downSlide: {
    gap: 16,
  },
  groupHeaderWrap: {
    paddingHorizontal: 4,
    marginTop: 4,
  },
  groupHeaderLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    fontFamily: fonts.sans,
  },
  groupedCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },

  /* Simple Rows (View Mode) */
  simpleRowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    minHeight: 50,
  },
  simpleRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  simpleRowLabel: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: fonts.sans,
  },
  simpleRowRight: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 16,
  },
  simpleRowValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fonts.sans,
    textAlign: 'right',
  },
  inlineFlagWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inlineFlag: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  inlineEmailWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(47, 125, 79, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* View Mode Action Buttons */
  viewModeActions: {
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  simpleLogoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 99,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  simpleLogoutText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: fonts.sans,
  },

  /* Edit Mode Fields */
  editSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  prefillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(217, 154, 30, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(217, 154, 30, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  prefillChipText: {
    color: '#D99A1E',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: fonts.sans,
  },
  simpleFieldWrap: {
    gap: 4,
  },
  fieldSmallLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    paddingHorizontal: 2,
    fontFamily: fonts.sans,
  },
  simpleInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 44,
    gap: 10,
  },
  simpleInputText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.sans,
    paddingVertical: 6,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputFlag: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  inputFlagSmall: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  countryCodeBadge: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: fonts.sans,
  },
  phonePrefixPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRightWidth: 1,
  },
  phonePrefixPillText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: fonts.sans,
  },

  /* Edit Mode Action Buttons */
  editModeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  simpleCancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    minHeight: 48,
  },
  simpleCancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: fonts.sans,
  },
  simpleSaveButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  simpleSaveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 16,
  },
  simpleSaveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: fonts.sans,
  },

  /* ------------------- SIGN IN VIEW ------------------- */
  signInCardWrap: {
    padding: 16,
    alignItems: 'center',
  },
  signInHeroHeader: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  signInEmblemRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 2,
    borderColor: 'rgba(245, 185, 66, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  signInHeroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: fonts.sans,
  },
  signInHeroSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.82)',
    marginTop: 4,
    textAlign: 'center',
    fontFamily: fonts.sans,
  },
  signInFormCard: {
    width: '100%',
    maxWidth: 440,
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    padding: 20,
    gap: 14,
  },
  signInSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: fonts.sans,
  },
  signInSectionSub: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fonts.sans,
    marginTop: -6,
    marginBottom: 4,
  },
  signInSubmitButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 6,
  },
  signInGradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
  },
  signInGradientButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: fonts.sans,
  },
  demoLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  demoLoginButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fonts.sans,
  },

  /* ------------------- TOAST NOTIFICATION ------------------- */
  floatingToast: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    maxWidth: 480,
    alignSelf: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10 },
      android: { elevation: 6 },
      default: { filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.12))' },
    }),
  },
  floatingToastText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fonts.sans,
  },

  /* ------------------- MODAL OVERLAY & POPUPS ------------------- */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  /* Warning Popover */
  warningDialog: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  warningDialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  warningIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(217, 119, 6, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningDialogTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: fonts.sans,
  },
  warningDialogBody: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: fonts.sans,
  },
  warningDialogButton: {
    backgroundColor: '#D97706',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningDialogButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: fonts.sans,
  },

  /* Country Picker Modal */
  countryPickerModal: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '80%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  countryModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  countryModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: fonts.sans,
  },
  countryModalSub: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: fonts.sans,
  },
  countrySearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 44,
    marginBottom: 12,
    gap: 8,
  },
  searchIcon: {
    marginRight: 2,
  },
  countrySearchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.sans,
    paddingVertical: 8,
  },
  countryScrollView: {
    flexGrow: 0,
  },
  countryRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  modalFlagIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  countryRowTextWrap: {
    flex: 1,
  },
  countryRowName: {
    fontSize: 15,
    fontFamily: fonts.sans,
  },
  countryRowCode: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fonts.sans,
  },
  countrySelectedCheck: {
    marginLeft: 6,
  },
  emptySearchWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptySearchText: {
    fontSize: 14,
    fontFamily: fonts.sans,
  },

  /* Flag Component Elements */
  countryFlagImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  countryFlagFallback: {
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
});
