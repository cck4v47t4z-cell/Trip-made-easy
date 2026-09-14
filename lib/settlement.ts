import type { Expense, ID, Member, Settlement, Trip } from './types';

/**
 * Returns the share amount a given member owes for a single expense.
 */
export function expenseShare(expense: Expense, memberId: ID): number {
  if (!expense.participants.includes(memberId)) return 0;
  switch (expense.splitType) {
    case 'equal':
      return expense.amount / Math.max(1, expense.participants.length);
    case 'custom':
      return expense.splitValues[memberId] ?? 0;
    case 'percentage':
      return (expense.amount * (expense.splitValues[memberId] ?? 0)) / 100;
    case 'shares': {
      const totalShares = expense.participants.reduce(
        (sum, id) => sum + (expense.splitValues[id] ?? 0),
        0,
      );
      if (totalShares <= 0) return expense.amount / Math.max(1, expense.participants.length);
      return (expense.amount * (expense.splitValues[memberId] ?? 0)) / totalShares;
    }
    default:
      return 0;
  }
}

/** Total amount a member paid across all expenses in a trip. */
export function totalPaidBy(expenses: Expense[], memberId: ID): number {
  return expenses
    .filter((e) => e.paidBy === memberId)
    .reduce((sum, e) => sum + e.amount, 0);
}

/** Total share a member owes across all expenses in a trip. */
export function totalShareOf(expenses: Expense[], memberId: ID): number {
  return expenses.reduce((sum, e) => sum + expenseShare(e, memberId), 0);
}

export interface BalanceResult {
  balances: Record<ID, number>; // positive => others owe this member
  totalPaid: Record<ID, number>;
  totalShare: Record<ID, number>;
  grandTotal: number;
}

/**
 * Raw balances derived purely from expenses.
 * balance = totalPaid - totalShare. Positive means the group owes this member.
 */
export function computeBalances(trip: Trip, expenses: Expense[]): BalanceResult {
 const balances: Record<ID, number> = {};
  const totalPaid: Record<ID, number> = {};
  const totalShare: Record<ID, number> = {};
  let grandTotal = 0;

  for (const m of trip.members) {
    balances[m.id] = 0;
    totalPaid[m.id] = 0;
    totalShare[m.id] = 0;
  }

  const tripExpenses = expenses.filter((e) => e.tripId === trip.id);
  for (const e of tripExpenses) {
    grandTotal += e.amount;
    if (totalPaid[e.paidBy] !== undefined) totalPaid[e.paidBy] += e.amount;
    for (const m of trip.members) {
      const share = expenseShare(e, m.id);
      if (share) totalShare[m.id] += share;
    }
  }

  for (const m of trip.members) {
    balances[m.id] = (totalPaid[m.id] ?? 0) - (totalShare[m.id] ?? 0);
  }

  return { balances, totalPaid, totalShare, grandTotal };
}

export interface SuggestedSettlement {
  fromId: ID;
  toId: ID;
  amount: number;
}

/**
 * Greedy min-transaction settlement optimizer.
 * Splits members into debtors (owe) and creditors (owed), then repeatedly
 * settles the largest debt against the largest credit.
 */
export function optimizeSettlements(balances: Record<ID, number>): SuggestedSettlement[] {
  const debtors = Object.entries(balances)
    .map(([id, amt]) => ({ id, amount: -amt }))
    .filter((d) => d.amount > 0.005)
    .sort((a, b) => b.amount - a.amount);
  const creditors = Object.entries(balances)
    .map(([id, amt]) => ({ id, amount: amt }))
    .filter((c) => c.amount > 0.005)
    .sort((a, b) => b.amount - a.amount);

  const result: SuggestedSettlement[] = [];
  let i = 0;
  let j = 0;
  // Work on copies
  const d = debtors.map((x) => ({ ...x }));
  const c = creditors.map((x) => ({ ...x }));

  while (i < d.length && j < c.length) {
    const pay = Math.min(d[i].amount, c[j].amount);
    if (pay > 0.005) {
      result.push({ fromId: d[i].id, toId: c[j].id, amount: Math.round(pay * 100) / 100 });
    }
    d[i].amount -= pay;
    c[j].amount -= pay;
    if (d[i].amount <= 0.005) i++;
    if (c[j].amount <= 0.005) j++;
  }

  return result;
}

/**
 * Effective balances after accounting for settlements already marked paid.
 * A paid settlement (A -> B) increases A's balance and decreases B's balance.
 */
export function effectiveBalances(
  rawBalances: Record<ID, number>,
  paidSettlements: Settlement[],
): Record<ID, number> {
  const result: Record<ID, number> = { ...rawBalances };
  for (const s of paidSettlements) {
    if (!s.paid) continue;
    if (result[s.fromId] !== undefined) result[s.fromId] += s.amount;
    if (result[s.toId] !== undefined) result[s.toId] -= s.amount;
  }
  // round tiny floats
  for (const k of Object.keys(result)) {
    result[k] = Math.round(result[k] * 100) / 100;
  }
  return result;
}

export interface SettlementView {
  suggested: SuggestedSettlement[];
  history: Settlement[];
  balances: Record<ID, number>;
}

export function buildSettlementView(
  trip: Trip,
  expenses: Expense[],
  settlements: Settlement[],
): SettlementView {
  const { balances } = computeBalances(trip, expenses);
  const tripSettlements = settlements.filter((s) => s.tripId === trip.id);
  const paid = tripSettlements.filter((s) => s.paid);
  const eff = effectiveBalances(balances, paid);
  const history = tripSettlements.filter((s) => s.paid).sort((a, b) => (b.paidAt ?? b.createdAt).localeCompare(a.paidAt ?? a.createdAt));
  return {
    suggested: optimizeSettlements(eff),
    history,
    balances: eff,
  };
}

export function memberName(members: Member[], id: ID): string {
  return members.find((m) => m.id === id)?.name ?? 'Someone';
}
