import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColorScheme, StyleSheet, Text, View } from 'react-native';

import { StoreProvider, useStore } from './lib/store';
import { useThemeColors } from './lib/theme';
import type { RootStackParamList } from './navigation/types';
import { MainTabs } from './navigation/MainTabs';

import { OnboardingScreen } from './screens/OnboardingScreen';
import { TripDashboardScreen } from './screens/TripDashboardScreen';
import { CreateTripScreen } from './screens/CreateTripScreen';
import { AddExpenseScreen } from './screens/AddExpenseScreen';
import { AddMemoryScreen } from './screens/AddMemoryScreen';
import { AddPlaceScreen } from './screens/AddPlaceScreen';
import { SettleUpScreen } from './screens/SettleUpScreen';
import { BudgetScreen } from './screens/BudgetScreen';
import { TimelineScreen } from './screens/TimelineScreen';
import { AISummaryScreen } from './screens/AISummaryScreen';
import { InviteMembersScreen } from './screens/InviteMembersScreen';
import { QuickAddScreen } from './screens/QuickAddScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const { colors } = useThemeColors();
  const { onboarded } = useStore();
  return (
    <Stack.Navigator
      initialRouteName={onboarded ? 'Tabs' : 'Onboarding'}
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
      <Stack.Screen name="Tabs" component={MainTabs} options={{ animation: 'none' }} />
      <Stack.Screen name="TripDashboard" component={TripDashboardScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="CreateTrip" component={CreateTripScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="AddMemory" component={AddMemoryScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="AddPlace" component={AddPlaceScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="InviteMembers" component={InviteMembersScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="QuickAdd" component={QuickAddScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="SettleUp" component={SettleUpScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Budget" component={BudgetScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Timeline" component={TimelineScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="AISummary" component={AISummaryScreen} options={{ animation: 'slide_from_right' }} />
    </Stack.Navigator>
  );
}

function Splash() {
  const { colors } = useThemeColors();
  return (
    <View style={[styles.splash, { backgroundColor: colors.background }]}>
      <View style={styles.splashIcon}>
        <Text style={styles.splashEmoji}>🧳</Text>
      </View>
      <Text style={[styles.splashText, { color: colors.label }]}>TripMate</Text>
    </View>
  );
}

function RootApp() {
  const { ready } = useStore();
  const [fontsLoaded] = useFonts({ ...Ionicons.font });
  const scheme = useColorScheme();
  const { colors } = useThemeColors();

  if (!fontsLoaded || !ready) return <Splash />;

  const navTheme = scheme === 'dark'
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: colors.background, card: colors.card, text: colors.label, border: colors.separator, primary: colors.brand } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.background, card: colors.card, text: colors.label, border: colors.separator, primary: colors.brand } };

  return (
    <NavigationContainer theme={navTheme as any}>
      <RootNavigator />
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <RootApp />
    </StoreProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  splashIcon: { width: 96, height: 96, borderRadius: 28, backgroundColor: '#3B6FF6', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  splashEmoji: { fontSize: 44 },
  splashText: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
});
