import { StyleSheet, Text, TextInput, View, type ViewStyle, type TextStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors } from '../lib/theme';
import { Tap, Hairline } from './primitives';

export function GroupCard({
  header, children, style,
}: { header?: string; children: React.ReactNode; style?: ViewStyle }) {
  const { colors } = useThemeColors();
  return (
    <View style={[{ paddingHorizontal: 16 }, style]}>
      {header ? <Text style={[styles.groupHeader, { color: colors.secondaryLabel }]}>{header}</Text> : null}
      <View style={[styles.card, { backgroundColor: colors.card }]}>{children}</View>
    </View>
  );
}

export function Row({
  label, value, icon, iconColor, onPress, right, last, danger, chevron = true,
}: {
  label: string; value?: string; icon?: string; iconColor?: string;
  onPress?: () => void; right?: React.ReactNode; last?: boolean;
  danger?: boolean; chevron?: boolean;
}) {
  const { colors } = useThemeColors();
  const content = (
    <View style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator }]}>
      {icon ? (
        <View style={[styles.rowIcon, { backgroundColor: iconColor ?? colors.cardSecondary }]}>
          <Ionicons name={icon as any} size={16} color="#fff" />
        </View>
      ) : null}
      <Text style={[styles.rowLabel, { color: danger ? colors.red : colors.label }, icon ? { marginLeft: 12 } : {}]}>{label}</Text>
      <View style={{ flex: 1 }} />
      {value ? <Text style={[styles.rowValue, { color: colors.secondaryLabel }]} numberOfLines={1}>{value}</Text> : null}
      {right}
      {onPress && chevron ? <Ionicons name="chevron-forward" size={16} color={colors.tertiaryLabel} style={{ marginLeft: 6 }} /> : null}
    </View>
  );
  if (onPress) {
    return <Tap onPress={onPress} scale={0.995}>{content}</Tap>;
  }
  return content;
}

export function TextField({
  value, onChange, placeholder, keyboardType = 'default', multiline = false, autoFocus, maxLength, style,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  multiline?: boolean; autoFocus?: boolean; maxLength?: number; style?: TextStyle;
}) {
  const { colors } = useThemeColors();
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={colors.tertiaryLabel}
      keyboardType={keyboardType}
      multiline={multiline}
      autoFocus={autoFocus}
      maxLength={maxLength}
      style={[styles.field, { color: colors.label }, style]}
    />
  );
}

export function LabeledField({
  label, children, last,
}: { label: string; children: React.ReactNode; last?: boolean }) {
  const { colors } = useThemeColors();
  return (
    <View style={[styles.labeled, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator }]}>
      <Text style={[styles.labeledLabel, { color: colors.secondaryLabel }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  groupHeader: { fontSize: 13, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4, marginTop: 18 },
  card: { borderRadius: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 50, paddingHorizontal: 16 },
  rowIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 16, fontWeight: '500', flexShrink: 1 },
  rowValue: { fontSize: 16, fontWeight: '500', marginLeft: 10 },
  field: { fontSize: 16, fontWeight: '500', paddingVertical: 14, paddingHorizontal: 16, minHeight: 50 },
  labeled: { paddingHorizontal: 16, paddingVertical: 10 },
  labeledLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2, textTransform: 'uppercase', marginBottom: 4 },
});
