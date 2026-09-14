import type {
  ActivityItem, AppNotification, Expense, Memory, Member, Place, Settlement, Trip,
} from './types';

const ME: Member = {
  id: 'me',
  name: 'Rahul',
  avatarColor: '#3B6FF6',
  isCurrentUser: true,
  phone: '+91 98765 43210',
  email: 'rahul@example.com',
};

const aanya: Member = { id: 'm_aanya', name: 'Aanya', avatarColor: '#FF5C8A', phone: '+91 98111 22334' };
const karan: Member = { id: 'm_karan', name: 'Karan', avatarColor: '#30C97D', phone: '+91 98222 33445' };
const priya: Member = { id: 'm_priya', name: 'Priya', avatarColor: '#9B6BFF', phone: '+91 98333 44556' };

const neha: Member = { id: 'm_neha', name: 'Neha', avatarColor: '#FF6B4A' };
const arjun: Member = { id: 'm_arjun', name: 'Arjun', avatarColor: '#00C2B8' };
const zoya: Member = { id: 'm_zoya', name: 'Zoya', avatarColor: '#FFB340' };
const dev: Member = { id: 'm_dev', name: 'Dev', avatarColor: '#5AC8FA' };

const img = (seed: string) => 'https://picsum.photos/seed/' + seed + '/800/600';

const goaMembers = [ME, aanya, karan, priya];

export const sampleTrips: Trip[] = [
  {
    id: 'trip_goa',
    name: 'Goa Trip',
    destination: 'Goa, India',
    startDate: '2026-09-12',
    endDate: '2026-09-16',
    currency: 'INR',
    coverUri: img('goa-sunset-beach'),
    coverGradient: ['#FF6B4A', '#FFB340'],
    members: goaMembers,
    budget: 20000,
    createdAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'trip_manali',
    name: 'Manali Escape',
    destination: 'Manali, Himachal',
    startDate: '2026-06-10',
    endDate: '2026-06-15',
    currency: 'INR',
    coverUri: img('manali-mountains-snow'),
    coverGradient: ['#5AC8FA', '#3B6FF6'],
    members: [ME, neha, arjun],
    budget: 30000,
    createdAt: '2026-05-20T10:00:00.000Z',
  },
  {
    id: 'trip_ladakh',
    name: 'Ladakh Expedition',
    destination: 'Leh-Ladakh',
    startDate: '2026-10-05',
    endDate: '2026-10-12',
    currency: 'INR',
    coverUri: img('ladakh-valley-monastery'),
    coverGradient: ['#9B6BFF', '#FF5C8A'],
    members: [ME, zoya, dev, aanya],
    budget: 45000,
    createdAt: '2026-09-10T10:00:00.000Z',
  },
];

const G = 'trip_goa';
const M = 'trip_manali';

