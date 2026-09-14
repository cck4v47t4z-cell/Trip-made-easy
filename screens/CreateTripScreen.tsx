import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../lib/store';
import { useThemeColors, coverGradients, avatarColors } from '../lib/theme';
import { formatDateLong, toISODate, todayISO, uid, currencySymbol } from '../lib/format';
import type { Currency, Member } from '../lib/types';
import { ScreenShell, NavHeader } from '../components/NavHeader';
import { GroupCard, Row, TextField, LabeledField } from '../components/Form';
import { OptionSheet, type OptionItem, Tap, Button } from '../components/primitives';
import { DatePickerSheet } from '../components/DatePickerSheet';
import { Avatar } from '../components/Avatar';
import Ionicons from '@expo/vector-icons/Ionicons';

const CURRENCIES: Currency[] = ['INR', 'USD', 'EUR', 'GBP'];

export function CreateTripScreen() {
  const { colors } = useThemeColors();
  const { user, createTrip, setCurrentTrip } = useStore();
  const navigation = useNavigation<any>();

  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const today = todayISO();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(toISODate(new Date(Date.now() + 4 * 86400000)));
  const [currency, setCurrency] = useState<Currency>('INR');
  const [gradIdx, setGradIdx] = useState(0);
  const [coverUri, setCoverUri] = useState<string | undefined>(undefined);
  const [members, setMembers] = useState<Member[]>([{ ...user, id: 'me' }]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const [dateSheet, setDateSheet] = useState<null | 'start' | 'end'>(null);
  const [currencySheet, setCurrencySheet] = useState(false);

  const canCreate = name.trim().length > 0 && destination.trim().length > 0 && startDate <= endDate;

  const addMember = () => {
    const n = newName.trim();
    if (!n) return;
    setMembers((prev) => [...prev, { id: uid(), name: n, avatarColor: avatarColors[prev.length % avatarColors.length] }]);
    setNewName('');
    setAdding(false);
  };

  const handleCreate = () => {
    if (!canCreate) {
      Alert.alert('Almost there', 'Add a trip name and destination to continue.');
      return;
    }
    const trip = createTrip({
      name: name.trim(),
      destination: destination.trim(),
      startDate,
      endDate,
      currency,
      coverUri,
      coverGradient: coverGradients[gradIdx],
      members,
      budget: undefined,
    });
    setCurrentTrip(trip.id);
    navigation.reset({ index: 1, routes: [{ name: 'Tabs' }, { name: 'TripDashboard', params: { tripId: trip.id } }] });
  };

  const currencyOptions: OptionItem[] = CURRENCIES.map((c) => ({ key: c, label: `${currencySymbol(c)} ${c}`, rightLabel: c }));

  return (
    <ScreenShell edges={[]}>
      <NavHeader
        title="New Trip"
        backIcon="close"
        onBack={() => navigation.goBack()}
        rightLabel="Create"
        onRight={handleCreate}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          {/* Cover */}
          <View style={styles.coverWrap}>
            <View style={[styles.coverPreview, { backgroundColor: coverGradients[gradIdx][0] }]}>
              {coverUri ? (
                <View style={StyleSheet.absoluteFill}>
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: coverGradients[gradIdx][0] }]} />
                  <Ionicons name="image" size={28} color="#fff" />
                </View>
              ) : (
                <View style={styles.coverIcon}>
                  <Ionicons name="airplane" size={26} color="#fff" />
                </View>
              )}
            </View>
            <Text style={[styles.coverHint, { color: colors.secondaryLabel }]}>Choose a cover colour</Text>
            <View style={styles.swatches}>
              {coverGradients.map((g, i) => (
                <Tap key={i} onPress={() => { setGradIdx(i); setCoverUri(undefined); }} scale={0.88}>
                  <View style={[styles.swatch, { backgroundColor: g[0], borderColor: i === gradIdx && !coverUri ? colors.label : 'transparent', borderWidth: 3 }]}>
                    <View style={[styles.swatchInner, { backgroundColor: g[1] }]} />
                  </View>
                </Tap>
              ))}
            </View>
            <Tap onPress={() => setCoverUri(`https://picsum.photos/seed/${encodeURIComponent(destination || name || 'trip')}-${Date.now()}/800/500`)} scale={0.98}>
              <View style={[styles.photoBtn, { borderColor: colors.separator }]}>
                <Ionicons name="images-outline" size={17} color={colors.brand} />
                <Text style={[styles.photoBtnText, { color: colors.brand }]}>{coverUri ? 'Change cover photo' : 'Add a cover photo'}</Text>
              </View>
            </Tap>
          </View>

          <GroupCard header="Details" style={{ marginTop: 8 }}>
            <LabeledField label="Trip name" last={false}>
              <TextField value={name} onChange={setName} placeholder="e.g. Goa Trip" autoFocus maxLength={40} style={{ paddingHorizontal: 0 }} />
            </LabeledField>
            <LabeledField label="Destination" last>
              <TextField value={destination} onChange={setDestination} placeholder="e.g. Goa, India" maxLength={60} style={{ paddingHorizontal: 0 }} />
            </LabeledField>
          </GroupCard>

          <GroupCard header="Dates">
            <Row label="Start date" value={formatDateLong(startDate)} icon="calendar" iconColor={colors.brand} onPress={() => setDateSheet('start')} />
            <Row label="End date" value={formatDateLong(endDate)} icon="calendar-outline" iconColor={colors.brand} onPress={() => setDateSheet('end')} last />
          </GroupCard>

          <GroupCard header="Currency">
            <Row label="Currency" value={`${currencySymbol(currency)} ${currency}`} icon="cash" iconColor={colors.green} onPress={() => setCurrencySheet(true)} last />
          </GroupCard>

          <GroupCard header="Members">
            {members.map((m, i) => (
              <View key={m.id} style={[styles.memberRow, i < members.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator }]}>
                <Avatar member={m} size={34} />
                <Text style={[styles.memberName, { color: colors.label }]}>{m.name}{m.isCurrentUser ? '  (You)' : ''}</Text>
                {!m.isCurrentUser ? (
                  <Tap onPress={() => setMembers((prev) => prev.filter((x) => x.id !== m.id))} scale={0.85}>
                    <Ionicons name="close-circle" size={20} color={colors.tertiaryLabel} />
                  </Tap>
                ) : null}
              </View>
            ))}
            {adding ? (
              <View style={[styles.memberRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator }]}>
                <View style={[styles.addAvatar, { backgroundColor: colors.cardSecondary }]}>
                  <Ionicons name="person-add" size={16} color={colors.secondaryLabel} />
                </View>
                <TextField value={newName} onChange={setNewName} placeholder="Friend's name" autoFocus style={{ flex: 1, paddingHorizontal: 0, paddingVertical: 10, minHeight: 40 }} maxLength={30} />
                <Tap onPress={addMember} scale={0.9}>
                  <View style={[styles.addConfirm, { backgroundColor: colors.brand }]}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                </Tap>
              </View>
            ) : null}
            {!adding ? (
              <Tap onPress={() => setAdding(true)} scale={0.995}>
                <View style={[styles.addRow]}>
                  <View style={[styles.addAvatar, { backgroundColor: colors.cardSecondary }]}>
                    <Ionicons name="add" size={18} color={colors.brand} />
                  </View>
                  <Text style={[styles.addText, { color: colors.brand }]}>Add a member</Text>
                </View>
              </Tap>
            ) : null}
          </GroupCard>

          <Text style={[styles.inviteHint, { color: colors.tertiaryLabel }]}>
            You can invite more friends via phone, email or a shareable link from the trip's People tab.
          </Text>

          <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
            <Button label="Create Trip" icon="checkmark" onPress={handleCreate} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <DatePickerSheet
        visible={dateSheet !== null}
        onClose={() => setDateSheet(null)}
        value={dateSheet === 'end' ? endDate : startDate}
        onChange={(iso) => {
          if (dateSheet === 'start') {
            setStartDate(iso);
            if (iso > endDate) setEndDate(iso);
          } else {
            setEndDate(iso);
          }
        }}
        title={dateSheet === 'end' ? 'End date' : 'Start date'}
      />
      <OptionSheet visible={currencySheet} onClose={() => setCurrencySheet(false)} title="Currency" options={currencyOptions} selectedKey={currency} onSelect={(k) => setCurrency(k as Currency)} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  coverWrap: { paddingHorizontal: 16, paddingTop: 10 },
  coverPreview: { height: 110, borderRadius: 18, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  coverIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  coverHint: { fontSize: 13, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase', marginTop: 16, marginBottom: 10, marginLeft: 4 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  swatch: { width: 46, height: 46, borderRadius: 14, padding: 3, alignItems: 'center', justifyContent: 'center' },
  swatchInner: { width: '100%', height: '100%', borderRadius: 10 },
  photoBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, marginTop: 14, gap: 7 },
  photoBtnText: { fontSize: 15, fontWeight: '700' },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 11, minHeight: 50 },
  memberName: { flex: 1, fontSize: 16, fontWeight: '500', marginLeft: 12 },
  addAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  addConfirm: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  addRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, minHeight: 50 },
  addText: { flex: 1, fontSize: 16, fontWeight: '600', marginLeft: 12 },
  inviteHint: { fontSize: 13, fontWeight: '500', lineHeight: 18, paddingHorizontal: 20, marginTop: 14 },
});
