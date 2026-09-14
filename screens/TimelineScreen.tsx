import { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useStore } from '../lib/store';
import { useThemeColors, categoryMeta } from '../lib/theme';
import { formatMoney, formatDateFull, daysUntil, tripStatus, tripDuration, parseDate } from '../lib/format';
import type { ExpenseCategory } from '../lib/types';
import type { RootStackParamList } from '../navigation/types';
import { ScreenShell, NavHeader } from '../components/NavHeader';
import { CategoryIcon } from '../components/CategoryIcon';
import { PlaceIcon } from '../components/CategoryIcon';
import Ionicons from '@expo/vector-icons/Ionicons';

type Ev = { ts: number; date: string; kind: 'expense' | 'memory' | 'place'; icon: string; color: string; title: string; sub?: string; amount?: number; uri?: string; photo?: boolean; category?: ExpenseCategory };

export function TimelineScreen() {
  const { colors } = useThemeColors();
  const { getTrip, tripExpenses, tripMemories, tripPlaces, balances } = useStore();
  const route = useRoute<RouteProp<RootStackParamList, 'Timeline'>>();
  const navigation = useNavigation<any>();
  const trip = getTrip(route.params.tripId);
  if (!trip) return null;

  const events = useMemo<Ev[]>(() => {
    const evs: Ev[] = [];
    for (const e of tripExpenses(trip.id)) {
      evs.push({ ts: new Date(e.createdAt).getTime(), date: e.date, kind: 'expense', icon: categoryMeta[e.category].icon, color: categoryMeta[e.category].color, title: e.description, sub: 'paid for this', amount: e.amount, category: e.category });
    }
    for (const m of tripMemories(trip.id)) {
      const d = (m.date.split('T')[0] ?? m.date);
      const isPhoto = m.type === 'photo' || m.type === 'video';
      evs.push({ ts: new Date(m.date).getTime(), date: d, kind: 'memory', icon: isPhoto ? 'camera' : m.type === 'location' ? 'location' : 'chatbubble', color: '#9B6BFF', title: m.caption || m.text || m.locationName || 'A moment', uri: isPhoto ? m.uri : undefined, photo: isPhoto });
    }
    for (const p of tripPlaces(trip.id)) {
      evs.push({ ts: parseDate(p.date).getTime() + 3 * 3600000, date: p.date, kind: 'place', icon: 'location', color: '#FF9F0A', title: p.name, sub: 'added a place' });
    }
    return evs.sort((a, b) => a.ts - b.ts);
  }, [trip.id]);

  const groups = useMemo(() => {
    const map = new Map<string, Ev[]>();
    for (const e of events) {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date)!.push(e);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [events]);

  const status = tripStatus(trip);

  return (
    <ScreenShell edges={['top', 'left', 'right']}>
      <NavHeader title="Timeline" subtitle={trip.name} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}>
        <View style={{ paddingHorizontal: 16 }}>
          <View style={[styles.intro, { backgroundColor: colors.card }]}>
            <Text style={[styles.introDays, { color: colors.label }]}>{tripDuration(trip)} days</Text>
            <Text style={[styles.introSub, { color: colors.secondaryLabel }]}>{tripMemories(trip.id).filter((m) => m.type === 'photo' || m.type === 'video').length} photos · {tripPlaces(trip.id).length} places · {formatMoney(balances(trip).grandTotal, trip.currency)}</Text>
          </View>
        </View>

        {groups.length === 0 ? (
          <View style={{ marginTop: 40, alignItems: 'center' }}>
            <Text style={{ color: colors.secondaryLabel }}>No activity yet. Add expenses and memories to build your diary.</Text>
          </View>
        ) : null}

        {groups.map(([date, items]) => {
          const offset = daysUntil(date, trip.startDate);
          const dayNum = offset >= 0 ? offset + 1 : 1;
          const daySpent = items.filter((i) => i.kind === 'expense').reduce((s, i) => s + (i.amount ?? 0), 0);
          const dayPhotos = items.filter((i) => i.kind === 'memory' && i.photo).length;
          return (
            <View key={date} style={{ paddingHorizontal: 16, marginTop: 22 }}>
              <View style={styles.dayHeader}>
                <View style={[styles.dayBadge, { backgroundColor: colors.brand }]}>
                  <Text style={styles.dayBadgeText}>DAY {dayNum}</Text>
                </View>
                <Text style={[styles.dayDate, { color: colors.label }]}>{formatDateFull(date)}</Text>
                <View style={{ flex: 1 }} />
                {daySpent > 0 ? <Text style={[styles.dayStat, { color: colors.secondaryLabel }]}>{formatMoney(daySpent, trip.currency)}</Text> : null}
                {dayPhotos > 0 ? <Text style={[styles.dayStat, { color: colors.secondaryLabel }]}>{dayPhotos} 📷</Text> : null}
              </View>
              <View style={[styles.timeline, { borderLeftColor: colors.separator }]}>
                {items.map((ev, i) => (
                  <View key={i} style={styles.tlItem}>
                    <View style={[styles.tlDot, { backgroundColor: ev.color }]} />
                    {ev.photo && ev.uri ? (
                      <View style={[styles.tlCard, { backgroundColor: colors.card }]}>
                        <Image source={ev.uri} style={styles.tlPhoto} contentFit="cover" />
                        <View style={{ padding: 10 }}>
                          <Text style={[styles.tlTitle, { color: colors.label }]} numberOfLines={2}>{ev.title}</Text>
                        </View>
                      </View>
                    ) : (
                      <View style={[styles.tlCard, { backgroundColor: colors.card }]}>
                        <View style={styles.tlRow}>
                          {ev.kind === 'expense' ? (
                            <CategoryIcon category={ev.category!} size={32} radius={10} />
                          ) : ev.kind === 'place' ? (
                            <PlaceIcon category="Attraction" size={32} radius={10} />
                          ) : (
                            <View style={[styles.tlIcon, { backgroundColor: ev.color }]}><Ionicons name={ev.icon as any} size={16} color="#fff" /></View>
                          )}
                          <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={[styles.tlTitle, { color: colors.label }]} numberOfLines={1}>{ev.title}</Text>
                            {ev.sub ? <Text style={[styles.tlSub, { color: colors.secondaryLabel }]}>{ev.sub}</Text> : null}
                          </View>
                          {ev.amount ? <Text style={[styles.tlAmount, { color: colors.label }]}>{formatMoney(ev.amount, trip.currency)}</Text> : null}
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  intro: { borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  introDays: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  introSub: { fontSize: 13, fontWeight: '600' },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  dayBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10 },
  dayBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  dayDate: { fontSize: 14, fontWeight: '700' },
  dayStat: { fontSize: 12.5, fontWeight: '700', marginLeft: 8 },
  timeline: { borderLeftWidth: 2, marginLeft: 6, paddingLeft: 18, paddingVertical: 4 },
  tlItem: { marginBottom: 10, position: 'relative' },
  tlDot: { position: 'absolute', left: -23, top: 16, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#fff' },
  tlCard: { borderRadius: 14, overflow: 'hidden' },
  tlRow: { flexDirection: 'row', alignItems: 'center', padding: 11 },
  tlIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tlTitle: { fontSize: 14.5, fontWeight: '700', letterSpacing: -0.2 },
  tlSub: { fontSize: 12.5, fontWeight: '500', marginTop: 2 },
  tlAmount: { fontSize: 15, fontWeight: '800' },
  tlPhoto: { width: '100%', height: 130 },
});
