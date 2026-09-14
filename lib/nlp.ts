import type { ExpenseCategory, Member, SplitType } from './types';

export interface ParseResult {
  ok: boolean;
  amount: number;
  paidById: string | null;
  description: string;
  category: ExpenseCategory;
  participantIds: string[] | 'all';
  splitType: SplitType;
  confidence: number;
}

const ME_WORDS = ['i', 'me', 'my', 'myself', 'mine'];

const CATEGORY_KEYWORDS: Record<ExpenseCategory, string[]> = {
  Food: ['dinner', 'lunch', 'breakfast', 'brunch', 'food', 'meal', 'snack', 'restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'eat', 'eating', 'snacks'],
  Transport: ['cab', 'uber', 'ola', 'taxi', 'bus', 'train', 'flight', 'auto', 'rickshaw', 'metro', 'transport', 'travel', 'ride', 'fare', 'ticket'],
  Hotel: ['hotel', 'stay', 'room', 'airbnb', 'booking', 'hostel', 'resort', 'accommodation', 'checkin', 'lodging'],
  Activities: ['activity', 'activities', 'paragliding', 'rafting', 'trek', 'trekking', 'entry', 'tickets', 'tour', 'safari', 'water sports', 'scuba', 'skiing', 'monument', 'museum', 'fort', 'adventure'],
  Shopping: ['shop', 'shopping', 'mall', 'gift', 'souvenir', 'clothes', 'market', 'store', 'bought', 'purchase'],
  Drinks: ['drink', 'drinks', 'beer', 'wine', 'cocktail', 'bar', 'pub', 'alcohol', 'shots', 'whiskey', 'vodka'],
  Fuel: ['petrol', 'fuel', 'gas', 'diesel', 'refuel', 'tank'],
  Other: [],
};

function guessCategory(text: string): ExpenseCategory {
  const lower = text.toLowerCase();
  let best: ExpenseCategory = 'Other';
  let bestScore = 0;
  for (const cat of Object.keys(CATEGORY_KEYWORDS) as ExpenseCategory[]) {
    for (const kw of CATEGORY_KEYWORDS[cat]) {
      if (lower.includes(kw) && kw.length > bestScore) {
        bestScore = kw.length;
        best = cat;
      }
    }
  }
  return best;
}

function isMeWord(w: string): boolean {
  return ME_WORDS.includes(w.toLowerCase().replace(/[^a-z]/g, ''));
}

function matchMember(token: string, members: Member[], currentUserId: string): Member | null {
  const t = token.toLowerCase().replace(/[^a-z]/g, '').trim();
  if (!t) return null;
  if (isMeWord(t)) return members.find((m) => m.id === currentUserId) ?? null;
  let m = members.find((mm) => mm.name.toLowerCase() === t);
  if (m) return m;
  m = members.find((mm) => mm.name.toLowerCase().split(' ')[0] === t);
  if (m) return m;
  m = members.find((mm) => mm.name.toLowerCase().split(' ')[0].startsWith(t) && t.length >= 2);
  if (m) return m;
  if (t.length === 1) {
    m = members.find((mm) => mm.name.toLowerCase().startsWith(t));
    if (m) return m;
  }
  return null;
}

export function parseExpenseText(
  input: string,
  members: Member[],
  currentUserId: string,
): ParseResult {
  const text = input.trim();
  const lower = text.toLowerCase();
  const fail: ParseResult = {
    ok: false, amount: 0, paidById: null, description: '',
    category: 'Other', participantIds: 'all', splitType: 'equal', confidence: 0,
  };
  if (!text) return fail;

  const amountMatch = text.match(/(?:\u20B9|rs|inr|\$|usd|eur|gbp)?\s*([0-9][0-9,]*(?:\.[0-9]+)?)/i);
  if (!amountMatch) return fail;
  const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  if (!amount || isNaN(amount)) return fail;

  let paidById: string | null = null;
  const current = members.find((m) => m.id === currentUserId);

  const paidByMatch = lower.match(/([a-z]+)\s+(?:paid|spent|payed)/);
  if (paidByMatch) {
    const w = paidByMatch[1];
    if (isMeWord(w)) {
      paidById = current?.id ?? null;
    } else {
      const m = matchMember(w, members, currentUserId);
      if (m) paidById = m.id;
    }
  }
  if (!paidById) paidById = current?.id ?? members[0]?.id ?? null;

  let participantIds: string[] | 'all' = 'all';
  let splitType: SplitType = 'equal';
  const everyoneWords = ['everyone', 'everybody', 'all of us', 'all', 'whole group', 'the group', 'us'];
  const isEveryone = everyoneWords.some((w) => lower.includes('for ' + w) || lower.includes('split ' + w) || lower.includes('between ' + w) || lower.includes('among ' + w));

  const splitBetweenMatch = lower.match(/(?:split (?:between|among|with)\s+|between\s+|among\s+|for\s+)([a-z0-9, ]+)/);
  if (splitBetweenMatch && !isEveryone) {
    const raw = splitBetweenMatch[1];
    const tokens = raw.split(/[,/]|\s+and\s+|\s+\+\s+/).map((t) => t.trim()).filter(Boolean);
    const ids: string[] = [];
    for (const tok of tokens) {
      if (!tok) continue;
      const m = matchMember(tok, members, currentUserId);
      if (m && !ids.includes(m.id)) ids.push(m.id);
    }
    if (ids.length) {
      participantIds = ids;
    }
  }
  if (isEveryone) participantIds = 'all';

  let description = '';
  const forMatch = lower.match(/\bfor\s+(.+)/);
  if (forMatch) {
    let rest = forMatch[1];
    rest = rest.split(/\b(split|between|among)\b/)[0];
    rest = rest.replace(/\b(everyone|everybody|all of us|all|the group|whole group|us)\b/gi, '').trim();
    rest = rest.replace(/[,&].*$/, '').replace(/^the\s+/, '').trim();
    description = rest.replace(/[.,]+$/, '').trim() || 'expense';
  } else {
    description = 'expense';
  }
  if (!description) description = 'expense';

  const category = guessCategory(description + ' ' + text);
  const confidence = Math.min(1, 0.4 + (paidById ? 0.2 : 0) + (description !== 'expense' ? 0.3 : 0) + (participantIds !== 'all' ? 0.1 : 0));

  return { ok: true, amount, paidById, description, category, participantIds, splitType, confidence };
}
