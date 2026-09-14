import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../../lib/store';
import { useThemeColors } from '../../lib/theme';
import { formatMoney, tripStatus, daysUntil, tripDuration, formatDateRange, formatDateShort } from '../../lib/format';
import type { Trip } from '../../lib/types';
import { Card, Tap, Pill, ProgressBar, SectionTitle } from '../../components/primitives';
import { ExpenseRow } from '../../components/ExpenseRow';
import { EmptyState } from '../../components/EmptyState';
import Ionicons from '@expo/vector-icons/Ionicons';

export function OverviewTab({ trip, onSeeAllExpenses }: { trip: Trip; onSeeAllExpenses?: () => void }) {
  const { colors } = useThemeColors();
  const { balances, tripExpenses } = useStore();
  const navigation = useNavigation<any>();
  const bal = balances(trip);
  const me = bal.balances['me'] ?? 0;
  const youOwe = me < 0 ? -me : 0;
  const owedToYou = me > 0 ? me : 0;
  const yourSpending = bal.totalShare['me'] ?? 0;
  const expenses = tripExpenses(trip.id).slice(0, 5);
  const status = tripStatus(trip);
  const duration = tripDuration(trip);
  const startsIn = daysUntil(trip.startDate);

  const spent = bal.grandTotal;
  const budget = trip.budget;
  const remaining = (budget ?? 0) - spent;
  const pct = budget ? spent / budget : 0;
  const overspend = budget ? spent > budget : false;

  return (
    <View style={{ paddingBottom: 100 }}>
      {/* Hero total */}
      <View style={{ paddingHorizontal: 16 }}>
        <Card padded={false} style={{ padding: 18 }}>
          <Text style={[styles.totalLabel, { color: colors.tertiaryLabel }]}>TOTAL SPENT</Text>
          <Text style={[styles.totalBig, { color: colors.label }]}>{formatMoney(spent, trip.currency)}</Text>
          <Text style={[styles.totalSub, { color: colors.secondaryLabel }]}>
            {trip.members.length} people · {duration} days · {formatDateRange(trip.startDate, trip.endDate)}
          </Text>
        </Card>
      </View>

      {/* Balance stats */}
      <View style={styles.statsGrid}>
        <StatCard label="Your spending" value={formatMoney(yourSpending, trip.currency)} icon="card" color={colors.brand} />
        <StatCard label="You owe" value={youOwe > 0 ? formatMoney(youOwe, trip.currency) : '—'} icon="arrow-up" color={colors.orange} negative={youOwe > 0} />
        <StatCard label="Owed to you" value={owedToYou > 0 ? formatMoney(owedToYou, trip.currency) : '—'} icon="arrow-down" color={colors.green} positive={owedToYou > 0} />
        <StatCard label="You paid" value={formatMoney(bal.totalPaid['me'] ?? 0, trip.currency)} icon="wallet" color="#9B6BFF" />
      </View>

      {/* Settle up CTA */}
      {(youOwe > 0 || owedToYou > 0) ? (
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <Tap onPress={() => navigation.navigate('SettleUp', { tripId: trip.id })} scale={0.99}>
            <View style={[styles.settleCta, { backgroundColor: colors.card }]}>
              <View style={[styles.settleIcon, { backgroundColor: youOwe > 0 ? colors.orange : colors.green }]}>
                <Ionicons name="swap-horizontal" size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settleTitle, { color: colors.label }]}>
                  {youOwe > 0 ? `You owe ${formatMoney(youOwe, trip.currency)}` : `You're owed ${formatMoney(owedToYou, trip.currency)}`}
                </Text>
                <Text style={[styles.settleSub, { color: colors.secondaryLabel }]}>Tap to settle up & simplify payments</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.tertiaryLabel} />
            </View>
          </Tap>
        </View>
      ) : null}

      {/* Budget */}
      {budget ? (
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <SectionTitle action="Manage" onAction={() => navigation.navigate('Budget', { tripId: trip.id })}>Budget</SectionTitle>
          <Card>
            <View style={styles.budgetHead}>
              <Text style={[styles.budgetLabel, { color: colors.secondaryLabel }]}>Spent {formatMoney(spent, trip.currency)} of {formatMoney(budget, trip.currency)}</Text>
              <Text style={[styles.budgetRemain, { color: overspend ? colors.red : colors.green }]}>
                {overspend ? `${formatMoney(spent - budget, trip.currency)} over` : `${formatMoney(remaining, trip.currency)} left`}
              </Text>
            </View>
            <View style={{ marginTop: 10 }}>
              <ProgressBar value={pct} color={overspend ? colors.red : pct > 0.85 ? colors.orange : colors.brand} />
            </View>
            {pct > 0.85 && !overspend ? (
              <View style={[styles.warn, { backgroundColor: colors.orange + '18' }]}>
                <Ionicons name="warning" size={14} color={colors.orange} />
                <Text style={[styles.warnText, { color: colors.orange }]}>You're spending faster than planned.</Text>
              </View>
            ) : null}
          </Card>
        </View>
      ) : (
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <SectionTitle action="Set" onAction={() => navigation.navigate('Budget', { tripId: trip.id })}>Budget</SectionTitle>
          <Tap onPress={() => navigation.navigate('Budget', { tripId: trip.id })} scale={0.99}>
            <Card>
              <View style={styles.setBudgetRow}>
                <Ionicons name="speedometer-outline" size={20} color={colors.secondaryLabel} />
                <Text style={[styles.setBudgetText, { color: colors.secondaryLabel }]}>Set a budget to track spending</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.tertiaryLabel} />
              </View>
            </Card>
          </Tap>
        </View>
      )}

      {/* Upcoming / status banner */}
      <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
        <SectionTitle action="Timeline" onAction={() => navigation.navigate('Timeline', { tripId: trip.id })}>Upcoming plans</SectionTitle>
        <Card>
          <View style={styles.planRow}>
            <View style={[styles.planIcon, { backgroundColor: status === 'active' ? colors.green : colors.brand }]}>
              <Ionicons name={status === 'past' ? 'airplane' : status === 'active' ? 'navigate' : 'calendar'} size={18} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.planTitle, { color: colors.label }]}>
                {status === 'upcoming' ? `Trip starts in ${startsIn} day${startsIn === 1 ? '' : 's'}` : status === 'active' ? 'Trip is live 🎉' : 'Trip completed'}
              </Text>
              <Text style={[styles.planSub, { color: colors.secondaryLabel }]}>
                {status === 'active' ? 'Keep adding expenses and memories.' : status === 'upcoming' ? 'Add places and an itinerary to plan ahead.' : 'Settle up and relive your memories.'}
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Recent expenses */}
      <View style={{ marginTop: 14 }}>
        <SectionTitle action="See all" onAction={onSeeAllExpenses}>Recent expenses</SectionTitle>
        {expenses.length === 0 ? (
          <EmptyState icon="receipt" title="No expenses yet" subtitle="Add your first expense to start splitting." actionLabel="Add Expense" onAction={() => navigation.navigate('AddExpense', { tripId: trip.id })} />
        ) : (
          <Card padded={false}>
            {expenses.map((e, i) => (
              <ExpenseRow key={e.id} expense={e} members={trip.members} currency={trip.currency} onPress={() => navigation.navigate('AddExpense', { tripId: trip.id, expenseId: e.id })} showDivider={i < expenses.length - 1} />
            ))}
          </Card>
        )}
      </View>
    </View>
  );
}

