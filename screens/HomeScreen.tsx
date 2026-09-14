import { useCallback, useEffect, useMemo, useState } from 'react';
import { SectionList, StyleSheet, Text, View, RefreshControl, type ListRenderItem } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../lib/store';
import { useThemeColors } from '../lib/theme';
import { tripStatus } from '../lib/format';
import type { Trip, TripStatus } from '../lib/types';
import { ScreenShell } from '../components/NavHeader';
import { Tap, SectionTitle, Pill } from '../components/primitives';
import { TripCard } from '../components/TripCard';
import { TripCardSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import Ionicons from '@expo/vector-icons/Ionicons';

const ORDER: TripStatus[] = ['active', 'upcoming', 'past'];
const LABELS: Record<TripStatus, string> = {
  active: 'Active trips',
  upcoming: 'Upcoming',
  past: 'Past trips',
};

export function HomeScreen() {
  const { colors } = useThemeColors();
  const { trips, user, setCurrentTrip, pendingChanges, isOnline } = useStore();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const sections = useMemo(() => {
    return ORDER
      .map((status) => ({
        status,
        title: LABELS[status],
        data: trips.filter((t) => tripStatus(t) === status),
      }))
      .filter((s) => s.data.length > 0);
  }, [trips]);

  const openTrip = useCallback((trip: Trip) => {
    setCurrentTrip(trip.id);
    navigation.navigate('TripDashboard', { tripId: trip.id });
  }, [navigation, setCurrentTrip]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  }, []);

  const renderItem: ListRenderItem<Trip> = ({ item }) => (
    <TripCard trip={item} onPress={() => openTrip(item)} />
  );

  const hasTrips = trips.length > 0;

  return (
    <ScreenShell edges={['top', 'left', 'right']}>
      <SectionList
        style={{ flex: 1 }}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 }}>
            <View style={styles.headerRow}>
              <View>
                <Text style={[styles.greet, { color: colors.secondaryLabel }]}>Welcome back</Text>
                <Text style={[styles.name, { color: colors.label }]}>Hi, {user.name} 👋</Text>
              </View>
              {pendingChanges > 0 ? (
                <Pill icon="cloud-offline" color={colors.orange}>{pendingChanges} pending</Pill>
              ) : isOnline ? (
                <Pill icon="checkmark-circle" color={colors.green}>Synced</Pill>
              ) : null}
            </View>

            <Tap onPress={() => navigation.navigate('CreateTrip')} style={styles.createBtn}>
              <View style={[styles.createInner, { backgroundColor: colors.card, borderColor: colors.separator }]}>
                <View style={[styles.createIcon, { backgroundColor: colors.brand }]}>
                  <Ionicons name="add" size={22} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.createTitle, { color: colors.label }]}>Create a new trip</Text>
                  <Text style={[styles.createSub, { color: colors.secondaryLabel }]}>Add friends, split costs, save memories</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.tertiaryLabel} />
              </View>
            </Tap>
          </View>
        }
        sections={loading ? [] : sections}
        renderSectionHeader={({ section }) => (
          <View style={{ paddingTop: 8 }}>
            <SectionTitle>{section.title}</SectionTitle>
          </View>
        )}
        renderItem={renderItem}
        ListEmptyComponent={
          loading ? (
            <View style={{ marginTop: 8 }}>
              <TripCardSkeleton />
              <TripCardSkeleton />
            </View>
          ) : !hasTrips ? (
            <EmptyState
              icon="airplane"
              title="No trips yet"
              subtitle="Create your first trip and invite your friends to start splitting expenses and saving memories."
              actionLabel="Create Trip"
              onAction={() => navigation.navigate('CreateTrip')}
            />
          ) : null
        }
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  greet: { fontSize: 14, fontWeight: '600', letterSpacing: 0.2 },
  name: { fontSize: 28, fontWeight: '800', letterSpacing: -0.8, marginTop: 2 },
  createBtn: { marginBottom: 4 },
  createInner: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth },
  createIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  createTitle: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  createSub: { fontSize: 13, fontWeight: '500', marginTop: 2 },
});
