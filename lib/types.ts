export type ID = string;

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface Member {
  id: ID;
  name: string;
  avatarColor: string;
  phone?: string;
  email?: string;
  avatarUri?: string;
  isCurrentUser?: boolean;
}

export type TripStatus = 'upcoming' | 'active' | 'past';

export interface Trip {
  id: ID;
  name: string;
  destination: string;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string;
  currency: Currency;
  coverUri?: string;
  coverGradient: [string, string];
  members: Member[];
  budget?: number;
  createdAt: string;
}

export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Hotel'
  | 'Activities'
  | 'Shopping'
  | 'Drinks'
  | 'Fuel'
  | 'Other';

export type SplitType = 'equal' | 'custom' | 'percentage' | 'shares';

export interface Expense {
  id: ID;
  tripId: ID;
  amount: number;
  description: string;
  category: ExpenseCategory;
  paidBy: ID;
  participants: ID[];
  splitType: SplitType;
  splitValues: Record<ID, number>;
  date: string;
  receiptUri?: string;
  note?: string;
  placeId?: ID;
  createdBy: ID;
  createdAt: string;
}

export type MemoryType = 'photo' | 'video' | 'note' | 'location';

export interface Memory {
  id: ID;
  tripId: ID;
  type: MemoryType;
  uri?: string;
  caption?: string;
  text?: string;
  locationName?: string;
  taggedMemberIds: ID[];
  isFavorite: boolean;
  authorId: ID;
  date: string;
  createdAt: string;
}

export type PlaceCategory = 'Restaurant' | 'Beach' | 'Hotel' | 'Attraction' | 'Shop';

export interface Place {
  id: ID;
  tripId: ID;
  name: string;
  category: PlaceCategory;
  area?: string;
  photoUris: string[];
  notes?: string;
  rating?: number;
  addedById: ID;
  expenseId?: ID;
  date: string;
}

export interface Settlement {
  id: ID;
  tripId: ID;
  fromId: ID;
  toId: ID;
  amount: number;
  paid: boolean;
  createdAt: string;
  paidAt?: string;
}

export type NotificationKind =
  | 'balance'
  | 'reminder'
  | 'memory'
  | 'trip'
  | 'budget'
  | 'activity'
  | 'settlement';

export interface AppNotification {
  id: ID;
  tripId?: ID;
  kind: NotificationKind;
  title: string;
  body: string;
  date: string;
  read: boolean;
  icon: string;
}

export interface ActivityItem {
  id: ID;
  tripId: ID;
  tripName: string;
  kind: 'expense' | 'memory' | 'place' | 'settlement' | 'member' | 'trip';
  text: string;
  actorId?: ID;
  date: string;
  amount?: number;
}

export interface TripData {
  user: Member;
  trips: Trip[];
  expenses: Expense[];
  memories: Memory[];
  places: Place[];
  settlements: Settlement[];
  notifications: AppNotification[];
  activity: ActivityItem[];
  onboarded: boolean;
  lastSyncedAt: string | null;
}
