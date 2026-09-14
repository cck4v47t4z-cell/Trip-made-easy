import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useStore } from '../lib/store';
import { useThemeColors, categoryMeta } from '../lib/theme';
import { formatMoney, tripDuration, formatDateRange } from '../lib/format';
import type { ExpenseCategory } from '../lib/types';
import type { RootStackParamList } from '../navigation/types';
import { ScreenShell, NavHeader } from '../components/NavHeader';
import { Card, Tap, GradientView } from '../components/primitives';
import { PlaceIcon } from '../components/CategoryIcon';
import Ionicons from '@expo/vector-icons/Ionicons';

export function AISummaryScreen() {
  const { colors } = useThemeColors();
  const { getTrip, tripExpenses, tripMemories, tripPlaces, balances } = useStore();
  const route = useRoute<RouteProp<RootStackParamList, 'AISummary'>>();
  const navigation = useNavigation<any>();
  const trip = getTrip(route.params.tripId);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  if (!trip) return null;

  const expenses = tripExpenses(trip.id);
  const memories = tripMemories(trip.id);
  const places = tripPlaces(trip.id);
  const total = balances(trip).grandTotal;
  const photoCount = memories.filter((m) => m.type === 'photo' || m.type === 'video').length;

  const byCat = {} as Record<ExpenseCategory, number>;
  for (const e of expenses) byCat[e.category] = (byCat[e.category] ?? 0) + e.amount;
  const topCat = (Object.keys(byCat) as ExpenseCategory[]).sort((a, b) => byCat[b] - byCat[a])[0];

  const rated = places.filter((p) => p.rating).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  const bestPlace = rated[0];
  const highlights = places.slice(0, 3).map((p) => p.name);
  const favMoments = memories.filter((m) => m.isFavorite).map((m) => m.caption || m.text).filter(Boolean).slice(0, 3);

  const story = `Our ${tripDuration(trip)}-day ${trip.name} adventure brought ${trip.members.length} of us together in ${trip.destination}. We logged ${expenses.length} expenses totalling ${formatMoney(total, trip.currency)} — mostly on ${topCat ?? 'miscellaneous'}${bestPlace ? `, with ${bestPlace.name} (★${bestPlace.rating?.toFixed(1)}) as the standout spot` : ''}.${highlights.length ? ` We wandered through ${highlights.join(', ')} and everywhere in between.` : ''}${favMoments.length ? ` Some moments we'll never forget: "${favMoments[0]}"` : ''} With ${photoCount} photos and ${places.length} places saved, this one's etched in memory.`;

  const stats = [
    { label: 'Days', value: String(tripDuration(trip)), icon: 'calendar' },
    { label: 'People', value: String(trip.members.length), icon: 'people' },
    { label: 'Spent', value: formatMoney(total, trip.currency), icon: 'wallet' },
    { label: 'Photos', value: String(photoCount), icon: 'camera' },
  ];

  const generate = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setGenerated(true); }, 1200);
  };

  return (
    <ScreenShell edges={['top', 'left', 'right']}>
      <NavHeader title="AI Summary" subtitle={trip.name} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}>
        <View style={{ paddingHorizontal: 16 }}>
          <GradientView colors={['#7B4DFF', '#FF6B4A']} style={styles.hero}>
            <Ionicons name="sparkles" size={26} color="#fff" />
            <Text style={styles.heroTitle}>Your trip, retold</Text>
            <Text style={styles.heroSub}>A story generated from your expenses, places and memories.</Text>
          </GradientView>
        </View>

        <View style={styles.statsRow}>
          {stats.map((s) => (
            <View key={s.label} style={{ width: '48.5%' }}>
              <Card style={{ padding: 14, alignItems: 'flex-start' }}>
                <View style={[styles.statIcon, { backgroundColor: colors.brand + '22' }]}><Ionicons name={s.icon as any} size={15} color={colors.brand} /></View>
                <Text style={[styles.statValue, { color: colors.label }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryLabel }]}>{s.label}</Text>
              </Card>
            </View>
          ))}
        </View>

        {!generated ? (
          <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
            <Tap onPress={generate} scale={0.98}>
              <View style={[styles.genBtn, { backgroundColor: colors.brand }]}>
                {loading ? <View style={styles.spinner} /> : <Ionicons name="sparkles" size={18} color="#fff" />}
                <Text style={styles.genBtnText}>{loading ? 'Writing your story…' : 'Generate AI summary'}</Text>
              </View>
            </Tap>
          </View>
        ) : (
          <View style={{ marginTop: 18 }}>
            <View style={{ paddingHorizontal: 16 }}>
              <Card padded={false} style={{ padding: 18 }}>
                <Text style={[styles.storyTitle, { color: colors.label }]}>{trip.name} · {formatDateRange(trip.startDate, trip.endDate)}</Text>
                <Text style={[styles.story, { color: colors.label }]}>{story}</Text>
              </Card>
            </View>

            {topCat ? (
              <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
                <SectionLabel>Most expensive category</SectionLabel>
                <Card><View style={styles.insightRow}><View style={[styles.insightIcon, { backgroundColor: categoryMeta[topCat].color }]}><Ionicons name={categoryMeta[topCat].icon as any} size={16} color="#fff" /></View><Text style={[styles.insightText, { color: colors.label }]}>{topCat}</Text><Text style={[styles.insightVal, { color: colors.label }]}>{formatMoney(byCat[topCat], trip.currency)}</Text></View></Card>
              </View>
            ) : null}

            {bestPlace ? (
              <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
                <SectionLabel>Best-rated place</SectionLabel>
                <Card><View style={styles.insightRow}><PlaceIcon category={bestPlace.category} size={36} radius={10} /><View style={{ flex: 1, marginLeft: 12 }}><Text style={[styles.insightText, { color: colors.label }]}>{bestPlace.name}</Text><Text style={[styles.insightSub, { color: colors.secondaryLabel }]}>★ {bestPlace.rating?.toFixed(1)} · {bestPlace.category}</Text></View></View></Card>
              </View>
            ) : null}

            {highlights.length ? (
              <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
                <SectionLabel>Highlights</SectionLabel>
                <View style={styles.highlightRow}>
                  {highlights.map((h) => <View key={h} style={[styles.highlightChip, { backgroundColor: colors.card }]}><Ionicons name="star" size={12} color="#FFB340" /><Text style={[styles.highlightText, { color: colors.label }]}>{h}</Text></View>)}
                </View>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </ScreenShell>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  const { colors } = useThemeColors();
  return <Text style={[{ fontSize: 12, fontWeight: '800', letterSpacing: 0.4, marginBottom: 8, marginLeft: 2, textTransform: 'uppercase' }, { color: colors.secondaryLabel }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  hero: { borderRadius: 18, padding: 20, alignItems: 'flex-start' },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.4, marginTop: 10 },
  heroSub: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '600', marginTop: 4, lineHeight: 19 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 14, gap: 10 },
  statIcon: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 19, fontWeight: '800', letterSpacing: -0.3 },
  statLabel: { fontSize: 12.5, fontWeight: '600', marginTop: 2 },
  genBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 16 },
  genBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  spinner: { width: 20, height: 20, borderRadius: 10, borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.4)', borderTopColor: '#fff' },
  storyTitle: { fontSize: 16, fontWeight: '800', letterSpacing: -0.2, marginBottom: 10 },
  story: { fontSize: 15.5, lineHeight: 24, fontWeight: '500' },
  insightRow: { flexDirection: 'row', alignItems: 'center' },
  insightIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  insightText: { flex: 1, marginLeft: 12, fontSize: 15.5, fontWeight: '700' },
  insightSub: { fontSize: 12.5, fontWeight: '600', marginTop: 2 },
  insightVal: { fontSize: 16, fontWeight: '800' },
  highlightRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  highlightChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, gap: 6 },
  highlightText: { fontSize: 13.5, fontWeight: '700' },
});
