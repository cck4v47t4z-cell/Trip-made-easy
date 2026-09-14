import type { Currency, Trip, TripStatus } from './types';

const currencySymbols: Record<Currency, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export function currencySymbol(currency: Currency): string {
  return currencySymbols[currency] ?? '';
}

export function formatMoney(amount: number, currency: Currency, opts?: { sign?: boolean }): string {
  const symbol = currencySymbols[currency] ?? '';
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  const rounded = Math.round(Math.abs(amount));
  const formatted = rounded.toLocaleString(locale);
  const neg = amount < 0;
  const signStr = opts?.sign && amount > 0 ? '+' : neg ? '-' : '';
  return `${signStr}${symbol}${formatted}`;
}

export function formatMoneyPlain(amount: number, currency: Currency): string {
  const symbol = currencySymbols[currency] ?? '';
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return `${symbol}${Math.round(amount).toLocaleString(locale)}`;
}

export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function formatDateShort(iso: string): string {
  const d = parseDate(iso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

export function formatDateFull(iso: string): string {
  const d = parseDate(iso);
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS_FULL[d.getMonth()]}`;
}

export function formatDateLong(iso: string): string {
  const d = parseDate(iso);
  return `${d.getDate()} ${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateRange(startISO: string, endISO: string): string {
  const s = parseDate(startISO);
  const e = parseDate(endISO);
  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
    return `${s.getDate()}–${e.getDate()} ${MONTHS_SHORT[e.getMonth()]}`;
  }
  if (s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()} ${MONTHS_SHORT[s.getMonth()]} – ${e.getDate()} ${MONTHS_SHORT[e.getMonth()]}`;
  }
  return `${s.getDate()} ${MONTHS_SHORT[s.getMonth()]} ${s.getFullYear()} – ${e.getDate()} ${MONTHS_SHORT[e.getMonth()]} ${e.getFullYear()}`;
}

export function tripStatus(trip: Trip, refISO?: string): TripStatus {
  const ref = refISO ? parseDate(refISO) : new Date();
  const today = toISODate(ref);
  if (today < trip.startDate) return 'upcoming';
  if (today > trip.endDate) return 'past';
  return 'active';
}

export function tripDuration(trip: Trip): number {
  const s = parseDate(trip.startDate).getTime();
  const e = parseDate(trip.endDate).getTime();
  return Math.max(1, Math.round((e - s) / 86400000) + 1);
}

export function daysUntil(iso: string, refISO?: string): number {
  const ref = refISO ? parseDate(refISO) : new Date();
  const target = parseDate(iso);
  return Math.round((target.getTime() - ref.getTime()) / 86400000);
}

export function timeAgo(iso: string, refISO?: string): string {
  const ref = refISO ? parseDate(refISO).getTime() : Date.now();
  const t = new Date(iso).getTime();
  const diff = Math.max(0, ref - t);
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return formatDateShort(iso.split('T')[0] ?? iso);
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
