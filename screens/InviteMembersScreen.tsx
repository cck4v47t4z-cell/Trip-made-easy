import { useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useStore } from '../lib/store';
import { useThemeColors, avatarColors } from '../lib/theme';
import { uid } from '../lib/format';
import type { RootStackParamList } from '../navigation/types';
import { ScreenShell, NavHeader } from '../components/NavHeader';
import { GroupCard, LabeledField, TextField, Row } from '../components/Form';
import { Card, Tap, SectionTitle } from '../components/primitives';
import { Avatar } from '../components/Avatar';
import Ionicons from '@expo/vector-icons/Ionicons';

const FAKE_CONTACTS = [
  { name: 'Ishaan', phone: '+91 90011 22334' },
  { name: 'Meera', phone: '+91 90022 44556' },
  { name: 'Rohan', phone: '+91 90033 66778' },
  { name: 'Sara', phone: '+91 90044 88990' },
];

export function InviteMembersScreen() {
  const { colors } = useThemeColors();
  const { getTrip, addMember } = useStore();
  const route = useRoute<RouteProp<RootStackParamList, 'InviteMembers'>>();
  const navigation = useNavigation<any>();
  const trip = getTrip(route.params.tripId);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  if (!trip) return null;

  const inviteLink = `https://tripmate.app/join/${trip.id}`;
  const existingIds = new Set(trip.members.map((m) => m.name.toLowerCase()));

  const addByForm = () => {
    if (!name.trim()) return;
    addMember(trip.id, { name: name.trim(), phone: phone.trim() || undefined, email: email.trim() || undefined, avatarColor: avatarColors[trip.members.length % avatarColors.length] });
    setName(''); setPhone(''); setEmail('');
  };

  const addContact = (c: { name: string; phone: string }) => {
    addMember(trip.id, { name: c.name, phone: c.phone, avatarColor: avatarColors[trip.members.length % avatarColors.length] });
  };

  return (
    <ScreenShell edges={['top', 'left', 'right']}>
      <NavHeader title="Invite Members" subtitle={trip.name} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}>
        {/* Shareable link */}
        <View style={{ paddingHorizontal: 16 }}>
          <Card padded={false} style={{ padding: 16 }}>
            <View style={styles.linkHead}>
              <View style={[styles.linkIcon, { backgroundColor: colors.brand }]}><Ionicons name="link" size={18} color="#fff" /></View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.linkTitle, { color: colors.label }]}>Shareable invitation link</Text>
                <Text style={[styles.linkSub, { color: colors.secondaryLabel }]} numberOfLines={1}>{inviteLink}</Text>
              </View>
            </View>
            <View style={styles.linkActions}>
              <Tap onPress={() => Share.share({ message: `Join my trip "${trip.name}" on TripMate! ${inviteLink}` })} scale={0.97} style={{ flex: 1 }}>
                <View style={[styles.linkBtn, { backgroundColor: colors.brand }]}><Ionicons name="share-outline" size={16} color="#fff" /><Text style={styles.linkBtnText}>Share</Text></View>
              </Tap>
              <Tap onPress={() => {}} scale={0.97} style={{ flex: 1 }}>
                <View style={[styles.linkBtn, { backgroundColor: colors.cardSecondary }]}><Ionicons name="copy-outline" size={16} color={colors.label} /><Text style={[styles.linkBtnText, { color: colors.label }]}>Copy</Text></View>
              </Tap>
            </View>
          </Card>
        </View>

        {/* Add by phone / email */}
        <View style={{ marginTop: 22 }}><SectionTitle>Add by phone or email</SectionTitle></View>
        <GroupCard>
          <LabeledField label="Name" last={false}><TextField value={name} onChange={setName} placeholder="Friend's name" style={{ paddingHorizontal: 0 }} maxLength={30} /></LabeledField>
          <LabeledField label="Phone (optional)" last={false}><TextField value={phone} onChange={setPhone} placeholder="+91 …" keyboardType="phone-pad" style={{ paddingHorizontal: 0 }} /></LabeledField>
          <LabeledField label="Email (optional)" last><TextField value={email} onChange={setEmail} placeholder="name@email.com" keyboardType="email-address" style={{ paddingHorizontal: 0 }} /></LabeledField>
        </GroupCard>
        <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
          <Tap onPress={addByForm} scale={0.98}>
            <View style={[styles.addBtn, { backgroundColor: name.trim() ? colors.brand : colors.cardSecondary }]}>
              <Ionicons name="person-add" size={17} color={name.trim() ? '#fff' : colors.tertiaryLabel} />
              <Text style={[styles.addBtnText, { color: name.trim() ? '#fff' : colors.tertiaryLabel }]}>Add member</Text>
            </View>
          </Tap>
        </View>

        {/* From contacts */}
        <View style={{ marginTop: 22 }}><SectionTitle>Add from contacts</SectionTitle></View>
        <View style={{ paddingHorizontal: 16 }}>
          <Card padded={false}>
            {FAKE_CONTACTS.map((c, i) => {
              const added = existingIds.has(c.name.toLowerCase());
              return (
                <View key={c.name} style={[styles.contactRow, i < FAKE_CONTACTS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator }]}>
                  <Avatar member={{ id: uid(), name: c.name, avatarColor: avatarColors[i % avatarColors.length] }} size={36} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.contactName, { color: colors.label }]}>{c.name}</Text>
                    <Text style={[styles.contactPhone, { color: colors.secondaryLabel }]}>{c.phone}</Text>
                  </View>
                  <Tap onPress={() => addContact(c)} scale={0.92} disabled={added}>
                    <View style={[styles.contactAdd, { backgroundColor: added ? colors.cardSecondary : colors.brand }]}>
                      <Ionicons name={added ? 'checkmark' : 'add'} size={16} color={added ? colors.tertiaryLabel : '#fff'} />
                    </View>
                  </Tap>
                </View>
              );
            })}
          </Card>
        </View>

        {/* Current members */}
        <View style={{ marginTop: 22 }}><SectionTitle>In this trip ({trip.members.length})</SectionTitle></View>
        <View style={{ paddingHorizontal: 16 }}>
          <Card padded={false}>
            {trip.members.map((m, i) => (
              <View key={m.id} style={[styles.contactRow, i < trip.members.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator }]}>
                <Avatar member={m} size={36} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.contactName, { color: colors.label }]}>{m.name}{m.isCurrentUser ? '  (You)' : ''}</Text>
                  {m.phone ? <Text style={[styles.contactPhone, { color: colors.secondaryLabel }]}>{m.phone}</Text> : null}
                </View>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  linkHead: { flexDirection: 'row', alignItems: 'center' },
  linkIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  linkTitle: { fontSize: 15.5, fontWeight: '700', letterSpacing: -0.2 },
  linkSub: { fontSize: 13, fontWeight: '600', marginTop: 3 },
  linkActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  linkBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 14 },
  linkBtnText: { fontSize: 15, fontWeight: '800' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 50, borderRadius: 14 },
  addBtnText: { fontSize: 16, fontWeight: '800' },
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11 },
  contactName: { fontSize: 15.5, fontWeight: '700', letterSpacing: -0.2 },
  contactPhone: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  contactAdd: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});
