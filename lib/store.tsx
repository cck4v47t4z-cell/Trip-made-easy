import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  ActivityItem, AppNotification, Expense, ID, Member, Memory, Place, Settlement, Trip, TripData,
} from './types';
import {
  sampleActivity, sampleExpenses, sampleMemories, sampleNotifications, samplePlaces,
  sampleSettlements, sampleTrips, sampleUser,
} from './sampleData';
import { buildSettlementView, computeBalances, type BalanceResult, type SettlementView } from './settlement';
import { todayISO, uid } from './format';

const STORAGE_KEY = 'tripmate:data:v1';

const initialData: TripData = {
  user: sampleUser,
  trips: sampleTrips,
  expenses: sampleExpenses,
  memories: sampleMemories,
  places: samplePlaces,
  settlements: sampleSettlements,
  notifications: sampleNotifications,
  activity: sampleActivity,
  onboarded: false,
  lastSyncedAt: null,
};

interface StoreContextValue extends TripData {
  currentTripId: ID | null;
  isOnline: boolean;
  pendingChanges: number;
  ready: boolean;
  setCurrentTrip: (id: ID | null) => void;
  setOnline: (v: boolean) => void;
  syncNow: () => void;
  completeOnboarding: (name: string) => void;
  updateUser: (patch: Partial<Member>) => void;
  // trips
  createTrip: (data: Omit<Trip, 'id' | 'members' | 'createdAt'> & { members: Member[] }) => Trip;
  updateTrip: (id: ID, patch: Partial<Trip>) => void;
  deleteTrip: (id: ID) => void;
  setBudget: (id: ID, budget: number) => void;
  addMember: (tripId: ID, member: Omit<Member, 'id'>) => Member;
  removeMember: (tripId: ID, memberId: ID) => void;
  // expenses
  addExpense: (tripId: ID, data: Omit<Expense, 'id' | 'tripId' | 'createdAt' | 'createdBy'>) => Expense;
  updateExpense: (tripId: ID, id: ID, patch: Partial<Expense>) => void;
  deleteExpense: (tripId: ID, id: ID) => void;
  // settlements
  markSettlementPaid: (tripId: ID, fromId: ID, toId: ID, amount: number) => void;
  // memories
  addMemory: (tripId: ID, data: Omit<Memory, 'id' | 'tripId' | 'createdAt' | 'authorId'>) => Memory;
  toggleFavorite: (tripId: ID, id: ID) => void;
  deleteMemory: (tripId: ID, id: ID) => void;
  // places
  addPlace: (tripId: ID, data: Omit<Place, 'id' | 'tripId' | 'date' | 'addedById'>) => Place;
  deletePlace: (tripId: ID, id: ID) => void;
  // notifications
  markNotificationRead: (id: ID) => void;
  markAllNotificationsRead: () => void;
  // reset
  resetData: () => void;
  // derived
  getTrip: (id: ID) => Trip | undefined;
  tripExpenses: (id: ID) => Expense[];
  tripMemories: (id: ID) => Memory[];
  tripPlaces: (id: ID) => Place[];
  balances: (trip: Trip) => BalanceResult;
  settlementView: (trip: Trip) => SettlementView;
  tripTotal: (id: ID) => number;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<TripData>(initialData);
  const [ready, setReady] = useState(false);
  const [currentTripId, setCurrentTripId] = useState<ID | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingChanges, setPendingChanges] = useState(0);
  const firstLoad = useRef(true);

  // Load
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as TripData;
          setData({ ...initialData, ...parsed });
        }
      } catch (e) {
        // ignore corrupted storage
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // Persist
  useEffect(() => {
    if (!ready) return;
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    setPendingChanges((c) => (isOnline ? 0 : c + 1));
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [data, ready, isOnline]);

  const mutate = useCallback((fn: (prev: TripData) => TripData) => {
    setData((prev) => fn(prev));
  }, []);

  const addActivity = useCallback(
    (item: Omit<ActivityItem, 'id' | 'date'> & { date?: string }) => {
      mutate((prev) => ({
        ...prev,
        activity: [
          { ...item, id: uid(), date: item.date ?? new Date().toISOString() },
          ...prev.activity,
        ].slice(0, 120),
      }));
    },
    [mutate],
  );

  const pushNotification = useCallback(
    (n: Omit<AppNotification, 'id' | 'date' | 'read'> & { date?: string }) => {
      mutate((prev) => ({
        ...prev,
        notifications: [
          { ...n, id: uid(), date: n.date ?? new Date().toISOString(), read: false },
          ...prev.notifications,
        ].slice(0, 60),
      }));
    },
    [mutate],
  );

  const completeOnboarding = useCallback((name: string) => {
    mutate((prev) => ({
      ...prev,
      onboarded: true,
      user: { ...prev.user, name: name.trim() || prev.user.name },
      lastSyncedAt: new Date().toISOString(),
    }));
  }, [mutate]);

  const updateUser = useCallback((patch: Partial<Member>) => {
    mutate((prev) => ({ ...prev, user: { ...prev.user, ...patch } }));
  }, [mutate]);

  const createTrip = useCallback<StoreContextValue['createTrip']>((tripData) => {
    const trip: Trip = {
      ...tripData,
      id: uid(),
      createdAt: new Date().toISOString(),
    };
    mutate((prev) => ({ ...prev, trips: [trip, ...prev.trips] }));
    addActivity({ tripId: trip.id, tripName: trip.name, kind: 'trip', text: `${trip.name} was created`, actorId: 'me' });
    pushNotification({
      tripId: trip.id, kind: 'trip', title: `${trip.name} is ready`, body: 'Invite your friends and start planning.',
      icon: 'airplane',
    });
    return trip;
  }, [mutate, addActivity, pushNotification]);

  const updateTrip = useCallback((id: ID, patch: Partial<Trip>) => {
    mutate((prev) => ({ ...prev, trips: prev.trips.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
  }, [mutate]);

  const deleteTrip = useCallback((id: ID) => {
    mutate((prev) => ({
      ...prev,
      trips: prev.trips.filter((t) => t.id !== id),
      expenses: prev.expenses.filter((e) => e.tripId !== id),
      memories: prev.memories.filter((m) => m.tripId !== id),
      places: prev.places.filter((p) => p.tripId !== id),
      settlements: prev.settlements.filter((s) => s.tripId !== id),
    }));
  }, [mutate]);

  const setBudget = useCallback((id: ID, budget: number) => {
    mutate((prev) => ({ ...prev, trips: prev.trips.map((t) => (t.id === id ? { ...t, budget } : t)) }));
  }, [mutate]);

  const addMember = useCallback<StoreContextValue['addMember']>((tripId, memberData) => {
    const member: Member = { ...memberData, id: uid() };
    mutate((prev) => ({
      ...prev,
      trips: prev.trips.map((t) => (t.id === tripId ? { ...t, members: [...t.members, member] } : t)),
    }));
    const tripName = data.trips.find((t) => t.id === tripId)?.name ?? 'the trip';
    addActivity({ tripId, tripName, kind: 'member', text: `${member.name} joined ${tripName}`, actorId: 'me' });
    return member;
  }, [mutate, addActivity, data.trips]);

  const removeMember = useCallback((tripId: ID, memberId: ID) => {
    mutate((prev) => ({
      ...prev,
      trips: prev.trips.map((t) =>
        t.id === tripId ? { ...t, members: t.members.filter((m) => m.id !== memberId) } : t,
      ),
    }));
  }, [mutate]);

  const addExpense = useCallback<StoreContextValue['addExpense']>((tripId, expenseData) => {
    const expense: Expense = {
      ...expenseData,
      id: uid(),
      tripId,
      createdBy: 'me',
      createdAt: new Date().toISOString(),
    };
    mutate((prev) => ({ ...prev, expenses: [expense, ...prev.expenses] }));
    const trip = data.trips.find((t) => t.id === tripId);
    const payer = trip?.members.find((m) => m.id === expense.paidBy);
    addActivity({
      tripId, tripName: trip?.name ?? 'Trip', kind: 'expense',
      text: `${payer?.name ?? 'You'} paid for ${expense.description}`, actorId: expense.paidBy, amount: expense.amount,
    });
    return expense;
  }, [mutate, addActivity, data.trips]);

  const updateExpense = useCallback((tripId: ID, id: ID, patch: Partial<Expense>) => {
    mutate((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) => (e.id === id && e.tripId === tripId ? { ...e, ...patch } : e)),
    }));
  }, [mutate]);

  const deleteExpense = useCallback((tripId: ID, id: ID) => {
    mutate((prev) => ({ ...prev, expenses: prev.expenses.filter((e) => !(e.id === id && e.tripId === tripId)) }));
  }, [mutate]);

  const markSettlementPaid = useCallback((tripId: ID, fromId: ID, toId: ID, amount: number) => {
    const s: Settlement = {
      id: uid(), tripId, fromId, toId, amount,
      paid: true, createdAt: new Date().toISOString(), paidAt: new Date().toISOString(),
    };
    mutate((prev) => ({ ...prev, settlements: [s, ...prev.settlements] }));
    const trip = data.trips.find((t) => t.id === tripId);
    const fromName = trip?.members.find((m) => m.id === fromId)?.name ?? 'Someone';
    pushNotification({
      tripId, kind: 'settlement', title: `${fromName} settled \u20B9${Math.round(amount)} \u2713`,
      body: `Payment recorded for ${trip?.name ?? 'the trip'}.`, icon: 'checkmark-done',
    });
    addActivity({
      tripId, tripName: trip?.name ?? 'Trip', kind: 'settlement',
      text: `${fromName} settled a payment`, actorId: fromId, amount,
    });
  }, [mutate, data.trips, pushNotification, addActivity]);

  const addMemory = useCallback<StoreContextValue['addMemory']>((tripId, memoryData) => {
    const memory: Memory = {
      ...memoryData, id: uid(), tripId, authorId: 'me', createdAt: new Date().toISOString(),
    };
    mutate((prev) => ({ ...prev, memories: [memory, ...prev.memories] }));
    const trip = data.trips.find((t) => t.id === tripId);
    addActivity({
      tripId, tripName: trip?.name ?? 'Trip', kind: 'memory',
      text: memory.type === 'note' ? 'Rahul added a note' : memory.type === 'location' ? 'Rahul added a place moment' : 'Rahul added a memory',
      actorId: 'me',
    });
    return memory;
  }, [mutate, addActivity, data.trips]);

  const toggleFavorite = useCallback((tripId: ID, id: ID) => {
    mutate((prev) => ({
      ...prev,
      memories: prev.memories.map((m) =>
        m.id === id && m.tripId === tripId ? { ...m, isFavorite: !m.isFavorite } : m,
      ),
    }));
  }, [mutate]);

  const deleteMemory = useCallback((tripId: ID, id: ID) => {
    mutate((prev) => ({ ...prev, memories: prev.memories.filter((m) => !(m.id === id && m.tripId === tripId)) }));
  }, [mutate]);

  const addPlace = useCallback<StoreContextValue['addPlace']>((tripId, placeData) => {
    const place: Place = {
      ...placeData, id: uid(), tripId, addedById: 'me', date: todayISO(),
    };
    mutate((prev) => ({ ...prev, places: [place, ...prev.places] }));
    const trip = data.trips.find((t) => t.id === tripId);
    addActivity({
      tripId, tripName: trip?.name ?? 'Trip', kind: 'place',
      text: `Rahul added ${place.name}`, actorId: 'me',
    });
    return place;
  }, [mutate, addActivity, data.trips]);

  const deletePlace = useCallback((tripId: ID, id: ID) => {
    mutate((prev) => ({ ...prev, places: prev.places.filter((p) => !(p.id === id && p.tripId === tripId)) }));
  }, [mutate]);

  const markNotificationRead = useCallback((id: ID) => {
    mutate((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, [mutate]);

  const markAllNotificationsRead = useCallback(() => {
    mutate((prev) => ({ ...prev, notifications: prev.notifications.map((n) => ({ ...n, read: true })) }));
  }, [mutate]);

  const resetData = useCallback(() => {
    setData({ ...initialData, onboarded: true });
    setPendingChanges(0);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const setOnline = useCallback((v: boolean) => {
    setIsOnline(v);
  }, []);

  const syncNow = useCallback(() => {
    setIsOnline(true);
    mutate((prev) => ({ ...prev, lastSyncedAt: new Date().toISOString() }));
    setPendingChanges(0);
  }, [mutate]);

  const getTrip = useCallback((id: ID) => data.trips.find((t) => t.id === id), [data.trips]);
  const tripExpenses = useCallback((id: ID) => data.expenses.filter((e) => e.tripId === id).sort((a, b) => b.date.localeCompare(a.date)), [data.expenses]);
  const tripMemories = useCallback((id: ID) => data.memories.filter((m) => m.tripId === id).sort((a, b) => b.date.localeCompare(a.date)), [data.memories]);
  const tripPlaces = useCallback((id: ID) => data.places.filter((p) => p.tripId === id), [data.places]);
  const balances = useCallback((trip: Trip) => computeBalances(trip, data.expenses), [data.expenses]);
  const settlementView = useCallback((trip: Trip) => buildSettlementView(trip, data.expenses, data.settlements), [data.expenses, data.settlements]);
  const tripTotal = useCallback((id: ID) => data.expenses.filter((e) => e.tripId === id).reduce((s, e) => s + e.amount, 0), [data.expenses]);

  const value = useMemo<StoreContextValue>(() => ({
    ...data,
    currentTripId,
    isOnline,
    pendingChanges,
    ready,
    setCurrentTrip: setCurrentTripId,
    setOnline,
    syncNow,
    completeOnboarding,
    updateUser,
    createTrip,
    updateTrip,
    deleteTrip,
    setBudget,
    addMember,
    removeMember,
    addExpense,
    updateExpense,
    deleteExpense,
    markSettlementPaid,
    addMemory,
    toggleFavorite,
    deleteMemory,
    addPlace,
    deletePlace,
    markNotificationRead,
    markAllNotificationsRead,
    resetData,
    getTrip,
    tripExpenses,
    tripMemories,
    tripPlaces,
    balances,
    settlementView,
    tripTotal,
  }), [
    data, currentTripId, isOnline, pendingChanges, ready, completeOnboarding, updateUser,
    createTrip, updateTrip, deleteTrip, setBudget, addMember, removeMember, addExpense,
    updateExpense, deleteExpense, markSettlementPaid, addMemory, toggleFavorite, deleteMemory,
    addPlace, deletePlace, markNotificationRead, markAllNotificationsRead, resetData, setOnline,
    syncNow, getTrip, tripExpenses, tripMemories, tripPlaces, balances, settlementView, tripTotal,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