export const sampleExpenses: Expense[] = [
  { id: 'e1', tripId: G, amount: 5000, description: 'Beach Resort \u2014 4 nights', category: 'Hotel', paidBy: 'me', participants: ['me','m_aanya','m_karan','m_priya'], splitType: 'equal', splitValues: {}, date: '2026-09-12', createdBy: 'me', createdAt: '2026-09-12T08:30:00.000Z', note: 'Check-in at 11 AM' },
  { id: 'e2', tripId: G, amount: 1800, description: 'Dinner at Britto\u2019s', category: 'Food', paidBy: 'me', participants: ['me','m_aanya','m_karan','m_priya'], splitType: 'equal', splitValues: {}, date: '2026-09-12', createdBy: 'me', createdAt: '2026-09-12T20:10:00.000Z' },
  { id: 'e3', tripId: G, amount: 3500, description: 'Petrol for the rental car', category: 'Fuel', paidBy: 'm_karan', participants: ['me','m_aanya','m_karan','m_priya'], splitType: 'equal', splitValues: {}, date: '2026-09-13', createdBy: 'm_karan', createdAt: '2026-09-13T09:00:00.000Z' },
  { id: 'e4', tripId: G, amount: 950, description: 'Beach caf\u00e9 brunch', category: 'Food', paidBy: 'm_aanya', participants: ['me','m_aanya','m_karan','m_priya'], splitType: 'equal', splitValues: {}, date: '2026-09-13', createdBy: 'm_aanya', createdAt: '2026-09-13T13:00:00.000Z', placeId: 'p_baga' },
  { id: 'e5', tripId: G, amount: 1800, description: 'Water sports at Baga', category: 'Activities', paidBy: 'm_priya', participants: ['me','m_aanya','m_karan','m_priya'], splitType: 'equal', splitValues: {}, date: '2026-09-13', createdBy: 'm_priya', createdAt: '2026-09-13T15:30:00.000Z', placeId: 'p_baga' },
  { id: 'e6', tripId: G, amount: 1200, description: 'Souvenir shopping at Anjuna', category: 'Shopping', paidBy: 'me', participants: ['me','m_priya'], splitType: 'custom', splitValues: { 'me': 600, 'm_priya': 600 }, date: '2026-09-14', createdBy: 'me', createdAt: '2026-09-14T11:00:00.000Z' },
  { id: 'e7', tripId: G, amount: 820, description: 'Drinks at Thalassa', category: 'Drinks', paidBy: 'm_karan', participants: ['me','m_aanya','m_karan','m_priya'], splitType: 'equal', splitValues: {}, date: '2026-09-14', createdBy: 'm_karan', createdAt: '2026-09-14T19:00:00.000Z', placeId: 'p_thalassa' },
  { id: 'e8', tripId: G, amount: 620, description: 'Breakfast at the resort', category: 'Food', paidBy: 'm_aanya', participants: ['me','m_aanya','m_karan','m_priya'], splitType: 'equal', splitValues: {}, date: '2026-09-14', createdBy: 'm_aanya', createdAt: '2026-09-14T08:30:00.000Z' },
  { id: 'e9', tripId: G, amount: 1200, description: 'Airport taxi', category: 'Transport', paidBy: 'me', participants: ['me','m_aanya','m_karan','m_priya'], splitType: 'equal', splitValues: {}, date: '2026-09-12', createdBy: 'me', createdAt: '2026-09-12T06:00:00.000Z' },
  { id: 'e10', tripId: G, amount: 1530, description: 'Lunch with sea view', category: 'Food', paidBy: 'm_priya', participants: ['me','m_aanya','m_karan','m_priya'], splitType: 'equal', splitValues: {}, date: '2026-09-15', createdBy: 'm_priya', createdAt: '2026-09-15T13:30:00.000Z' },
  { id: 'm1', tripId: M, amount: 8000, description: 'Cottage booking', category: 'Hotel', paidBy: 'me', participants: ['me','m_neha','m_arjun'], splitType: 'equal', splitValues: {}, date: '2026-06-10', createdBy: 'me', createdAt: '2026-06-10T10:00:00.000Z' },
  { id: 'm2', tripId: M, amount: 2400, description: 'Paragliding at Solang', category: 'Activities', paidBy: 'm_arjun', participants: ['me','m_neha','m_arjun'], splitType: 'equal', splitValues: {}, date: '2026-06-12', createdBy: 'm_arjun', createdAt: '2026-06-12T12:00:00.000Z' },
  { id: 'm3', tripId: M, amount: 1800, description: 'Dinner at Johnson\u2019s', category: 'Food', paidBy: 'm_neha', participants: ['me','m_neha','m_arjun'], splitType: 'equal', splitValues: {}, date: '2026-06-11', createdBy: 'm_neha', createdAt: '2026-06-11T20:00:00.000Z' },
];

