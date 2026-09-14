import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TextInput } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useStore } from '../lib/store';
import { useThemeColors, categoryMeta } from '../lib/theme';
import { formatMoney, tripStatus, currencySymbol } from '../lib/format';
import type { ExpenseCategory } from '../lib/types';
import type { RootStackParamList } from '../navigation/types';
import { ScreenShell, NavHeader } from '../components/NavHeader';
import { Card, Tap, ProgressBar, SectionTitle } from '../components/primitives';
import { CategoryIcon } from '../components/CategoryIcon';
import Ionicons from '@expo/vector-icons/Ionicons';

export function BudgetScreen() {
  const { colors } = useThemeColors();
  const { getTrip, tripExpenses, setBudget, balances } = useStore();
  const route = useRoute<RouteProp<RootStackParamList, 'Budget'>>();
  const navigation = useNavigation<any>();
  const trip = getTrip(route.params.tripId);
  const [draft, setDraft] = useState(trip?.budget ? String(trip.budget) : '');
  if (!trip) return null;
  const expenses = tripExpenses(trip.id);
  const spent = balances(trip).grandTotal;
  const budget = trip.budget ?? 0;
  const remaining = budget - spent;
  const pct = budget ? spent / budget : 0;
  const overspend = budget ? spent > budget : false;

  const byCat = {} as Record<ExpenseCategory, number>;
  for (const e of expenses) byCat[e.category] = (byCat[e.category] ?? 0) + e.amount;
  const cats = (Object.keys(byCat) as ExpenseCategory[]).map((c) => ({ c, amt: byCat[c] })).sort((a, b) => b.amt - a.amt);
  const maxCat = Math.max(1, ...cats.map((x) => x.amt));

  const apply = () => {
    const v = parseInt(draft.replace(/[^0-9]/g, ''), 10);
    setBudget(trip.id, isNaN(v) ? 0 : v);
  };
  const quick = [5000, 10000, 20000, 30000, 50000];

  return (
    <ScreenShell edges={['top', 'left', 'right']}>
      <NavHeader title="Budget" subtitle={trip.name} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}>
        <View style={{ paddingHorizontal: 16 }}>
          <Card padded={false} style={{ padding: 18 }}>
            <Text style={[styles.heroLabel, { color: colors.tertiaryLabel }]}>{budget ? 'BUDGET' : 'SET A BUDGET'}</Text>
            <Text style={[styles.heroValue, { color: overspend ? colors.red : colors.label }]}>
              {budget ? formatMoney(budget, trip.currency) : '—'}
            </Text>
            {budget ? (
              <Text style={[styles.heroSub, { color: colors.secondaryLabel }]}>
                Spent {formatMoney(spent, trip.currency)} · {overspend ? `${formatMoney(spent - budget, trip.currency)} over` : `${formatMoney(remaining, trip.currency)} remaining`}
              </Text>
            ) : (
              <Text style={[styles.heroSub, { color: colors.secondaryLabel }]}>Total spent so far: {formatMoney(spent, trip.currency)}</Text>
            )}
            {budget ? (
              <View style={{ marginTop: 14 }}>
                <ProgressBar value={pct} color={overspend ? colors.red : pct > 0.85 ? colors.orange : colors.brand} height={10} />
              </View>
            ) : null}
          </Card>
        </View>

        {/* Set / edit budget */}
        <View style={{ marginTop: 22 }}>
          <SectionTitle>{budget ? 'Adjust budget' : 'Set your budget'}</SectionTitle>
        </View>
        <View style={{ paddingHorizontal: 16 }}>
          <View style={[styles.budgetInputRow, { backgroundColor: colors.card, borderColor: colors.separator }]}>
            <Text style={[styles.budgetInputSym, { color: colors.secondaryLabel }]}>{currencySymbol(trip.currency)}</Text>
            <TextInput value={draft} onChangeText={setDraft} placeholder="0" placeholderTextColor={colors.tertiaryLabel} keyboardType="numeric" style={[styles.budgetInput, { color: colors.label }]} onSubmitEditing={apply} />
          </View>
          <View style={styles.quickRow}>
            {quick.map((q) => (
              <Tap key={q} onPress={() => { setDraft(String(q)); setBudget(trip.id, q); }} scale={0.95}>
                <View style={[styles.quickChip, { backgroundColor: colors.cardSecondary }]}>
                  <Text style={[styles.quickChipText, { color: colors.label }]}>{currencySymbol(trip.currency)}{q / 1000}k</Text>
                </View>
              </Tap>
            ))}
          </View>
          <Tap onPress={apply} scale={0.98} style={{ marginTop: 12 }}>
            <View style={[styles.saveBtn, { backgroundColor: colors.brand }]}>
              <Text style={styles.saveBtnText}>Save budget</Text>
            </View>
          </Tap>
        </View>

        {/* Category breakdown */}
        {cats.length > 0 ? (
          <View style={{ marginTop: 26 }}>
            <SectionTitle>Category breakdown</SectionTitle>
            <View style={{ paddingHorizontal: 16 }}>
              <Card>
                {cats.map((x, i) => (
                  <View key={x.c} style={[styles.catRow, i < cats.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator }]}>
                    <CategoryIcon category={x.c} size={34} radius={10} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={styles.catHead}>
                        <Text style={[styles.catName, { color: colors.label }]}>{x.c}</Text>
                        <Text style={[styles.catAmt, { color: colors.label }]}>{formatMoney(x.amt, trip.currency)}</Text>
                      </View>
                      <View style={{ marginTop: 7 }}>
                        <ProgressBar value={x.amt / maxCat} color={categoryMeta[x.c].color} height={6} />
                      </View>
                    </View>
                  </View>
                ))}
              </Card>
            </View>
          </View>
        ) : null}

        {pct > 0.85 && budget && !overspend ? (
          <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
            <View style={[styles.warn, { backgroundColor: colors.orange + '18' }]}>
              <Ionicons name="warning" size={18} color={colors.orange} />
              <Text style={[styles.warnText, { color: colors.orange }]}>You're spending faster than your planned budget.</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  heroValue: { fontSize: 36, fontWeight: '800', letterSpacing: -1, marginTop: 4 },
  heroSub: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  budgetInputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 14, borderWidth: StyleSheet.hairlineWidth, height: 54 },
  budgetInputSym: { fontSize: 20, fontWeight: '800' },
  budgetInput: { flex: 1, fontSize: 20, fontWeight: '800', marginLeft: 6 },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  quickChip: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 16 },
  quickChipText: { fontSize: 13.5, fontWeight: '700' },
  saveBtn: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  catRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  catHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catName: { fontSize: 14.5, fontWeight: '700' },
  catAmt: { fontSize: 15, fontWeight: '800' },
  warn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderRadius: 14 },
  warnText: { fontSize: 14, fontWeight: '700', flex: 1, lineHeight: 19 },
});
