import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Place, Member, Currency } from '../lib/types';
import { useThemeColors } from '../lib/theme';
import { formatMoney } from '../lib/format';
import { PlaceIcon } from './CategoryIcon';
import { Tap, Pill } from './primitives';

export function PlaceCard({
  place, members, currency, linkedAmount, onPress,
}: {
  place: Place; members: Member[]; currency: Currency; linkedAmount?: number; onPress?: () => void;
}) {
  const { colors } = useThemeColors();
  const addedBy = members.find((m) => m.id === place.addedById);
  return (
    <Tap onPress={onPress} disabled={!onPress} style={{ marginBottom: 12, paddingHorizontal: 16 }}>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.row}>
          <PlaceIcon category={place.category} size={44} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={styles.titleRow}>
              <Text style={[styles.name, { color: colors.label }]} numberOfLines={1}>{place.name}</Text>
              {place.rating ? (
                <View style={[styles.rating, { backgroundColor: colors.cardSecondary }]}>
              <Ionicons name="star" size={11} color="#FFB340" />
              <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
            </View>
              ) : null}
            </View>
            <Text style={[styles.area, { color: colors.secondaryLabel }]} numberOfLines={1}>
              {place.area ? `${place.area} · ` : ''}added by {addedBy?.name ?? 'you'}
            </Text>
          </View>
        </View>
        {place.notes ? (
          <Text style={[styles.notes, { color: colors.secondaryLabel }]} numberOfLines={2}>{place.notes}</Text>
        ) : null}
        {linkedAmount ? (
          <View style={styles.footer}>
            <Pill icon="wallet" color={colors.brand}>{formatMoney(linkedAmount, currency)} spent here</Pill>
          </View>
        ) : null}
      </View>
    </Tap>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, padding: 14 },
  row: { flexDirection: 'row', alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2, flex: 1 },
  rating: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 12, marginLeft: 8 },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#FFB340', marginLeft: 3 },
  area: { fontSize: 12.5, marginTop: 3, fontWeight: '500' },
  notes: { fontSize: 14, marginTop: 10, lineHeight: 19 },
  footer: { marginTop: 12 },
});
