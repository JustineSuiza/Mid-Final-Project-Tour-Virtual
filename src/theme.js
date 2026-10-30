import { Platform } from 'react-native';

export const colors = {
  primary: '#0F4C5C', // Taal Lake teal
  ink: '#14232A',
  muted: '#5B6B72',
  paper: '#F2F4F2',
  card: '#FFFFFF',
  line: '#D9E0DE',
  gold: '#D99A1E', // kalesa gold
  danger: '#A8432F',
  success: '#2F7D4F',
};

export const fonts = {
  serif: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
};

export const categories = ['Historical', 'Cultural', 'Religious', 'Nature', 'Museum'];

export const categoryMeta = {
  Historical: { color: '#8C3B2A', icon: 'castle' },
  Cultural: { color: '#B5701B', icon: 'drama-masks' },
  Religious: { color: '#5B4B8A', icon: 'church' },
  Nature: { color: '#2F7D4F', icon: 'pine-tree' },
  Museum: { color: '#0F4C5C', icon: 'bank' },
};

export const provinces = ['Cavite', 'Laguna', 'Batangas', 'Rizal', 'Quezon'];

// A destination is marked completed when a quiz score reaches this share.
export const PASS_MARK = 0.7;

// On wide screens (PC browsers) the app is shown in a centered column of this width.
export const MAX_WIDTH = 900;
