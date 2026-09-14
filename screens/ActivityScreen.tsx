import { useMemo } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../lib/store';
import { useThemeColors } from '../lib/theme';
import { formatMoney, formatDateFull, timeAgo } from '../lib/format';
import type { ActivityItem } from '../lib/types';
import { ScreenShell } from '../components/NavHeader';
import { Pill } from '../components/primitives';
import { EmptyState } from '../components/EmptyState';
import Ionicons from '@expo/vector-icons/Ionicons';

const kindMeta: Record<ActivityItem['kind'], { icon: string; color: string }> = {
  expense: { icon: 'cash', color: '#30C97D' },
  memory: { icon: 'camera', color: '#9B6BFF' },
  place: { icon: 'location', color: '#FF9F0A' },
  settlement: { icon: 'checkmark-done', color: '#3B6FF6' },
  member: { icon: 'person-add', color: '#FF5C8A' },
  trip: { icon: 'airplane', color: '#5AC8FA' },
};

export function ActivityScreen() {
  const { colors } = useThemeColors();
  const { activity } = useStore();

  const sections = useMemo(() => {
    const map = new Map<string, ActivityItem[]>();
    for (const a of activity) {
      const d = (a.date.split('T')[0] ?? a.date);
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(a);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0])).map(([date, items]) => ({ date, data: items }));
  }, [activity]);

  return (
    <ScreenShell edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.label }]}>Activity</Text>
      </View>
      <SectionList
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        stickySectionHeadersEnabled={false}
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHead}><Text style={[styles.sectionDate, { color: colors.secondaryLabel }]}>{formatDateFull(section.date)}</Text></View>
        )}
        renderItem={({ item }) => {
          const meta = kindMeta[item.kind];
          return (
            <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
              <View style={[styles.row, { backgroundColor: colors.card }]}>
                <View style={[styles.icon, { backgroundColor: meta.color }]}><Ionicons name={meta.icon as any} size={17} color="#fff" /></View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.text, { color: colors.label }]} numberOfLines={2}>{item.text}</Text>
                  <View style={styles.metaRow}>
                    <Pill icon="airplane-outline" color={colors.secondaryLabel}>{item.tripName}</Pill>
                    <Text style={[styles.time, { color: colors.tertiaryLabel }]}>{timeAgo(item.date)}</Text>
                  </View>
                </View>
                {item.amount ? <Text style={[styles.amount, { color: colors.label }]}>{formatMoney(item.amount, 'INR')}</Text> : null}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<EmptyState icon="time-outline" title="No activity yet" subtitle="Expenses, memories and changes will show up here." />}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  sectionHead: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  sectionDate: { fontSize: 13, fontWeight: '800', letterSpacing: 0.3, textTransform: 'uppercase' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16 },
  icon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 14.5, fontWeight: '600', letterSpacing: -0.1, lineHeight: 19 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 7 },
  time: { fontSize: 12, fontWeight: '600' },
  amount: { fontSize: 15, fontWeight: '800' },
});
