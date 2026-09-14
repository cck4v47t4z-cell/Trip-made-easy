import { StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { categoryMeta, placeMeta } from '../lib/theme';
import type { ExpenseCategory, PlaceCategory } from '../lib/types';

export function CategoryIcon({
  category, size = 44, radius = 13,
}: { category: ExpenseCategory; size?: number; radius?: number }) {
  const meta = categoryMeta[category];
  return (
    <View style={[{ width: size, height: size, borderRadius: radius, backgroundColor: meta.color }, styles.center]}>
      <Ionicons name={meta.icon as any} size={size * 0.46} color="#fff" />
    </View>
  );
}

export function PlaceIcon({
  category, size = 40, radius = 12,
}: { category: PlaceCategory; size?: number; radius?: number }) {
  const meta = placeMeta[category];
  return (
    <View style={[{ width: size, height: size, borderRadius: radius, backgroundColor: meta.color }, styles.center]}>
      <Ionicons name={meta.icon as any} size={size * 0.46} color="#fff" />
    </View>
  );
}

const styles = StyleSheet.create({ center: { alignItems: 'center', justifyContent: 'center' } });
