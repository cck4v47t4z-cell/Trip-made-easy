import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../lib/store';
import { useThemeColors } from '../lib/theme';
import { timeAgo } from '../lib/format';
import { ScreenShell, NavHeader } from '../components/NavHeader';
import { Tap, SectionTitle } from '../components/primitives';
import { EmptyState } from '../components/EmptyState';
import Ionicons from '@expo/vector-icons/Ionicons';

const kindColor: Record<string, string> = {
  balance: '#FF9F0A', reminder: '#3B6FF6', memory: '#9B6BFF', trip: '#5AC8FA', budget: '#30C97D', settlement: '#34C97D', activity: '#8E8E93',
};

export function NotificationsScreen() {
  const { colors } = useThemeColors();
  const { notifications, markNotificationRead, markAllNotificationsRead, getTrip } = useStore();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <ScreenShell edges={['top', 'left', 'right']}>
      <NavHeader title="Notifications" right={unread > 0 ? <Tap onPress={markAllNotificationsRead} scale={0.9}><View style={styles.markAll}><Text style={[styles.markAllText, { color: colors.brand }]}>Mark all read</Text></View></Tap> : undefined} />
      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={<EmptyState icon="notifications-outline" title="All caught up" subtitle="Useful reminders about trips, balances and memories will appear here." />}
        renderItem={({ item }) => {
          const c = kindColor[item.kind] ?? '#8E8E93';
          const trip = item.tripId ? getTrip(item.tripId) : undefined;
          return (
            <Tap onPress={() => markNotificationRead(item.id)} scale={0.995} style={{ paddingHorizontal: 16, marginBottom: 10 }}>
              <View style={[styles.row, { backgroundColor: colors.card, opacity: item.read ? 0.7 : 1 }]}>
                <View style={[styles.icon, { backgroundColor: c + '22' }]}><Ionicons name={item.icon as any} size={18} color={c} /></View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.title, { color: colors.label }]} numberOfLines={1}>{item.title}</Text>
                  <Text style={[styles.body, { color: colors.secondaryLabel }]} numberOfLines={2}>{item.body}</Text>
                  <Text style={[styles.time, { color: colors.tertiaryLabel }]}>{timeAgo(item.date)}{trip ? ` · ${trip.name}` : ''}</Text>
                </View>
                {!item.read ? <View style={[styles.unreadDot, { backgroundColor: colors.brand }]} /> : null}
              </View>
            </Tap>
          );
        }}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  markAll: { paddingHorizontal: 12, height: 40, justifyContent: 'center' },
  markAllText: { fontSize: 15, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16 },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15.5, fontWeight: '800', letterSpacing: -0.2 },
  body: { fontSize: 14, fontWeight: '500', marginTop: 3, lineHeight: 19 },
  time: { fontSize: 12, fontWeight: '600', marginTop: 6 },
  unreadDot: { width: 9, height: 9, borderRadius: 5, marginLeft: 8 },
});
