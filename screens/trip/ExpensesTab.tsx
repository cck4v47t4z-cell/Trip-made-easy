import { useMemo } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../../lib/store';
import { useThemeColors } from '../../lib/theme';
import { formatMoney, formatDateFull } from '../../lib/format';
import type { Expense, Trip } from '../../lib/types';
import { Card } from '../../components/primitives';
import { ExpenseRow } from '../../components/ExpenseRow';
import { EmptyState } from '../../components/EmptyState';

export function ExpensesTab({ trip }: { trip: Trip }) {
  const { colors } = useThemeColors();
  const { tripExpenses } = useStore();
  const navigation = useNavigation<any>();
  const expenses = tripExpenses(trip.id);

  const sections = useMemo(() => {
    const map = new Map<string, Expense[]>();
    for (const e of expenses) {
      const key = e.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, items]) => {
        const dayTotal = items.reduce((s, e) => s + e.amount, 0);
        return { date, data: items, dayTotal };
      });
  }, [expenses]);

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  if (expenses.length === 0) {
    return (
      <EmptyState
        icon="receipt"
        title="No expenses yet"
        subtitle="Tap the + button to add your first expense. Splitting happens automatically."
        actionLabel="Add Expense"
        onAction={() => navigation.navigate('AddExpense', { tripId: trip.id })}
      />
    );
  }

  return (
    <SectionList
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 100 }}
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6 }}>
          <Card>
            <View style={styles.summaryRow}>
              <View>
                <Text style={[styles.sumLabel, { color: colors.tertiaryLabel }]}>TOTAL SPENT</Text>
                <Text style={[styles.sumValue, { color: colors.label }]}>{formatMoney(total, trip.currency)}</Text>
              </View>
              <View style={styles.sumRight}>
                <Text style={[styles.sumCount, { color: colors.secondaryLabel }]}>{expenses.length} expense{expenses.length === 1 ? '' : 's'}</Text>
              </View>
            </View>
          </Card>
        </View>
      }
      sections={sections}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHead}>
          <Text style={[styles.sectionDate, { color: colors.label }]}>{formatDateFull(section.date)}</Text>
          <Text style={[styles.sectionTotal, { color: colors.secondaryLabel }]}>{formatMoney(section.dayTotal, trip.currency)}</Text>
        </View>
      )}
      renderItem={({ item, section, index }) => (
        <View style={{ paddingHorizontal: 16 }}>
          <Card padded={false}>
            <ExpenseRow
              expense={item}
              members={trip.members}
              currency={trip.currency}
              onPress={() => navigation.navigate('AddExpense', { tripId: trip.id, expenseId: item.id })}
              showDivider={index < section.data.length - 1}
            />
          </Card>
        </View>
      )}
      keyExtractor={(item) => item.id}
    />
  );
}

const styles = StyleSheet.create({
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sumLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  sumValue: { fontSize: 26, fontWeight: '800', letterSpacing: -0.6, marginTop: 3 },
  sumRight: { alignItems: 'flex-end' },
  sumCount: { fontSize: 14, fontWeight: '600' },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8 },
  sectionDate: { fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
  sectionTotal: { fontSize: 13.5, fontWeight: '700' },
});
