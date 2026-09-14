import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tap } from './primitives';
import { useThemeColors } from '../lib/theme';

export function EmptyState({
  icon, title, subtitle, actionLabel, onAction,
}: {
  icon: string; title: string; subtitle?: string; actionLabel?: string; onAction?: () => void;
}) {
  const { colors } = useThemeColors();
  return (
    <View style={styles.wrap}>
      <View style={[styles.iconWrap, { backgroundColor: colors.cardSecondary }]}>
        <Ionicons name={icon as any} size={30} color={colors.tertiaryLabel} />
      </View>
      <Text style={[styles.title, { color: colors.label }]}>{title}</Text>
      {subtitle ? <Text style={[styles.sub, { color: colors.secondaryLabel }]}>{subtitle}</Text> : null}
      {actionLabel && onAction ? (
        <Tap onPress={onAction} style={{ marginTop: 14 }}>
          <View style={[styles.btn, { backgroundColor: colors.brand }]}>
            <Text style={styles.btnText}>{actionLabel}</Text>
          </View>
        </Tap>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32 },
  iconWrap: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', textAlign: 'center', letterSpacing: -0.2 },
  sub: { fontSize: 14.5, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  btn: { paddingHorizontal: 20, paddingVertical: 11, borderRadius: 20 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
