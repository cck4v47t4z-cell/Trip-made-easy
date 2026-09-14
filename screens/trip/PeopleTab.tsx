import { StyleSheet, Text, View, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../../lib/store';
import { useThemeColors } from '../../lib/theme';
import { formatMoney } from '../../lib/format';
import type { Member, Trip } from '../../lib/types';
import { Card, Tap, Pill } from '../../components/primitives';
import { Avatar } from '../../components/Avatar';
import { EmptyState } from '../../components/EmptyState';
import Ionicons from '@expo/vector-icons/Ionicons';

export function PeopleTab({ trip }: { trip: Trip }) {
  const { colors } = useThemeColors();
  const { balances } = useStore();
  const navigation = useNavigation<any>();
  const bal = balances(trip);
  const avg = bal.grandTotal / Math.max(1, trip.members.length);

  return (
    <FlatList
      data={trip.members}
      keyExtractor={(m) => m.id}
      contentContainerStyle={{ paddingBottom: 100 }}
      ListHeaderComponent={
        <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
          <Card>
            <Text style={[styles.headLabel, { color: colors.tertiaryLabel }]}>SPLIT AMONG</Text>
            <Text style={[styles.headValue, { color: colors.label }]}>{trip.members.length} people</Text>
            <Text style={[styles.headSub, { color: colors.secondaryLabel }]}>~{formatMoney(avg, trip.currency)} per person</Text>
          </Card>
          <View style={{ height: 14 }} />
          <Tap onPress={() => navigation.navigate('InviteMembers', { tripId: trip.id })} scale={0.99}>
            <View style={[styles.inviteBtn, { backgroundColor: colors.card, borderColor: colors.separator }]}>
              <View style={[styles.inviteIcon, { backgroundColor: colors.brand }]}>
                <Ionicons name="person-add" size={18} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inviteTitle, { color: colors.label }]}>Invite more friends</Text>
                <Text style={[styles.inviteSub, { color: colors.secondaryLabel }]}>Via contacts, phone, email or a link</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.tertiaryLabel} />
            </View>
          </Tap>
        </View>
      }
      renderItem={({ item }) => <MemberRow member={item} trip={trip} paid={bal.totalPaid[item.id] ?? 0} share={bal.totalShare[item.id] ?? 0} balance={bal.balances[item.id] ?? 0} />}
      ListEmptyComponent={<EmptyState icon="people" title="No members" />}
    />
  );
}

function MemberRow({ member, trip, paid, share, balance }: { member: Member; trip: Trip; paid: number; share: number; balance: number }) {
  const { colors } = useThemeColors();
  const owes = balance < 0;
  const gets = balance > 0;
  const settled = Math.abs(balance) < 0.01;
  return (
    <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
      <Card>
        <View style={styles.row}>
          <Avatar member={member} size={44} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.name, { color: colors.label }]}>{member.name}{member.isCurrentUser ? '  (You)' : ''}</Text>
            <Text style={[styles.meta, { color: colors.secondaryLabel }]}>
              Paid {formatMoney(paid, trip.currency)} · Share {formatMoney(share, trip.currency)}
            </Text>
          </View>
          <View style={styles.balanceBox}>
            {settled ? (
              <Pill icon="checkmark-circle" color={colors.green}>settled</Pill>
            ) : owes ? (
              <Text style={[styles.balanceText, { color: colors.orange }]}>owes {formatMoney(-balance, trip.currency)}</Text>
            ) : (
              <Text style={[styles.balanceText, { color: colors.green }]}>gets {formatMoney(balance, trip.currency)}</Text>
            )}
          </View>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  headLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  headValue: { fontSize: 28, fontWeight: '800', letterSpacing: -0.7, marginTop: 3 },
  headSub: { fontSize: 13.5, fontWeight: '600', marginTop: 2 },
  inviteBtn: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth },
  inviteIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  inviteTitle: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  inviteSub: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  meta: { fontSize: 12.5, fontWeight: '500', marginTop: 3 },
  balanceBox: { alignItems: 'flex-end' },
  balanceText: { fontSize: 14, fontWeight: '800' },
});
