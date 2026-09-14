import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useStore } from '../lib/store';
import { useThemeColors } from '../lib/theme';
import type { MemoryType } from '../lib/types';
import type { RootStackParamList } from '../navigation/types';
import { ScreenShell, NavHeader } from '../components/NavHeader';
import { GroupCard, LabeledField, TextField, Row } from '../components/Form';
import { Tap, SegmentedControl, type SegTab } from '../components/primitives';
import { Avatar } from '../components/Avatar';
import Ionicons from '@expo/vector-icons/Ionicons';

const TYPE_TABS: SegTab[] = [
  { key: 'photo', label: 'Photo', icon: 'camera-outline' },
  { key: 'note', label: 'Note', icon: 'chatbubble-outline' },
  { key: 'location', label: 'Place', icon: 'location-outline' },
];

export function AddMemoryScreen() {
  const { colors } = useThemeColors();
  const { getTrip, addMemory } = useStore();
  const route = useRoute<RouteProp<RootStackParamList, 'AddMemory'>>();
  const navigation = useNavigation<any>();
  const trip = getTrip(route.params.tripId);
  const initialKind = (route.params as any).kind === 'photo' ? 'photo' : (route.params as any).kind === 'note' ? 'note' : 'photo';
  const [type, setType] = useState<MemoryType>(initialKind);
  const [uri, setUri] = useState<string | undefined>(undefined);
  const [caption, setCaption] = useState('');
  const [text, setText] = useState('');
  const [locationName, setLocationName] = useState('');
  const [tagged, setTagged] = useState<string[]>([]);
  const [favorite, setFavorite] = useState(false);
  if (!trip) return null;

  const toggleTag = (id: string) => setTagged((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const save = () => {
    if (type === 'note' && !text.trim()) return;
    addMemory(trip.id, {
      type,
      uri: type === 'photo' || type === 'video' ? (uri ?? `https://picsum.photos/seed/mem-${Date.now()}/800/600`) : undefined,
      caption: caption.trim() || undefined,
      text: type === 'note' ? text.trim() : locationName.trim() || undefined,
      locationName: locationName.trim() || undefined,
      taggedMemberIds: tagged,
      isFavorite: favorite,
      date: new Date().toISOString(),
    });
    navigation.goBack();
  };

  const canSave = type === 'note' ? text.trim().length > 0 : true;

  return (
    <ScreenShell edges={[]}>
      <NavHeader title="Add Memory" backIcon="close" onBack={() => navigation.goBack()} rightLabel={canSave ? 'Save' : ''} onRight={save} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
            <SegmentedControl tabs={TYPE_TABS} value={type} onChange={(k) => setType(k as MemoryType)} />
          </View>

          {type === 'photo' ? (
            <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
              <Tap onPress={() => setUri(`https://picsum.photos/seed/mem-${Date.now()}/800/600`)} scale={0.98}>
                <View style={[styles.photoPick, { backgroundColor: colors.cardSecondary, borderColor: colors.separator }]}>
                  {uri ? (
                    <Image source={uri} style={styles.photoPreview} contentFit="cover" />
                  ) : (
                    <View style={styles.photoPickInner}>
                      <Ionicons name="images-outline" size={32} color={colors.tertiaryLabel} />
                      <Text style={[styles.photoPickText, { color: colors.secondaryLabel }]}>Add a photo</Text>
                    </View>
                  )}
                </View>
              </Tap>
            </View>
          ) : null}

          <GroupCard header={type === 'note' ? 'Your note' : 'Caption'} style={{ marginTop: 16 }}>
            <LabeledField label={type === 'note' ? 'What happened?' : 'Caption'} last>
              <TextField value={type === 'note' ? text : caption} onChange={type === 'note' ? setText : setCaption} placeholder={type === 'note' ? "e.g. Best beach day ever 🌊" : 'Add a caption'} multiline style={{ paddingHorizontal: 0, minHeight: 80 }} maxLength={220} />
            </LabeledField>
          </GroupCard>

          <GroupCard header="Details">
            <LabeledField label="Location (optional)" last={false}>
              <TextField value={locationName} onChange={setLocationName} placeholder="e.g. Baga Beach" style={{ paddingHorizontal: 0 }} maxLength={60} />
            </LabeledField>
            <Row label="Mark as favourite" icon="heart" iconColor={colors.brandWarm} chevron={false} right={
              <Tap onPress={() => setFavorite((v) => !v)} scale={0.9}>
                <View style={[styles.favToggle, { backgroundColor: favorite ? colors.brandWarm : 'transparent', borderColor: favorite ? colors.brandWarm : colors.tertiaryLabel }]}>
                  <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={15} color={favorite ? '#fff' : colors.tertiaryLabel} />
                </View>
              </Tap>
            } last />
          </GroupCard>

          <View style={{ paddingHorizontal: 16, marginTop: 22 }}>
            <Text style={[styles.fieldHeader, { color: colors.secondaryLabel }]}>TAG PEOPLE</Text>
          </View>
          <View style={[styles.tagRow, { borderColor: colors.separator }]}>
            {trip.members.map((m) => {
              const active = tagged.includes(m.id);
              return (
                <Tap key={m.id} onPress={() => toggleTag(m.id)} scale={0.92}>
                  <View style={{ alignItems: 'center' }}>
                    <Avatar member={m} size={active ? 48 : 40} border={active} />
                    <Text style={[styles.tagName, { color: active ? colors.label : colors.secondaryLabel }]}>{m.isCurrentUser ? 'You' : m.name.split(' ')[0]}</Text>
                  </View>
                </Tap>
              );
            })}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  photoPick: { height: 220, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  photoPickInner: { alignItems: 'center', justifyContent: 'center' },
  photoPickText: { fontSize: 14, fontWeight: '600', marginTop: 8 },
  photoPreview: { width: '100%', height: '100%' },
  favToggle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  fieldHeader: { fontSize: 12, fontWeight: '800', letterSpacing: 0.4 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingTop: 10, gap: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  tagName: { fontSize: 11.5, fontWeight: '700', marginTop: 5 },
});
