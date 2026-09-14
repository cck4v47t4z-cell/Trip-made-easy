import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../lib/store';
import { useThemeColors } from '../lib/theme';
import { ScreenShell, NavHeader } from '../components/NavHeader';
import { Tap, GradientView } from '../components/primitives';
import Ionicons from '@expo/vector-icons/Ionicons';

export function QuickAddScreen() {
  const { colors } = useThemeColors();
  const { trips, currentTripId } = useStore();
  const navigation = useNavigation<any>();
  const [selected, setSelected] = useState(currentTripId ?? trips[0]?.id ?? null);
  const trip = trips.find((t) => t.id === selected) ?? trips[0];

  const actions = [
    { key: 'expense', label: 'Expense', desc: 'Split with everyone', icon: 'cash', colors: ['#30C97D', '#1FB96A'] as [string, string], route: 'AddExpense' },
    { key: 'photo', label: 'Photo', desc: 'Add to memories', icon: 'camera', colors: ['#3B6FF6', '#7B4DFF'] as [string, string], route: 'AddMemory' },
    { key: 'place', label: 'Place', desc: 'Save a spot', icon: 'location', colors: ['#FF9F0A', '#FF6B4A'] as [string, string], route: 'AddPlace' },
    { key: 'note', label: 'Note', desc: 'A quick memory', icon: 'chatbubble', colors: ['#9B6BFF', '#FF5C8A'] as [string, string], route: 'AddMemory' },
  ];

  const go = (a: typeof actions[number]) => {
    if (!trip) return;
    if (a.route === 'AddExpense') navigation.replace('AddExpense', { tripId: trip.id });
    else if (a.route === 'AddPlace') navigation.replace('AddPlace', { tripId: trip.id });
    else navigation.replace('AddMemory', { tripId: trip.id, kind: a.key });
  };

  return (
    <ScreenShell edges={['top', 'left', 'right']}>
      <NavHeader title="Quick Add" backIcon="close" onBack={() => navigation.goBack()} />
      <View style={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 10 }}>
        <Text style={[styles.label, { color: colors.secondaryLabel }]}>ADD TO</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 16 }}>
        {trips.map((t) => {
          const active = t.id === selected;
          return (
            <Tap key={t.id} onPress={() => setSelected(t.id)} scale={0.95}>
              <View style={[styles.tripChip, { backgroundColor: active ? colors.brand : colors.cardSecondary }]}>
                <Ionicons name="airplane" size={14} color={active ? '#fff' : colors.secondaryLabel} />
                <Text style={[styles.tripChipText, { color: active ? '#fff' : colors.secondaryLabel }]}>{t.name}</Text>
              </View>
            </Tap>
          );
        })}
      </ScrollView>

      <View style={styles.grid}>
        {actions.map((a) => (
          <Tap key={a.key} onPress={() => go(a)} scale={0.97} style={{ width: '48.5%' }}>
            <View style={[styles.actionCard, { backgroundColor: colors.card }]}>
              <GradientView colors={a.colors} style={styles.actionIcon}>
                <Ionicons name={a.icon as any} size={26} color="#fff" />
              </GradientView>
              <Text style={[styles.actionLabel, { color: colors.label }]}>{a.label}</Text>
              <Text style={[styles.actionDesc, { color: colors.secondaryLabel }]}>{a.desc}</Text>
            </View>
          </Tap>
        ))}
      </View>
      {!trip ? <Text style={{ textAlign: 'center', color: colors.secondaryLabel, marginTop: 30 }}>Create a trip first.</Text> : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '800', letterSpacing: 0.4 },
  tripChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, paddingVertical: 8, borderRadius: 20, gap: 6 },
  tripChipText: { fontSize: 13.5, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12, justifyContent: 'space-between' },
  actionCard: { borderRadius: 20, padding: 18, alignItems: 'flex-start' },
  actionIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  actionLabel: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  actionDesc: { fontSize: 13.5, fontWeight: '600', marginTop: 3 },
});
