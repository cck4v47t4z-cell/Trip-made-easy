import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Expense, Currency, Member } from '../lib/types';
import { useThemeColors } from '../lib/theme';
import { formatMoney, formatDateShort } from '../lib/format';
import { CategoryIcon } from './CategoryIcon';
import { Tap, Hairline } from './primitives';

export function ExpenseRow({
  expense, members, currency, onPress, showDivider = false,
}: {
  expense: Expense; members: Member[]; currency: Currency; onPress?: () => void; showDivider?: boolean;
}) {
  const { colors } = useThemeColors();
  const payer = members.find((m) => m.id === expense.paidBy);
  const n = expense.participants.length;
  const isMine = expense.paidBy === 'me';
  return (
    <>
      <Tap onPress={onPress} disabled={!onPress} scale={0.99}>
        <View style={styles.row}>
          <CategoryIcon category={expense.category} size={42} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.desc, { color: colors.label }]} numberOfLines={1}>{expense.description}</Text>
            <Text style={[styles.sub, { color: colors.secondaryLabel }]} numberOfLines={1}>
              {payer?.name ?? 'Someone'} paid · {formatDateShort(expense.date)} · split {n}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.amount, { color: colors.label }]}>{formatMoney(expense.amount, currency)}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
              {expense.placeId ? <Ionicons name="location" size={11} color={colors.tertiaryLabel} /> : null}
              {isMine ? (
                <Text style={[styles.you, { color: colors.green }]}>you paid</Text>
              ) : null}
            </View>
          </View>
        </View>
      </Tap>
      {showDivider ? <Hairline style={{ marginLeft: 54 }} /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  desc: { fontSize: 15.5, fontWeight: '600', letterSpacing: -0.2 },
  sub: { fontSize: 12.5, marginTop: 3, fontWeight: '500' },
  amount: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  you: { fontSize: 11, fontWeight: '700' },
});
