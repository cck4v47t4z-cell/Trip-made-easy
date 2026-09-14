import { useMemo, useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, View, ScrollView, Dimensions, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../../lib/store';
import { useThemeColors, placeCategories, placeMeta } from '../../lib/theme';
import { formatMoney } from '../../lib/format';
import type { Place, PlaceCategory, Trip } from '../../lib/types';
import { Tap, Pill } from '../../components/primitives';
import { PlaceCard } from '../../components/PlaceCard';
import { EmptyState } from '../../components/EmptyState';
import { Avatar } from '../../components/Avatar';
import Ionicons from '@expo/vector-icons/Ionicons';

export function PlacesTab({ trip }: { trip: Trip }) {
  const { colors } = useThemeColors();
  const { tripPlaces, expenses } = useStore();
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState<'All' | PlaceCategory>('All');
  const [detail, setDetail] = useState<Place | null>(null);

  const all = tripPlaces(trip.id);
  const places = filter === 'All' ? all : all.filter((p) => p.category === filter);
  const linkedAmount = (p: Place) => (p.expenseId ? expenses.find((e) => e.id === p.expenseId)?.amount : undefined);

  if (all.length === 0) {
    return (
      <EmptyState
        icon="location"
        title="No saved places"
        subtitle="Add restaurants, beaches and spots you visit — link them to expenses too."
        actionLabel="Add a place"
        onAction={() => navigation.navigate('AddPlace', { tripId: trip.id })}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 10 }}>
        <FilterChip label="All" active={filter === 'All'} onPress={() => setFilter('All')} />
        {placeCategories.map((c) => (
          <FilterChip key={c} label={c} icon={placeMeta[c].icon} active={filter === c} color={placeMeta[c].color} onPress={() => setFilter(c)} />
        ))}
      </ScrollView>

      <FlatList
        data={places}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={<EmptyState icon="location-outline" title="No places here" subtitle={`No ${filter.toLowerCase()}s saved yet.`} />}
        renderItem={({ item }) => (
          <PlaceCard place={item} members={trip.members} currency={trip.currency} linkedAmount={linkedAmount(item)} onPress={() => setDetail(item)} />
        )}
      />

      <Modal visible={!!detail} transparent animationType="slide" onRequestClose={() => setDetail(null)}>
        {detail ? <PlaceDetail place={detail} trip={trip} linkedAmount={linkedAmount(detail)} onClose={() => setDetail(null)} /> : null}
      </Modal>
    </View>
  );
}

function FilterChip({ label, icon, active, color, onPress }: { label: string; icon?: string; active: boolean; color?: string; onPress: () => void }) {
  const { colors } = useThemeColors();
  return (
    <Tap onPress={onPress} scale={0.95}>
      <View style={[styles.chip, { backgroundColor: active ? color ?? colors.brand : colors.cardSecondary }]}>
        {icon ? <Ionicons name={icon as any} size={13} color={active ? '#fff' : colors.secondaryLabel} style={{ marginRight: 5 }} /> : null}
        <Text style={[styles.chipText, { color: active ? '#fff' : colors.secondaryLabel }]}>{label}</Text>
      </View>
    </Tap>
  );
}

function PlaceDetail({ place, trip, linkedAmount, onClose }: { place: Place; trip: Trip; linkedAmount?: number; onClose: () => void }) {
  const { colors } = useThemeColors();
  const addedBy = trip.members.find((m) => m.id === place.addedById);
  const W = Dimensions.get('window').width;
  return (
    <View style={styles.detailWrap}>
      <View style={[styles.detailSheet, { backgroundColor: colors.background }]}>
        <View style={styles.detailHeader}>
          <View style={styles.detailGrabber} />
        </View>
        {place.photoUris[0] ? (
          <Image source={place.photoUris[0]} style={{ width: W - 32, height: (W - 32) * 0.6, borderRadius: 16, alignSelf: 'center' }} contentFit="cover" />
        ) : null}
        <View style={styles.detailBody}>
          <View style={styles.detailTitleRow}>
            <Text style={[styles.detailName, { color: colors.label }]}>{place.name}</Text>
            {place.rating ? (
              <View style={[styles.rating, { backgroundColor: colors.cardSecondary }]}>
                <Ionicons name="star" size={13} color="#FFB340" />
                <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.detailMetaRow}>
            <Pill icon="location" color={placeMeta[place.category].color}>{place.category}</Pill>
            {place.area ? <Text style={[styles.detailArea, { color: colors.secondaryLabel }]}>{place.area}</Text> : null}
          </View>
          {place.notes ? <Text style={[styles.detailNotes, { color: colors.label }]}>{place.notes}</Text> : null}
          <View style={[styles.detailAdded, { borderTopColor: colors.separator }]}>
            <Avatar member={addedBy ?? trip.members[0]} size={26} />
            <Text style={[styles.detailAddedText, { color: colors.secondaryLabel }]}>Added by {addedBy?.name ?? 'you'}</Text>
          </View>
          {linkedAmount ? (
            <View style={[styles.detailExpense, { backgroundColor: colors.card }]}>
              <Ionicons name="wallet" size={18} color={colors.brand} />
              <Text style={[styles.detailExpenseText, { color: colors.label }]}>{formatMoney(linkedAmount, trip.currency)} spent here</Text>
            </View>
          ) : null}
        </View>
      </View>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, paddingVertical: 8, borderRadius: 20 },
  chipText: { fontSize: 13, fontWeight: '700' },
  detailWrap: { flex: 1, justifyContent: 'flex-end' },
  detailSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 36, paddingTop: 8 },
  detailHeader: { alignItems: 'center', marginBottom: 12 },
  detailGrabber: { width: 40, height: 5, borderRadius: 3, backgroundColor: 'rgba(120,120,128,0.4)' },
  detailBody: { paddingHorizontal: 16, paddingTop: 4 },
  detailTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  detailName: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  rating: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 14 },
  ratingText: { fontSize: 14, fontWeight: '800', color: '#FFB340', marginLeft: 4 },
  detailMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  detailArea: { fontSize: 13.5, fontWeight: '600' },
  detailNotes: { fontSize: 15, lineHeight: 22, marginTop: 14, fontWeight: '500' },
  detailAdded: { flexDirection: 'row', alignItems: 'center', marginTop: 16, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth, gap: 9 },
  detailAddedText: { fontSize: 13.5, fontWeight: '600' },
  detailExpense: { flexDirection: 'row', alignItems: 'center', marginTop: 14, padding: 14, borderRadius: 14, gap: 9 },
  detailExpenseText: { fontSize: 15, fontWeight: '700' },
});
