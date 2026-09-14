import { StyleSheet, Text, View, FlatList } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useStore } from '../lib/store';
import { useThemeColors } from '../lib/theme';
import { formatMoney, formatDateLong } from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { ScreenShell, NavHeader } from '../components/NavHeader';
import { Card, Tap, SectionTitle } from '../components/primitives';
import { Avatar } from '../components/Avatar';
import { EmptyState } from '../components/EmptyState';
import Ionicons from '@expo/vector-icons/Ionicons';

export function SettleUpScreen() {
  const { colors } = useThemeColors();
  const { getTrip, settlementView, markSettlementPaid } = useStore();
  const route = useRoute<RouteProp<RootStackParamList, 'SettleUp'>>();
  const navigation = useNavigation<any>();
  const trip = getTrip(route.params.tripId);
  if (!trip) return null;
  const view = settlementView(trip);
  const meBal = view.balances['me'] ?? 0;
  const youOwe = meBal < 0 ? -meBal : 0;
  const owedToYou = meBal > 0 ? meBal : 0;

  const name = (id: string) => trip.members.find((m) => m.id === id)?.name ?? 'Someone';
  const member = (id: string) => trip.members.find((m) => m.id === id)!;

  return (
    <ScreenShell edges={['top', 'left', 'right']}>
      <NavHeader title="Settle Up" subtitle={trip.name} onBack={() => navigation.goBack()} />
      <FlatList
        data={[] as any}
        renderItem={() => null}
        ListHeaderComponent={
          <View style={{ paddingBottom: 20 }}>
            {/* Hero balance */}
            <View style={{ paddingHorizontal: 16 }}>
              <Card padded={false} style={{ padding: 18 }}>
                <Text style={[styles.heroLabel, { color: colors.tertiaryLabel }]}>YOUR BALANCE</Text>
                {Math.abs(meBal) < 0.01 ? (
                  <Text style={[styles.heroValue, { color: colors.green }]}>All settled up 🎉</Text>
                ) : youOwe > 0 ? (
                  <Text style={[styles.heroValue, { color: colors.orange }]}>You owe {formatMoney(youOwe, trip.currency)}</Text>
                ) : (
                  <Text style={[styles.heroValue, { color: colors.green }]}>You're owed {formatMoney(owedToYou, trip.currency)}</Text>
                )}
                <View style={[styles.balanceChips, { marginTop: 14 }]}>
                  {trip.members.map((m) => {
                    const b = view.balances[m.id] ?? 0;
                    if (Math.abs(b) < 0.01) return null;
                    return (
                      <View key={m.id} style={[styles.balChip, { backgroundColor: colors.cardSecondary }]}>
                        <Avatar member={m} size={20} />
                        <Text style={[styles.balChipText, { color: b > 0 ? colors.green : colors.orange }]}>
                          {m.isCurrentUser ? 'You' : m.name.split(' ')[0]} {b > 0 ? `+${formatMoney(b, trip.currency)}` : formatMoney(b, trip.currency)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </Card>
            </View>

            {view.suggested.length > 0 ? (
              <View style={{ paddingHorizontal: 16, marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="git-network-outline" size={16} color={colors.brand} />
                <Text style={[styles.simplify, { color: colors.secondaryLabel }]}>
                  Simplified into {view.suggested.length} payment{view.suggested.length === 1 ? '' : 's'} — the fewest possible.
                </Text>
              </View>
            ) : null}

            {/* Suggested */}
            {view.suggested.length > 0 ? (
              <View style={{ marginTop: 16 }}>
                <SectionTitle>Suggested payments</SectionTitle>
                {view.suggested.map((s, i) => (
                  <View key={`s-${s.fromId}-${s.toId}-${i}`} style={{ paddingHorizontal: 16, marginBottom: 10 }}>
                    <Card>
                      <View style={styles.payRow}>
                        <View style={styles.payLeft}>
                          <Avatar member={member(s.fromId)} size={34} />
                          <Ionicons name="arrow-forward" size={16} color={colors.tertiaryLabel} />
                          <Avatar member={member(s.toId)} size={34} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={[styles.payWho, { color: colors.label }]} numberOfLines={1}>
                            {name(s.fromId)} pays {name(s.toId)}
                          </Text>
                          <Text style={[styles.payAmount, { color: colors.label }]}>{formatMoney(s.amount, trip.currency)}</Text>
                        </View>
                        <Tap onPress={() => markSettlementPaid(trip.id, s.fromId, s.toId, s.amount)} scale={0.94}>
                          <View style={[styles.paidBtn, { backgroundColor: colors.green }]}>
                            <Ionicons name="checkmark" size={15} color="#fff" />
                            <Text style={styles.paidBtnText}>Paid</Text>
                          </View>
                        </Tap>
                      </View>
                    </Card>
                  </View>
                ))}
              </View>
            ) : null}

            {/* History */}
            {view.history.length > 0 ? (
              <View style={{ marginTop: 16 }}>
                <SectionTitle>Transaction history</SectionTitle>
                {view.history.map((s) => (
                  <View key={s.id} style={{ paddingHorizontal: 16, marginBottom: 10 }}>
                    <Card>
                      <View style={styles.payRow}>
                        <View style={[styles.histIcon, { backgroundColor: colors.green + '22' }]}>
                          <Ionicons name="checkmark-done" size={18} color={colors.green} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={[styles.payWho, { color: colors.label }]} numberOfLines={1}>
                            {name(s.fromId)} → {name(s.toId)}
                          </Text>
                          <Text style={[styles.histDate, { color: colors.secondaryLabel }]}>{formatDateLong((s.paidAt ?? s.createdAt).split('T')[0] ?? s.paidAt ?? s.createdAt)}</Text>
                        </View>
                        <Text style={[styles.payAmount, { color: colors.green }]}>{formatMoney(s.amount, trip.currency)}</Text>
                      </View>
                    </Card>
                  </View>
                ))}
              </View>
            ) : null}

            {view.suggested.length === 0 && view.history.length === 0 ? (
              <EmptyState icon="checkmark-done-circle" title="Nothing to settle" subtitle="All balances are zero for this trip." />
            ) : null}
          </View>
        }
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  heroValue: { fontSize: 28, fontWeight: '800', letterSpacing: -0.7, marginTop: 4 },
  balanceChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  balChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, paddingVertical: 6, borderRadius: 16, gap: 6 },
  balChipText: { fontSize: 12.5, fontWeight: '800' },
  simplify: { fontSize: 13, fontWeight: '600', flex: 1, lineHeight: 18 },
  payRow: { flexDirection: 'row', alignItems: 'center' },
  payLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  payWho: { fontSize: 14.5, fontWeight: '700', letterSpacing: -0.2 },
  payAmount: { fontSize: 16, fontWeight: '800', marginTop: 2 },
  paidBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, paddingVertical: 9, borderRadius: 18, gap: 4 },
  paidBtnText: { color: '#fff', fontWeight: '800', fontSize: 13.5 },
  histIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  histDate: { fontSize: 12.5, fontWeight: '600', marginTop: 2 },
});