export const sampleMemories: Memory[] = [
  { id: 'mem1', tripId: G, type: 'note', text: 'Reached Goa! Checked into the resort. Amazing vibes already \u2014 trip is going to be epic.', taggedMemberIds: ['m_aanya','m_karan'], isFavorite: true, authorId: 'me', date: '2026-09-12T10:15:00.000Z' },
  { id: 'mem2', tripId: G, type: 'photo', uri: img('goa-airport-selfie'), caption: 'Airport squad assembled', taggedMemberIds: ['m_aanya','m_karan','m_priya'], isFavorite: false, authorId: 'm_karan', date: '2026-09-12T06:30:00.000Z' },
  { id: 'mem3', tripId: G, type: 'photo', uri: img('goa-dinner-table'), caption: 'First dinner at Britto\u2019s', taggedMemberIds: ['me','m_aanya','m_karan','m_priya'], isFavorite: false, authorId: 'm_aanya', date: '2026-09-12T21:00:00.000Z' },
  { id: 'mem4', tripId: G, type: 'photo', uri: img('goa-baga-sunset'), caption: 'Baga Beach \u2014 reached at 4:30 PM. Amazing sunset.', locationName: 'Baga Beach', taggedMemberIds: ['me','m_priya'], isFavorite: true, authorId: 'me', date: '2026-09-13T17:05:00.000Z' },
  { id: 'mem5', tripId: G, type: 'photo', uri: img('goa-beach-cafe'), caption: 'Beach caf\u00e9 brunch', locationName: 'Baga Beach', taggedMemberIds: ['m_aanya'], isFavorite: false, authorId: 'm_aanya', date: '2026-09-13T13:20:00.000Z' },
  { id: 'mem6', tripId: G, type: 'photo', uri: img('goa-water-sports'), caption: 'Water sports are go!', taggedMemberIds: ['m_karan','m_priya'], isFavorite: false, authorId: 'm_priya', date: '2026-09-13T15:45:00.000Z' },
  { id: 'mem7', tripId: G, type: 'note', text: 'Best beach day ever \uD83C\uDF0A the sunset was unreal.', taggedMemberIds: ['me'], isFavorite: true, authorId: 'm_aanya', date: '2026-09-13T22:00:00.000Z' },
  { id: 'mem8', tripId: G, type: 'photo', uri: img('goa-fort-aguada'), caption: 'Fort Aguada views', locationName: 'Fort Aguada', taggedMemberIds: ['me','m_karan'], isFavorite: false, authorId: 'm_karan', date: '2026-09-14T09:30:00.000Z' },
  { id: 'mem9', tripId: G, type: 'photo', uri: img('goa-thalassa-sunset'), caption: 'Sunset dinner at Thalassa \u2728', locationName: 'Thalassa', taggedMemberIds: ['m_priya'], isFavorite: true, authorId: 'm_priya', date: '2026-09-14T19:30:00.000Z' },
  { id: 'mem10', tripId: G, type: 'note', text: 'Must try the sunset view at Thalassa. Best meal of the trip.', locationName: 'Thalassa', taggedMemberIds: ['me'], isFavorite: false, authorId: 'm_priya', date: '2026-09-14T20:30:00.000Z' },
];

export const samplePlaces: Place[] = [
  { id: 'p_thalassa', tripId: G, name: 'Thalassa', category: 'Restaurant', area: 'Siolim, North Goa', photoUris: [img('thalassa-cliff')], notes: 'Must try the sunset view. Book a table near the cliff.', rating: 4.5, addedById: 'm_priya', expenseId: 'e7', date: '2026-09-14' },
  { id: 'p_baga', tripId: G, name: 'Baga Beach', category: 'Beach', area: 'Baga, North Goa', photoUris: [img('baga-beach-wide')], notes: 'Best sunset spot. Water sports available all day.', rating: 4.8, addedById: 'me', expenseId: 'e4', date: '2026-09-13' },
  { id: 'p_aguada', tripId: G, name: 'Fort Aguada', category: 'Attraction', area: 'Sinquerim, North Goa', photoUris: [img('fort-aguada')], notes: 'Great views, go early to beat the crowd.', rating: 4.3, addedById: 'm_karan', date: '2026-09-14' },
  { id: 'p_britto', tripId: G, name: 'Britto\u2019s', category: 'Restaurant', area: 'Baga Beach', photoUris: [img('britto-food')], notes: 'Amazing seafood on the beach.', rating: 4.6, addedById: 'm_aanya', expenseId: 'e2', date: '2026-09-12' },
  { id: 'p_anjuna', tripId: G, name: 'Anjuna Flea Market', category: 'Shop', area: 'Anjuna, North Goa', photoUris: [img('anjuna-market')], notes: 'Wednesdays only. Bargain hard.', rating: 4.0, addedById: 'me', expenseId: 'e6', date: '2026-09-14' },
];

