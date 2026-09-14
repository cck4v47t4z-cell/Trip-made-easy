import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useStore } from '../lib/store';
import { useThemeColors } from '../lib/theme';
import { formatMoney, timeAgo } from '../lib/format';
import { ScreenShell } from '../components/NavHeader';
import { GroupCard, Row, LabeledField, TextField } from '../components/Form';
import { Card, Tap, GradientView } from '../components/primitives';
import { Avatar } from '../components/Avatar';
import Ionicons from '@expo/vector-icons/Ionicons';

export function ProfileScreen() {
  const { colors } = useThemeColors();
  const scheme = useColorScheme();
  const { user, trips, expenses, memories, updateUser, isOnline, pendingChanges, lastSyncedAt, syncNow, setOnline, resetData } = useStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const stats = [
    { label: 'Trips', value: String(trips.length), icon: 'airplane' },
    { label: 'Memories', value: String(memories.length), icon: 'images' },
    { label: 'Total spent', value: formatMoney(totalSpent, 'INR'), icon: 'wallet' },
  ];

  const saveName = () => { updateUser({ name: name.trim() || user.name }); setEditing(false); };

  return (
    <ScreenShell edges={['top', 'left', 'right']}>
      <View style={styles.header}><Text style={[styles.title, { color: colors.label }]}>Profile</Text></View>
      <ScrollView contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}>
        {/* Profile card */}
        <View style={{ paddingHorizontal: 16 }}>
          <GradientView colors={['#3B6FF6', '#7B4DFF']} style={styles.profileCard}>
            <View style={styles.profileTop}>
              <View style={styles.bigAvatar}>
                <Text style={styles.bigAvatarText}>{(user.name || 'T').split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.profileName}>{user.name}</Text>
                {user.phone ? <Text style={styles.profileSub}>{user.phone}</Text> : null}
                {user.email ? <Text style={styles.profileSub}>{user.email}</Text> : null}
              </View>
            </View>
            <View style={styles.profileStats}>
              {stats.map((s) => (
                <View key={s.label} style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={styles.profileStatValue}>{s.value}</Text>
                  <Text style={styles.profileStatLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </GradientView>
        </View>

        {/* Edit name */}
        <View style={{ marginTop: 22 }}>
          <GroupCard header="Account">
            {editing ? (
              <View style={styles.editRow}>
                <TextField value={name} onChange={setName} placeholder="Your name" autoFocus style={{ flex: 1, paddingHorizontal: 0 }} maxLength={24} />
                <Tap onPress={saveName} scale={0.9}><View style={[styles.editSave, { backgroundColor: colors.brand }]}><Ionicons name="checkmark" size={16} color="#fff" /></View></Tap>
              </View>
            ) : (
              <Row label="Name" value={user.name} icon="person" iconColor={colors.brand} onPress={() => { setName(user.name); setEditing(true); }} last chevron={false} right={<Ionicons name="create-outline" size={18} color={colors.brand} />} />
            )}
          </GroupCard>
        </View>

        {/* Sync & offline */}
        <GroupCard header="Sync & offline">
          <Row label="Offline mode" icon="cloud-offline" iconColor={colors.orange} chevron={false} right={
            <Tap onPress={() => setOnline(!isOnline)} scale={0.9}>
              <View style={[styles.toggle, { backgroundColor: isOnline ? colors.cardSecondary : colors.green, borderColor: isOnline ? colors.separator : colors.green }]}>
                <View style={[styles.toggleKnob, { backgroundColor: '#fff', transform: [{ translateX: isOnline ? 0 : 22 }] }]} />
              </View>
            </Tap>
          } />
          <Row label="Sync now" value={lastSyncedAt ? `Synced ${timeAgo(lastSyncedAt)}` : 'Not synced'} icon="sync" iconColor={colors.green} onPress={syncNow} last />
        </GroupCard>

        {pendingChanges > 0 ? (
          <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
            <View style={[styles.pendingBanner, { backgroundColor: colors.orange + '18' }]}>
              <Ionicons name="cloud-offline" size={16} color={colors.orange} />
              <Text style={[styles.pendingText, { color: colors.orange }]}>{pendingChanges} change{pendingChanges === 1 ? '' : 's'} queued — will sync when online.</Text>
            </View>
          </View>
        ) : null}

        {/* Appearance */}
        <GroupCard header="Appearance">
          <Row label="Theme" value={`Follows system · ${scheme === 'dark' ? 'Dark' : 'Light'}`} icon="moon" iconColor="#9B6BFF" last chevron={false} />
        </GroupCard>

        {/* Data */}
        <GroupCard header="Data">
          <Row label="Reset demo data" icon="refresh" iconColor={colors.red} onPress={() => { resetData(); }} danger last />
        </GroupCard>

        <View style={{ paddingHorizontal: 20, marginTop: 24, alignItems: 'center' }}>
          <Text style={[styles.version, { color: colors.tertiaryLabel }]}>TripMate v1.0 · Made for group travel</Text>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  profileCard: { borderRadius: 20, padding: 18 },
  profileTop: { flexDirection: 'row', alignItems: 'center' },
  bigAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  bigAvatarText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  profileName: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  profileSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13.5, fontWeight: '600', marginTop: 3 },
  profileStats: { flexDirection: 'row', marginTop: 18, paddingTop: 16, borderTopColor: 'rgba(255,255,255,0.2)', borderTopWidth: StyleSheet.hairlineWidth },
  profileStatValue: { color: '#fff', fontSize: 18, fontWeight: '800' },
  profileStatLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700', marginTop: 3 },
  editRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 6 },
  editSave: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  toggle: { width: 50, height: 30, borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, padding: 2, justifyContent: 'center' },
  toggleKnob: { width: 26, height: 26, borderRadius: 13 },
  pendingBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 14 },
  pendingText: { fontSize: 13, fontWeight: '700', flex: 1, lineHeight: 18 },
  version: { fontSize: 13, fontWeight: '600' },
});
