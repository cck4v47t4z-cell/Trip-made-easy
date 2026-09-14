import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors } from '../lib/theme';
import { useStore } from '../lib/store';
import { Tap } from '../components/primitives';
import { HomeScreen } from '../screens/HomeScreen';
import { ActivityScreen } from '../screens/ActivityScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

const ICONS: Record<string, { active: string; inactive: string }> = {
  Trips: { active: 'airplane', inactive: 'airplane-outline' },
  Activity: { active: 'time', inactive: 'time-outline' },
  Add: { active: 'add', inactive: 'add' },
  Notifications: { active: 'notifications', inactive: 'notifications-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

function EmptyScreen() { return <View />; }

function MainTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors, dark } = useThemeColors();
  const insets = useSafeAreaInsets();
  const { notifications } = useStore();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <View style={[styles.barOuter, { marginBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.barShell}>
        <BlurView intensity={dark ? 48 : 70} tint={dark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: dark ? 'rgba(20,20,22,0.34)' : 'rgba(255,255,255,0.5)' }]} />
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: 26, borderWidth: StyleSheet.hairlineWidth, borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.75)' }]} />
        <View style={styles.row}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const isAdd = route.name === 'Add';
          const ic = ICONS[route.name] ?? ICONS.Trips;

          const onPress = () => {
            if (isAdd) {
              navigation.getParent()?.navigate('QuickAdd');
              return;
            }
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          if (isAdd) {
            return (
              <Tap key={route.key} onPress={onPress} scale={0.9} style={styles.addWrap}>
                <View style={styles.addBtn}>
                  <Ionicons name="add" size={30} color="#fff" />
                </View>
              </Tap>
            );
          }

          return (
            <Tap key={route.key} onPress={onPress} scale={0.92} style={styles.item}>
              <View style={styles.itemIcon}>
                <Ionicons name={(isFocused ? ic.active : ic.inactive) as any} size={24} color={isFocused ? colors.brand : colors.tertiaryLabel} />
                {route.name === 'Notifications' && unread > 0 ? <View style={styles.badge}><Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text></View> : null}
              </View>
              <Text style={[styles.label, { color: isFocused ? colors.brand : colors.tertiaryLabel }]}>{route.name}</Text>
            </Tap>
          );
        })}
        </View>
      </View>
    </View>
  );
}

export function MainTabs() {
  return (
    <Tab.Navigator tabBar={(p) => <MainTabBar {...p} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Trips" component={HomeScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Add" component={EmptyScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  barOuter: { marginHorizontal: 12 },
  barShell: { borderRadius: 26, overflow: 'hidden', paddingBottom: 6, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', paddingTop: 10, paddingHorizontal: 6 },
  item: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  itemIcon: { alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 11, fontWeight: '700', marginTop: 3 },
  addWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 6 },
  addBtn: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#3B6FF6', alignItems: 'center', justifyContent: 'center', marginBottom: 18, shadowColor: '#3B6FF6', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  badge: { position: 'absolute', top: -4, right: -10, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: '#FF3B30', paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
});