function StatCard({ label, value, icon, color, negative, positive }: { label: string; value: string; icon: string; color: string; negative?: boolean; positive?: boolean }) {
  const { colors } = useThemeColors();
  return (
    <View style={{ width: '48.5%' }}>
      <Card style={{ padding: 15 }}>
        <View style={[styles.statIcon, { backgroundColor: color }]}>
          <Ionicons name={icon as any} size={15} color="#fff" />
        </View>
        <Text style={[styles.statValue, { color: colors.label }, negative && { color: colors.orange }, positive && { color: colors.green }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: colors.secondaryLabel }]}>{label}</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  totalLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  totalBig: { fontSize: 38, fontWeight: '800', letterSpacing: -1.2, marginTop: 4 },
  totalSub: { fontSize: 13.5, fontWeight: '600', marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 14 },
  statIcon: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  statLabel: { fontSize: 12.5, fontWeight: '600', marginTop: 2 },
  settleCta: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16 },
  settleIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  settleTitle: { fontSize: 15.5, fontWeight: '700', letterSpacing: -0.2 },
  settleSub: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  budgetHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  budgetLabel: { fontSize: 14, fontWeight: '600' },
  budgetRemain: { fontSize: 14, fontWeight: '800' },
  warn: { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, gap: 6 },
  warnText: { fontSize: 12.5, fontWeight: '700' },
  planRow: { flexDirection: 'row', alignItems: 'center' },
  planIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  planTitle: { fontSize: 15.5, fontWeight: '700', letterSpacing: -0.2 },
  planSub: { fontSize: 13, fontWeight: '500', marginTop: 3 },
  setBudgetRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  setBudgetText: { flex: 1, fontSize: 14.5, fontWeight: '500' },
});
