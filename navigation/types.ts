import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Onboarding: undefined;
  Tabs: undefined;
  TripDashboard: { tripId: string };
  CreateTrip: undefined;
  AddExpense: { tripId: string; expenseId?: string };
  AddMemory: { tripId: string };
  AddPlace: { tripId: string };
  SettleUp: { tripId: string };
  Budget: { tripId: string };
  Timeline: { tripId: string };
  AISummary: { tripId: string };
  InviteMembers: { tripId: string };
  QuickAdd: undefined;
};

export type RootNav = NativeStackNavigationProp<RootStackParamList>;
