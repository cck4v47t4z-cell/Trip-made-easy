import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useStore } from '../lib/store';
import { useThemeColors, categoryMeta, expenseCategories } from '../lib/theme';
import { formatDateLong, todayISO, formatMoney, currencySymbol } from '../lib/format';
import { parseExpenseText } from '../lib/nlp';
import { expenseShare } from '../lib/settlement';
import type { Expense, ExpenseCategory, SplitType } from '../lib/types';
import type { RootStackParamList } from '../navigation/types';
import { ScreenShell, NavHeader } from '../components/NavHeader';
import { GroupCard, Row, TextField, LabeledField } from '../components/Form';
import { Tap, SegmentedControl, type SegTab } from '../components/primitives';
import { DatePickerSheet } from '../components/DatePickerSheet';
import { CategoryIcon } from '../components/CategoryIcon';
import { Avatar } from '../components/Avatar';
import Ionicons from '@expo/vector-icons/Ionicons';

const SPLIT_TABS: SegTab[] = [
  { key: 'equal', label: 'Equal' },
  { key: 'custom', label: 'Custom' },
  { key: 'percentage', label: 'Percent' },
  { key: 'shares', label: 'Shares' },
];

export function AddExpenseScreen() {
  const { colors } = useThemeColors();
  const { getTrip, addExpense, updateExpense, deleteExpense, expenses } = useStore();
  const route = useRoute<RouteProp<RootStackParamList, 'AddExpense'>>();
  const navigation = useNavigation<any>();
  const trip = getTrip(route.params.tripId);
  const existing = expenses.find((e) => e.id === route.params.expenseId);

  const [amount, setAmount] = useState(existing ? String(existing.amount) : '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [category, setCategory] = useState<ExpenseCategory>(existing?.category ?? 'Food');
  const [paidBy, setPaidBy] = useState(existing?.paidBy ?? 'me');
  const [participants, setParticipants] = useState<string[]>(existing?.participants ?? (trip?.members.map((m) => m.id) ?? []));
  const [splitType, setSplitType] = useState<SplitType>(existing?.splitType ?? 'equal');
  const [splitValues, setSplitValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    if (existing) for (const k of Object.keys(existing.splitValues)) init[k] = String(existing.splitValues[k]);
    return init;
  });
  const [date, setDate] = useState(existing?.date ?? todayISO());
  const [note, setNote] = useState(existing?.note ?? '');
  const [receiptUri, setReceiptUri] = useState<string | undefined>(existing?.receiptUri);
  const [nlp, setNlp] = useState('');
  const [dateSheet, setDateSheet] = useState(false);

  const currency = trip?.currency ?? 'INR';
  const amt = parseFloat(amount) || 0;

  const toggleParticipant = (id: string) => {
    setParticipants((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const setVal = (id: string, v: string) => setSplitValues((prev) => ({ ...prev, [id]: v }));

  const previewShare = (id: string): number => {
    if (!participants.includes(id)) return 0;
    if (amt <= 0) return 0;
    const mock: Expense = {
      id: 'x', tripId: trip!.id, amount: amt, description, category, paidBy,
      participants, splitType,
      splitValues: Object.fromEntries(Object.entries(splitValues).map(([k, v]) => [k, parseFloat(v) || 0])),
      date, createdBy: 'me', createdAt: '',
    };
    return expenseShare(mock, id);
  };

  const sumValues = participants.reduce((s, id) => s + (parseFloat(splitValues[id] || '0') || 0), 0);
  const totalSharePreview = participants.reduce((s, id) => s + previewShare(id), 0);

  const validationMsg = (() => {
    if (amt <= 0) return 'Enter an amount';
    if (!description.trim()) return 'Add a description';
    if (participants.length === 0) return 'Select who participated';
    if (splitType === 'custom' && Math.abs(sumValues - amt) > 0.5) return `Custom amounts must add up to ${formatMoney(amt, currency)}`;
    if (splitType === 'percentage' && Math.abs(sumValues - 100) > 0.5) return 'Percentages must add up to 100%';
    if (splitType === 'shares' && sumValues <= 0) return 'Add at least one share';
    return '';
  })();

  const handleNlp = () => {
    if (!trip) return;
    const res = parseExpenseText(nlp, trip.members, 'me');
    if (!res.ok || res.amount <= 0) return;
    setAmount(String(res.amount));
    setDescription(res.description);
    setCategory(res.category);
    if (res.paidById) setPaidBy(res.paidById);
    if (res.participantIds === 'all') setParticipants(trip.members.map((m) => m.id));
    else if (Array.isArray(res.participantIds) && res.participantIds.length) setParticipants(res.participantIds);
    setSplitType(res.splitType);
    setNlp('');
  };

  const save = () => {
    if (!trip || validationMsg) return;
    const sv: Record<string, number> = {};
    for (const id of participants) sv[id] = parseFloat(splitValues[id] || '0') || 0;
    const payload = {
      amount: amt, description: description.trim(), category, paidBy, participants,
      splitType, splitValues: sv, date, note: note.trim() || undefined,
      receiptUri, createdBy: 'me' as const,
    };
    if (existing) {
      updateExpense(trip.id, existing.id, payload);
    } else {
      addExpense(trip.id, payload);
    }
    navigation.goBack();
  };

  const remove = () => {
    if (!trip || !existing) return;
    deleteExpense(trip.id, existing.id);
    navigation.goBack();
  };

  if (!trip) return null;

  return (
    <ScreenShell edges={[]}>
      <NavHeader title={existing ? 'Edit Expense' : 'Add Expense'} backIcon="close" onBack={() => navigation.goBack()} rightLabel="Save" onRight={save} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          {/* Amount */}
          <View style={styles.amountWrap}>
            <Text style={[styles.currencySym, { color: colors.tertiaryLabel }]}>{currencySymbol(currency)}</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              placeholderTextColor={colors.tertiaryLabel}
              keyboardType="decimal-pad"
              style={[styles.amountInput, { color: colors.label }]}
              returnKeyType="done"
            />
          </View>

          {/* NLP */}
          <View style={{ paddingHorizontal: 16, marginTop: 4 }}>
            <View style={[styles.nlpCard, { backgroundColor: colors.card, borderColor: colors.separator }]}>
              <View style={styles.nlpHead}>
                <Ionicons name="sparkles" size={15} color={colors.brandWarm} />
                <Text style={[styles.nlpTitle, { color: colors.label }]}>Describe it in words</Text>
              </View>
              <View style={styles.nlpRow}>
                <TextInput
                  value={nlp}
                  onChangeText={setNlp}
                  placeholder="e.g. Rahul paid 1200 for dinner for everyone"
                  placeholderTextColor={colors.tertiaryLabel}
                  style={[styles.nlpInput, { color: colors.label }]}
                  onSubmitEditing={handleNlp}
                  returnKeyType="done"
                />
                <Tap onPress={handleNlp} scale={0.95}>
                  <View style={[styles.nlpBtn, { backgroundColor: colors.brand }]}>
                    <Text style={styles.nlpBtnText}>Auto-fill</Text>
                  </View>
                </Tap>
              </View>
            </View>
          </View>

          {/* Description */}
          <GroupCard header="Details" style={{ marginTop: 10 }}>
            <LabeledField label="What was it for?" last>
              <TextField value={description} onChange={setDescription} placeholder="e.g. Dinner at Britto's" style={{ paddingHorizontal: 0 }} maxLength={60} />
            </LabeledField>
          </GroupCard>

          {/* Category */}
          <View style={{ paddingHorizontal: 16, marginTop: 22 }}>
            <Text style={[styles.fieldHeader, { color: colors.secondaryLabel }]}>CATEGORY</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingTop: 8 }}>
            {expenseCategories.map((c) => {
              const active = c === category;
              return (
                <Tap key={c} onPress={() => setCategory(c)} scale={0.94}>
                  <View style={[styles.catChip, { backgroundColor: active ? categoryMeta[c].color : colors.card, borderColor: active ? categoryMeta[c].color : colors.separator, borderWidth: StyleSheet.hairlineWidth }]}>
                    <Ionicons name={categoryMeta[c].icon as any} size={15} color={active ? '#fff' : colors.secondaryLabel} />
                    <Text style={[styles.catChipText, { color: active ? '#fff' : colors.secondaryLabel }]}>{c}</Text>
                  </View>
                </Tap>
              );
            })}
          </ScrollView>

          {/* Paid by */}
          <View style={{ paddingHorizontal: 16, marginTop: 22 }}>
            <Text style={[styles.fieldHeader, { color: colors.secondaryLabel }]}>WHO PAID?</Text>
          </View>
          <View style={[styles.payerRow, { borderColor: colors.separator }]}>
            {trip.members.map((m) => {
              const active = paidBy === m.id;
              return (
                <Tap key={m.id} onPress={() => setPaidBy(m.id)} scale={0.92}>
                  <View style={{ alignItems: 'center' }}>
                    <Avatar member={m} size={active ? 50 : 42} border={active} />
                    <Text style={[styles.payerName, { color: active ? colors.label : colors.secondaryLabel }]} numberOfLines={1}>{m.isCurrentUser ? 'You' : m.name.split(' ')[0]}</Text>
                  </View>
                </Tap>
              );
            })}
          </View>

          {/* Split */}
          <View style={{ paddingHorizontal: 16, marginTop: 22 }}>
            <Text style={[styles.fieldHeader, { color: colors.secondaryLabel }]}>SPLIT BETWEEN ({participants.length})</Text>
          </View>
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            <SegmentedControl tabs={SPLIT_TABS} value={splitType} onChange={(k) => setSplitType(k as SplitType)} />
          </View>
          <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
            <View style={[styles.splitCard, { backgroundColor: colors.card }]}>
              <Tap onPress={() => setParticipants(trip.members.map((m) => m.id))} scale={0.98}>
                <View style={[styles.selectAll, { borderBottomColor: colors.separator }]}>
                  <Ionicons name="people" size={16} color={colors.brand} />
                  <Text style={[styles.selectAllText, { color: colors.brand }]}>Split between everyone</Text>
                </View>
              </Tap>
              {trip.members.map((m, i) => {
                const inP = participants.includes(m.id);
                return (
                  <View key={m.id} style={[styles.splitRow, i < trip.members.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator }]}>
                    <Tap onPress={() => toggleParticipant(m.id)} scale={0.96}>
                      <View style={styles.splitLeft}>
                        <View style={[styles.check, { backgroundColor: inP ? colors.brand : 'transparent', borderColor: inP ? colors.brand : colors.tertiaryLabel }]}>
                          {inP ? <Ionicons name="checkmark" size={13} color="#fff" /> : null}
                        </View>
                        <Avatar member={m} size={32} />
                        <Text style={[styles.splitName, { color: inP ? colors.label : colors.tertiaryLabel }]}>{m.isCurrentUser ? 'You' : m.name}</Text>
                      </View>
                    </Tap>
                    {inP && splitType !== 'equal' ? (
                      <View style={styles.splitRight}>
                        <TextInput
                          value={splitValues[m.id] ?? ''}
                          onChangeText={(v) => setVal(m.id, v)}
                          keyboardType="decimal-pad"
                          placeholder="0"
                          placeholderTextColor={colors.tertiaryLabel}
                          style={[styles.splitInput, { color: colors.label, borderColor: colors.separator, width: splitType === 'percentage' ? 56 : 64 }]}
                        />
                        <Text style={[styles.splitUnit, { color: colors.secondaryLabel }]}>{splitType === 'percentage' ? '%' : splitType === 'shares' ? 'sh' : ''}</Text>
                        <Text style={[styles.splitShare, { color: colors.green }]}>{formatMoney(previewShare(m.id), currency)}</Text>
                      </View>
                    ) : inP ? (
                      <Text style={[styles.splitShare, { color: colors.green }]}>{formatMoney(previewShare(m.id), currency)}</Text>
                    ) : null}
                  </View>
                );
              })}
              {splitType !== 'equal' ? (
                <View style={[styles.splitFooter, { borderTopColor: colors.separator }]}>
                  <Text style={[styles.splitFootText, { color: colors.secondaryLabel }]}>
                    {splitType === 'custom' ? `Total: ${formatMoney(sumValues, currency)} / ${formatMoney(amt, currency)}` : splitType === 'percentage' ? `Sum: ${sumValues}%` : `Sum: ${sumValues} shares`}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Date + receipt */}
          <GroupCard header="More" style={{ marginTop: 22 }}>
            <Row label="Date" value={formatDateLong(date)} icon="calendar" iconColor={colors.brand} onPress={() => setDateSheet(true)} />
            <Row label="Receipt photo" value={receiptUri ? 'Added' : 'Optional'} icon="camera" iconColor="#9B6BFF" onPress={() => setReceiptUri(`https://picsum.photos/seed/receipt-${Date.now()}/600/400`)} last />
          </GroupCard>

          <GroupCard>
            <LabeledField label="Note" last>
              <TextField value={note} onChange={setNote} placeholder="Add a note (optional)" multiline style={{ paddingHorizontal: 0, minHeight: 40 }} maxLength={140} />
            </LabeledField>
          </GroupCard>

          {validationMsg ? (
            <Text style={[styles.validMsg, { color: colors.orange }]}>{validationMsg}</Text>
          ) : (
            <Text style={[styles.validMsg, { color: colors.green }]}>✓ {participants.length} people · {formatMoney(totalSharePreview, currency)} allocated</Text>
          )}

          {existing ? (
            <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
              <Tap onPress={remove} scale={0.98}>
                <View style={[styles.deleteBtn, { borderColor: colors.red }]}>
                  <Ionicons name="trash-outline" size={17} color={colors.red} />
                  <Text style={[styles.deleteText, { color: colors.red }]}>Delete expense</Text>
                </View>
              </Tap>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <DatePickerSheet visible={dateSheet} onClose={() => setDateSheet(false)} value={date} onChange={setDate} title="Expense date" />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  amountWrap: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', paddingTop: 18, paddingBottom: 6, gap: 4 },
  currencySym: { fontSize: 26, fontWeight: '800' },
  amountInput: { fontSize: 52, fontWeight: '800', letterSpacing: -2, minWidth: 120, textAlign: 'center' },
  nlpCard: { borderRadius: 16, padding: 12, borderWidth: StyleSheet.hairlineWidth },
  nlpHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  nlpTitle: { fontSize: 13, fontWeight: '700' },
  nlpRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nlpInput: { flex: 1, fontSize: 14.5, fontWeight: '500', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, backgroundColor: 'rgba(120,120,128,0.08)' },
  nlpBtn: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
  nlpBtnText: { color: '#fff', fontWeight: '800', fontSize: 13.5 },
  fieldHeader: { fontSize: 12, fontWeight: '800', letterSpacing: 0.4 },
  catChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 20, gap: 6 },
  catChipText: { fontSize: 13, fontWeight: '700' },
  payerRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6, gap: 14, flexWrap: 'wrap', borderBottomWidth: StyleSheet.hairlineWidth },
  payerName: { fontSize: 11.5, fontWeight: '700', marginTop: 5 },
  splitCard: { borderRadius: 16, overflow: 'hidden' },
  selectAll: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 13, borderBottomWidth: StyleSheet.hairlineWidth },
  selectAllText: { fontSize: 14, fontWeight: '700' },
  splitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 13 },
  splitLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  check: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  splitName: { fontSize: 15, fontWeight: '600' },
  splitRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  splitInput: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 8, paddingVertical: 5, paddingHorizontal: 8, fontSize: 14, fontWeight: '700', textAlign: 'center' } as any,
  splitUnit: { fontSize: 12, fontWeight: '700' },
  splitShare: { fontSize: 14, fontWeight: '800', minWidth: 70, textAlign: 'right' },
  splitFooter: { padding: 12, borderTopWidth: StyleSheet.hairlineWidth, alignItems: 'flex-end' },
  splitFootText: { fontSize: 13, fontWeight: '700' },
  validMsg: { fontSize: 13.5, fontWeight: '700', textAlign: 'center', marginTop: 18, paddingHorizontal: 16 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, marginTop: 4 },
  deleteText: { fontSize: 15, fontWeight: '700' },
});
