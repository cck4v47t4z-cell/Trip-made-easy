import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../lib/store';
import { useThemeColors } from '../lib/theme';
import { formatMoney, tripStatus } from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { ScreenShell, NavHeader } from '../components/NavHeader';
import { Tap, OptionSheet, type OptionItem, SegmentedControl, type SegTab } from '../components/primitives';
import { OverviewTab } from './trip/OverviewTab';
import { ExpensesTab } from './trip/ExpensesTab';
import { MemoriesTab } from './trip/MemoriesTab';
import { PlacesTab } from './trip/PlacesTab';
import { PeopleTab } from './trip/PeopleTab';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Alert, Share } from 'react-native';

const TABS: SegTab[] = [
  { key: 'overview', label: 'Overview', icon: 'grid-outline' },
  { key: 'expenses', label: 'Expenses', icon: 'receipt' },
  { key: 'memories', label: 'Memories', icon: 'images-outline' },
  { key: 'places', label: 'Places', icon: 'location-outline' },
  { key: 'people', label: 'People', icon: 'people-outline' },
];

export function TripDashboardScreen() {
  const { colors } = useThemeColors();
  const { getTrip, tripTotal, setCurrentTrip } = useStore();
  const route = useRoute<RouteProp<RootStackParamList, 'TripDashboard'>>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const trip = getTrip(route.params.tripId);
  const [tab, setTab] = useState('overview');
  const [addSheet, setAddSheet] = useState(false);
  const [menuSheet, setMenuSheet] = useState(false);

  useEffect(() => {
    if (trip) setCurrentTrip(trip.id);
  }, [trip?.id]);

  if (!trip) {
    return (
      <ScreenShell edges={['top']}>
        <NavHeader title="Trip" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.secondaryLabel }}>This trip could not be found.</Text>
        </View>
      </ScreenShell>
    );
  }

  const total = tripTotal(trip.id);
  const status = tripStatus(trip);

  const quickActions = [
    { key: 'settle', label: 'Settle Up', icon: 'swap-horizontal', color: colors.brand, route: 'SettleUp' as const },
    { key: 'budget', label: 'Budget', icon: 'speedometer', color: colors.green, route: 'Budget' as const },
    { key: 'timeline', label: 'Timeline', icon: 'time', color: '#9B6BFF', route: 'Timeline' as const },
    { key: 'ai', label: 'AI Summary', icon: 'sparkles', color: colors.brandWarm, route: 'AISummary' as const },
  ];

  const addOptions: OptionItem[] = [
    { key: 'expense', label: 'Add an expense', icon: 'cash', color: colors.green },
    { key: 'photo', label: 'Add a photo', icon: 'camera', color: colors.brand },
    { key: 'place', label: 'Add a place', icon: 'location', color: '#FF9F0A' },
    { key: 'note', label: 'Add a note', icon: 'chatbubble', color: '#9B6BFF' },
  ];

  const menuOptions: OptionItem[] = [
    { key: 'ai', label: 'AI Trip Summary', icon: 'sparkles', color: colors.brandWarm },
    { key: 'timeline', label: 'Trip Timeline', icon: 'time', color: '#9B6BFF' },
    { key: 'invite', label: 'Invite members', icon: 'person-add', color: colors.brand },
    { key: 'share', label: 'Share trip link', icon: 'share-outline', color: colors.green },
    { key: 'settle', label: 'Settle Up', icon: 'swap-horizontal', color: colors.brand },
  ];

  const onAdd = (key: string) => {
    if (key === 'expense') navigation.navigate('AddExpense', { tripId: trip.id });
    else if (key === 'place') navigation.navigate('AddPlace', { tripId: trip.id });
    else navigation.navigate('AddMemory', { tripId: trip.id, kind: key });
  };

  const onMenu = (key: string) => {
    if (key === 'ai') navigation.navigate('AISummary', { tripId: trip.id });
    else if (key === 'timeline') navigation.navigate('Timeline', { tripId: trip.id });
    else if (key === 'invite') navigation.navigate('InviteMembers', { tripId: trip.id });
    else if (key === 'settle') navigation.navigate('SettleUp', { tripId: trip.id });
    else if (key === 'share') Share.share({ message: `Join my trip "${trip.name}" on TripMate! https://tripmate.app/join/${trip.id}` });
  };

  return (
    <ScreenShell edges={['top', 'left', 'right']}>
      <NavHeader
        title={trip.name}
        subtitle={status === 'active' ? 'Active · total spent' : 'total spent'}
        onBack={() => navigation.goBack()}
        right={
          <Tap onPress={() => setMenuSheet(true)} scale={0.9}>
            <View style={styles.menuBtn}>
              <Ionicons name="ellipsis-horizontal" size={22} color={colors.label} />
            </View>
          </Tap>
        }
      />

      {/* Total line */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 4 }}>
        <Text style={[styles.totalLine, { color: colors.label }]}>
          {formatMoney(total, trip.currency)}{'  '}
          <Text style={{ color: colors.secondaryLabel, fontSize: 15, fontWeight: '600' }}>total spent</Text>
        </Text>
      </View>

      {/* Quick actions */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingVertical: 10 }}>
        {quickActions.map((a) => (
          <Tap key={a.key} onPress={() => navigation.navigate(a.route, { tripId: trip.id })} scale={0.96}>
            <View style={[styles.quickChip, { backgroundColor: colors.card }]}>
              <View style={[styles.quickIcon, { backgroundColor: a.color }]}>
                <Ionicons name={a.icon as any} size={15} color="#fff" />
              </View>
              <Text style={[styles.quickLabel, { color: colors.label }]}>{a.label}</Text>
            </View>
          </Tap>
        ))}
      </ScrollView>

      {/* Tabs */}
      <View style={{ paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator }}>
        <SegmentedControl tabs={TABS} value={tab} onChange={setTab} />
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {tab === 'overview' && (
          <ScrollView contentContainerStyle={{ paddingTop: 8, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
            <OverviewTab trip={trip} onSeeAllExpenses={() => setTab('expenses')} />
          </ScrollView>
        )}
        {tab === 'expenses' && <ExpensesTab trip={trip} />}
        {tab === 'memories' && <MemoriesTab trip={trip} />}
        {tab === 'places' && <PlacesTab trip={trip} />}
        {tab === 'people' && <PeopleTab trip={trip} />}
      </View>

      {/* FAB */}
      <Tap onPress={() => setAddSheet(true)} scale={0.92} style={{ position: 'absolute', right: 18, bottom: insets.bottom + 18 }}>
        <View style={[styles.fab, { backgroundColor: colors.brand }]}>
          <Ionicons name="add" size={26} color="#fff" />
          <Text style={styles.fabText}>Add</Text>
        </View>
      </Tap>

      <OptionSheet visible={addSheet} onClose={() => setAddSheet(false)} title="Quick add" options={addOptions} onSelect={onAdd} />
      <OptionSheet visible={menuSheet} onClose={() => setMenuSheet(false)} title="Trip options" options={menuOptions} onSelect={onMenu} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  menuBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  totalLine: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  quickChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 22, gap: 7 },
  quickIcon: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 13.5, fontWeight: '700' },
  fab: { flexDirection: 'row', alignItems: 'center', paddingLeft: 14, paddingRight: 20, paddingVertical: 14, borderRadius: 28, gap: 6, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  fabText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
