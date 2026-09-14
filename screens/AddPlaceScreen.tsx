import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useStore } from '../lib/store';
import { useThemeColors, placeCategories, placeMeta } from '../lib/theme';
import { formatMoney } from '../lib/format';
import type { PlaceCategory } from '../lib/types';
import type { RootStackParamList } from '../navigation/types';
import { ScreenShell, NavHeader } from '../components/NavHeader';
import { GroupCard, LabeledField, TextField, Row } from '../components/Form';
import { Tap, OptionSheet, type OptionItem } from '../components/primitives';
import { PlaceIcon } from '../components/CategoryIcon';
import Ionicons from '@expo/vector-icons/Ionicons';

export function AddPlaceScreen() {
  const { colors } = useThemeColors();
  const { getTrip, tripExpenses, addPlace } = useStore();
  const route = useRoute<RouteProp<RootStackParamList, 'AddPlace'>>();
  const navigation = useNavigation<any>();
  const trip = getTrip(route.params.tripId);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<PlaceCategory>('Restaurant');
  const [area, setArea] = useState('');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [expenseId, setExpenseId] = useState<string | undefined>(undefined);
  const [expSheet, setExpSheet] = useState(false);
  if (!trip) return null;

  const expenses = tripExpenses(trip.id);
  const canSave = name.trim().length > 0;
  const linked = expenses.find((e) => e.id === expenseId);
  const expenseOptions: OptionItem[] = [{ key: '', label: 'No linked expense', icon: 'close-circle', color: colors.tertiaryLabel }, ...expenses.map((e) => ({ key: e.id, label: e.description, icon: 'wallet', color: colors.brand, rightLabel: formatMoney(e.amount, trip.currency) }))];

  const save = () => {
    if (!canSave) return;
    addPlace(trip.id, {
      name: name.trim(), category, area: area.trim() || undefined, notes: notes.trim() || undefined,
      rating: rating || undefined, photoUris: photo ? [photo] : [], expenseId: expenseId || undefined,
    });
    navigation.goBack();
  };

  return (
    <ScreenShell edges={[]}>
      <NavHeader title="Add a Place" backIcon="close" onBack={() => navigation.goBack()} rightLabel={canSave ? 'Save' : ''} onRight={save} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            <Tap onPress={() => setPhoto(`https://picsum.photos/seed/place-${Date.now()}/800/500`)} scale={0.98}>
              <View style={[styles.photoPick, { backgroundColor: colors.cardSecondary, borderColor: colors.separator }]}>
                {photo ? (
                  <Image source={photo} style={styles.photoPreview} contentFit="cover" />
                ) : (
                  <View style={styles.photoPickInner}>
                    <Ionicons name="camera-outline" size={28} color={colors.tertiaryLabel} />
                    <Text style={[styles.photoPickText, { color: colors.secondaryLabel }]}>Add a photo</Text>
                  </View>
                )}
              </View>
            </Tap>
          </View>

          <GroupCard header="Details" style={{ marginTop: 16 }}>
            <LabeledField label="Place name" last={false}>
              <TextField value={name} onChange={setName} placeholder="e.g. Thalassa" style={{ paddingHorizontal: 0 }} maxLength={50} autoFocus />
            </LabeledField>
            <LabeledField label="Area / address" last>
              <TextField value={area} onChange={setArea} placeholder="e.g. Siolim, North Goa" style={{ paddingHorizontal: 0 }} maxLength={60} />
            </LabeledField>
          </GroupCard>

          <View style={{ paddingHorizontal: 16, marginTop: 22 }}>
            <Text style={[styles.fieldHeader, { color: colors.secondaryLabel }]}>CATEGORY</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingTop: 8 }}>
            {placeCategories.map((c) => {
              const active = c === category;
              return (
                <Tap key={c} onPress={() => setCategory(c)} scale={0.94}>
                  <View style={[styles.catChip, { backgroundColor: active ? placeMeta[c].color : colors.card, borderColor: active ? placeMeta[c].color : colors.separator, borderWidth: StyleSheet.hairlineWidth }]}>
                    <Ionicons name={placeMeta[c].icon as any} size={15} color={active ? '#fff' : colors.secondaryLabel} />
                    <Text style={[styles.catChipText, { color: active ? '#fff' : colors.secondaryLabel }]}>{c}</Text>
                  </View>
                </Tap>
              );
            })}
          </ScrollView>

          <View style={{ paddingHorizontal: 16, marginTop: 22 }}>
            <Text style={[styles.fieldHeader, { color: colors.secondaryLabel }]}>RATING</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Tap key={i} onPress={() => setRating(rating === i ? 0 : i)} onLongPress={() => setRating(i - 0.5)} scale={0.88}>
                  <Ionicons name={rating >= i ? 'star' : rating >= i - 0.5 ? 'star-half' : 'star-outline'} size={34} color="#FFB340" />
                </Tap>
              ))}
              <Text style={[styles.ratingText, { color: colors.secondaryLabel }]}>{rating > 0 ? rating.toFixed(1) : 'Tap to rate'}</Text>
            </View>
          </View>

          <GroupCard header="Notes">
            <LabeledField label="Why visit?" last>
              <TextField value={notes} onChange={setNotes} placeholder="e.g. Must try the sunset view" multiline style={{ paddingHorizontal: 0, minHeight: 70 }} maxLength={200} />
            </LabeledField>
          </GroupCard>

          <GroupCard header="Link an expense">
            <Row label={linked ? linked.description : 'Link an expense (optional)'} value={linked ? formatMoney(linked.amount, trip.currency) : undefined} icon="wallet" iconColor={colors.brand} onPress={() => setExpSheet(true)} last />
          </GroupCard>
        </ScrollView>
      </KeyboardAvoidingView>

      <OptionSheet visible={expSheet} onClose={() => setExpSheet(false)} title="Link an expense" options={expenseOptions} selectedKey={expenseId ?? ''} onSelect={(k) => setExpenseId(k || undefined)} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  photoPick: { height: 170, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  photoPickInner: { alignItems: 'center', justifyContent: 'center' },
  photoPickText: { fontSize: 14, fontWeight: '600', marginTop: 8 },
  photoPreview: { width: '100%', height: '100%' },
  fieldHeader: { fontSize: 12, fontWeight: '800', letterSpacing: 0.4 },
  catChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 20, gap: 6 },
  catChipText: { fontSize: 13, fontWeight: '700' },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 10 },
  ratingText: { fontSize: 15, fontWeight: '700', marginLeft: 8 },
});
