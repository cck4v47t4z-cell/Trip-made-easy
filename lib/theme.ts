import { useColorScheme } from 'react-native';
import type { ExpenseCategory, PlaceCategory } from './types';

export const BRAND = '#3B6FF6';
export const BRAND_WARM = '#FF6B4A';
export const BRAND_GREEN = '#30C97D';
export const BRAND_PINK = '#FF5C8A';

export const avatarColors = [
  '#3B6FF6', '#FF6B4A', '#30C97D', '#FF5C8A',
  '#9B6BFF', '#FFB340', '#00C2B8', '#F65B7B',
  '#5AC8FA', '#BF5AF2', '#FF9F0A', '#34C759',
];

export interface CategoryMeta {
  color: string;
  icon: string;
  gradient: [string, string];
}

export const categoryMeta: Record<ExpenseCategory, CategoryMeta> = {
  Food: { color: '#FF9F0A', icon: 'restaurant', gradient: ['#FFB13A', '#FF7A0A'] },
  Transport: { color: '#5AC8FA', icon: 'car', gradient: ['#7AD6FF', '#36BFF0'] },
  Hotel: { color: '#FF375F', icon: 'bed', gradient: ['#FF6B8A', '#FF2D55'] },
  Activities: { color: '#30C97D', icon: 'bicycle', gradient: ['#54E29A', '#1FB96A'] },
  Shopping: { color: '#BF5AF2', icon: 'bag-handle', gradient: ['#D089FF', '#A347F0'] },
  Drinks: { color: '#FFB340', icon: 'wine', gradient: ['#FFCB6E', '#FF9F0A'] },
  Fuel: { color: '#FF6B4A', icon: 'flash', gradient: ['#FF8E73', '#FF4D2E'] },
  Other: { color: '#8E8E93', icon: 'cube', gradient: ['#B0B0B5', '#6E6E73'] },
};

export const expenseCategories: ExpenseCategory[] = [
  'Food', 'Transport', 'Hotel', 'Activities', 'Shopping', 'Drinks', 'Fuel', 'Other',
];

export const placeMeta: Record<PlaceCategory, { color: string; icon: string }> = {
  Restaurant: { color: '#FF9F0A', icon: 'restaurant' },
  Beach: { color: '#5AC8FA', icon: 'sunny' },
  Hotel: { color: '#FF375F', icon: 'bed' },
  Attraction: { color: '#30C97D', icon: 'camera' },
  Shop: { color: '#BF5AF2', icon: 'cart' },
};

export const placeCategories: PlaceCategory[] = [
  'Restaurant', 'Beach', 'Hotel', 'Attraction', 'Shop',
];

export const coverGradients: [string, string][] = [
  ['#3B6FF6', '#7B4DFF'],
  ['#FF6B4A', '#FFB340'],
  ['#30C97D', '#1FB96A'],
  ['#FF5C8A', '#FF9F0A'],
  ['#5AC8FA', '#3B6FF6'],
  ['#9B6BFF', '#FF5C8A'],
  ['#00C2B8', '#3B6FF6'],
  ['#FF8E73', '#FF375F'],
];

export const lightColors = {
  background: '#F2F2F7',
  backgroundElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardSecondary: '#F7F7FA',
  input: '#FFFFFF',
  inputBorder: 'rgba(60,60,67,0.12)',
  separator: 'rgba(60,60,67,0.12)',
  label: '#000000',
  labelStrong: '#000000',
  secondaryLabel: 'rgba(60,60,67,0.60)',
  tertiaryLabel: 'rgba(60,60,67,0.30)',
  brand: BRAND,
  brandWarm: BRAND_WARM,
  green: BRAND_GREEN,
  red: '#FF3B30',
  orange: '#FF9500',
  shadow: 'rgba(0,0,0,0.06)',
  tabBar: 'rgba(249,249,249,0.94)',
  hairline: 'rgba(60,60,67,0.18)',
};

export const darkColors = {
  background: '#000000',
  backgroundElevated: '#1C1C1E',
  card: '#1C1C1E',
  cardSecondary: '#2C2C2E',
  input: '#1C1C1E',
  inputBorder: 'rgba(84,84,88,0.40)',
  separator: 'rgba(84,84,88,0.30)',
  label: '#FFFFFF',
  labelStrong: '#FFFFFF',
  secondaryLabel: 'rgba(235,235,245,0.60)',
  tertiaryLabel: 'rgba(235,235,245,0.30)',
  brand: '#5B85FF',
  brandWarm: '#FF8163',
  green: '#34D98C',
  red: '#FF453A',
  orange: '#FF9F0A',
  shadow: 'rgba(0,0,0,0.5)',
  tabBar: 'rgba(18,18,20,0.92)',
  hairline: 'rgba(84,84,88,0.50)',
};

export type ThemeColors = typeof lightColors;

export function useThemeColors(): { dark: boolean; colors: ThemeColors } {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  return { dark, colors: dark ? darkColors : lightColors };
}
