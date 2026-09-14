import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Trip, TripStatus } from '../lib/types';
import { useStore } from '../lib/store';
import { useThemeColors } from '../lib/theme';
import { formatDateRange, formatMoney, tripStatus } from '../lib/format';
import { GradientView, Tap } from './primitives';
import { AvatarGroup } from './Avatar';

function Scrim() {
  return (
    <>
      {Array.from({ length: 14 }).map((_, i) => (
        <View
          key={i}
          pointerEvents="none"
          style={{
            position: 'absolute', left: 0, right: 0, bottom: `${(i / 14) * 100}%`,
            height: `${100 / 14 + 0.8}%`,
            backgroundColor: `rgba(0,0,0,${0.62 * (1 - i / 14)})`,
          }}
        />
      ))}
    </>
  );
}

const statusStyle: Record<TripStatus, { label: string; color: string; bg: string }> = {
  upcoming: { label: 'Upcoming', color: '#5AC8FA', bg: 'rgba(90,200,250,0.22)' },
  active: { label: 'Active', color: '#34C97D', bg: 'rgba(52,201,125,0.22)' },
  past: { label: 'Past', color: '#FFB340', bg: 'rgba(255,179,64,0.22)' },
};

export function TripCard({ trip, onPress }: { trip: Trip; onPress: () => void }) {
  const { colors } = useThemeColors();
  const { tripTotal } = useStore();
  const total = tripTotal(trip.id);
  const status = tripStatus(trip);
  const s = statusStyle[status];

  return (
    <Tap onPress={onPress} style={{ paddingHorizontal: 16, marginBottom: 16 }}>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cover}>
          <GradientView colors={trip.coverGradient} style={StyleSheet.absoluteFill} />
          {trip.coverUri ? (
            <Image
              source={trip.coverUri}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={250}
              placeholder={trip.coverGradient[0]}
            />
          ) : null}
          <Scrim />
          <View style={styles.coverTop}>
            <View style={[styles.badge, { backgroundColor: s.bg }]}>
              <View style={[styles.dot, { backgroundColor: s.color }]} />
              <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
            </View>
          </View>
          <View style={styles.coverBottom}>
            <Text style={styles.name}>{trip.name}</Text>
            <Text style={styles.dest}>{trip.destination}</Text>
          </View>
        </View>
        <View style={styles.body}>
          <View style={styles.bodyRow}>
            <AvatarGroup members={trip.members} size={26} max={5} overlap={9} />
            <Text style={[styles.meta, { color: colors.secondaryLabel }]}>{formatDateRange(trip.startDate, trip.endDate)}  ·  {trip.members.length} people</Text>
          </View>
          <View style={[styles.bodyRow, { marginTop: 14 }]}>
            <View>
              <Text style={[styles.totalLabel, { color: colors.tertiaryLabel }]}>TOTAL SPENT</Text>
              <Text style={[styles.total, { color: colors.label }]}>{formatMoney(total, trip.currency)}</Text>
            </View>
            <View style={[styles.openBtn, { backgroundColor: colors.brand }]}>
              <Text style={styles.openBtnText}>Open Trip</Text>
              <Ionicons name="arrow-forward" size={15} color="#fff" style={{ marginLeft: 4 }} />
            </View>
          </View>
        </View>
      </View>
    </Tap>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, overflow: 'hidden' },
  cover: { height: 168, position: 'relative' },
  coverTop: { position: 'absolute', top: 12, left: 12, right: 12, flexDirection: 'row', justifyContent: 'flex-end' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  dot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  coverBottom: { position: 'absolute', left: 16, right: 16, bottom: 14 },
  name: { color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  dest: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600', marginTop: 2 },
  body: { padding: 16 },
  bodyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  meta: { fontSize: 13, fontWeight: '600' },
  totalLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  total: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5, marginTop: 2 },
  openBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 11, borderRadius: 22 },
  openBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
