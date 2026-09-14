import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, View, Pressable, FlatList, type ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors } from '../lib/theme';
import { parseDate, toISODate } from '../lib/format';

const ITEM = 46;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function WheelColumn({
  items, selectedIndex, onSelect, renderLabel, width,
}: {
  items: { value: number; label: string }[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  renderLabel: (item: { value: number; label: string }) => string;
  width: number;
}) {
  const { colors } = useThemeColors();
  const ref = useRef<FlatList>(null);
  const height = ITEM * 5;
  const onEnd = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM);
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    if (clamped !== selectedIndex) onSelect(clamped);
  };
  return (
    <View style={{ width, height, overflow: 'hidden' }}>
      <FlatList
        ref={ref}
        data={items}
        keyExtractor={(item) => item.value.toString()}
        getItemLayout={(_, index) => ({ length: ITEM, offset: ITEM * index, index })}
        initialScrollIndex={selectedIndex}
        onMomentumScrollEnd={onEnd}
        onScrollEndDrag={onEnd}
        snapToInterval={ITEM}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: ITEM * 2 }}
        renderItem={({ item, index }) => {
          const active = index === selectedIndex;
          return (
            <View style={{ height: ITEM, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: active ? 20 : 16, fontWeight: active ? '800' : '500', color: active ? colors.label : colors.tertiaryLabel }}>
                {renderLabel(item)}
              </Text>
            </View>
          );
        }}
      />
      <View pointerEvents="none" style={[styles.selBox, { borderColor: colors.separator, top: ITEM * 2, height: ITEM }]} />
    </View>
  );
}

export function DatePickerSheet({
  visible, onClose, value, onChange, title, minYear, maxYear,
}: {
  visible: boolean;
  onClose: () => void;
  value: string;
  onChange: (iso: string) => void;
  title?: string;
  minYear?: number;
  maxYear?: number;
}) {
  const { colors } = useThemeColors();
  const base = parseDate(value);
  const [year, setYear] = useState(base.getFullYear());
  const [month, setMonth] = useState(base.getMonth());
  const [day, setDay] = useState(base.getDate());

  useEffect(() => {
    if (visible) {
      const b = parseDate(value);
      setYear(b.getFullYear());
      setMonth(b.getMonth());
      setDay(b.getDate());
    }
  }, [visible, value]);

  const minY = minYear ?? new Date().getFullYear() - 1;
  const maxY = maxYear ?? new Date().getFullYear() + 5;
  const years = useMemo(() => Array.from({ length: maxY - minY + 1 }, (_, i) => ({ value: minY + i, label: String(minY + i) })), [minY, maxY]);
  const months = useMemo(() => MONTHS.map((m, i) => ({ value: i, label: m })), []);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => ({ value: i + 1, label: String(i + 1) })), [daysInMonth]);

  const clampDay = (d: number) => Math.min(d, daysInMonth);
  const apply = () => {
    onChange(toISODate(new Date(year, month, clampDay(day))));
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.card }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.label }]}>{title ?? 'Select date'}</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={22} color={colors.secondaryLabel} />
          </Pressable>
        </View>
        <View style={styles.columns}>
          <WheelColumn
            items={months} selectedIndex={month} width={110}
            onSelect={(i) => setMonth(i)} renderLabel={(it) => MONTHS_FULL[it.value]}
          />
          <WheelColumn
            items={days} selectedIndex={clampDay(day) - 1} width={80}
            onSelect={(i) => setDay(i + 1)} renderLabel={(it) => String(it.value)}
          />
          <WheelColumn
            items={years} selectedIndex={year - minY} width={110}
            onSelect={(i) => setYear(minY + i)} renderLabel={(it) => it.label}
          />
        </View>
        <Pressable style={[styles.doneBtn, { backgroundColor: colors.brand }]} onPress={apply}>
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 34, paddingTop: 14, paddingHorizontal: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, marginBottom: 8 },
  title: { fontSize: 17, fontWeight: '700' },
  columns: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginVertical: 4 },
  selBox: { position: 'absolute', left: 8, right: 8, borderRadius: 12, borderWidth: 1.5, backgroundColor: 'transparent' } as ViewStyle,
  doneBtn: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 10, marginHorizontal: 4 },
  doneText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