export const sampleSettlements: Settlement[] = [
  { id: 's1', tripId: M, fromId: 'm_neha', toId: 'me', amount: 420, paid: true, createdAt: '2026-06-16T10:00:00.000Z', paidAt: '2026-06-16T18:00:00.000Z' },
];

export const sampleNotifications: AppNotification[] = [
  { id: 'n1', tripId: G, kind: 'balance', title: 'Aanya owes you \u20B93,035', body: 'Settle balances for Goa Trip when the trip ends.', date: '2026-09-13T09:00:00.000Z', read: false, icon: 'wallet' },
  { id: 'n2', tripId: G, kind: 'memory', title: 'Add today\u2019s memories \uD83D\uDCF8', body: 'You haven\u2019t added any memories for Goa today.', date: '2026-09-13T19:00:00.000Z', read: false, icon: 'camera' },
  { id: 'n3', tripId: G, kind: 'budget', title: 'Budget update', body: 'You\u2019ve used 92% of your Goa budget. \u20B91,580 remaining.', date: '2026-09-13T20:00:00.000Z', read: true, icon: 'pie-chart' },
  { id: 'n4', tripId: 'trip_ladakh', kind: 'trip', title: 'Ladakh Expedition starts in 22 days', body: 'Plan your packing and finalize the itinerary.', date: '2026-09-12T08:00:00.000Z', read: false, icon: 'airplane' },
  { id: 'n5', tripId: M, kind: 'settlement', title: 'Neha settled \u20B9420 \u2713', body: 'Payment recorded for Manali Escape.', date: '2026-06-16T18:00:00.000Z', read: true, icon: 'checkmark-done' },
];

export const sampleActivity: ActivityItem[] = [
  { id: 'a1', tripId: G, tripName: 'Goa Trip', kind: 'expense', text: 'Priya added Lunch with sea view', actorId: 'm_priya', date: '2026-09-15T13:35:00.000Z', amount: 1530 },
  { id: 'a2', tripId: G, tripName: 'Goa Trip', kind: 'memory', text: 'Priya captured a sunset at Thalassa', actorId: 'm_priya', date: '2026-09-14T19:35:00.000Z' },
  { id: 'a3', tripId: G, tripName: 'Goa Trip', kind: 'place', text: 'Karan added Fort Aguada', actorId: 'm_karan', date: '2026-09-14T09:35:00.000Z' },
  { id: 'a4', tripId: G, tripName: 'Goa Trip', kind: 'expense', text: 'Karan paid \u20B9820 for Drinks at Thalassa', actorId: 'm_karan', date: '2026-09-14T19:05:00.000Z', amount: 820 },
  { id: 'a5', tripId: G, tripName: 'Goa Trip', kind: 'memory', text: 'Rahul captured the Baga Beach sunset', actorId: 'me', date: '2026-09-13T17:10:00.000Z' },
  { id: 'a6', tripId: G, tripName: 'Goa Trip', kind: 'expense', text: 'Aanya paid \u20B9950 for Beach caf\u00e9 brunch', actorId: 'm_aanya', date: '2026-09-13T13:05:00.000Z', amount: 950 },
  { id: 'a7', tripId: G, tripName: 'Goa Trip', kind: 'member', text: 'Priya joined the trip', actorId: 'm_priya', date: '2026-09-01T11:00:00.000Z' },
  { id: 'a8', tripId: M, tripName: 'Manali Escape', kind: 'settlement', text: 'Neha settled \u20B9420 with Rahul', actorId: 'm_neha', date: '2026-06-16T18:00:00.000Z', amount: 420 },
];

export const sampleUser = ME;
