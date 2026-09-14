import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors } from '../lib/theme';
import { Tap } from './primitives';

export function ScreenShell({
  children, edges = ['top', 'bottom', 'left', 'right'], style,
}: {
  children: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  style?: ViewStyle;
}) {
  const { colors, dark } = useThemeColors();
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: colors.background, ...style }}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={[ambient.blob, ambient.blobA, dark ? ambient.blobAdark : ambient.blobAlight]} />
        <View style={[ambient.blob, ambient.blobB, dark ? ambient.blobBdark : ambient.blobBlight]} />
        <View style={[ambient.blob, ambient.blobC, dark ? ambient.blobCdark : ambient.blobClight]} />
      </View>
      {children}
    </SafeAreaView>
  );
}

export function NavHeader({
  title, subtitle, onBack, right, backIcon = 'chevron-back', large = false, rightLabel, onRight,
}: {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  backIcon?: string;
  large?: boolean;
  rightLabel?: string;
  onRight?: () => void;
}) {
  const { colors, dark } = useThemeColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top + 6 }}>
      <BlurView intensity={dark ? 30 : 50} tint={dark ? 'dark' : 'light'} style={styles.headerGlass}>
        <View style={styles.row}>
        {onBack ? (
          <Tap onPress={onBack} scale={0.9}>
            <View style={styles.backBtn}>
              <Ionicons name={backIcon as any} size={24} color={colors.brand} />
            </View>
          </Tap>
        ) : <View style={{ width: 44 }} />}
        <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 8 }}>
          {subtitle ? <Text style={[styles.subtitle, { color: colors.secondaryLabel }]} numberOfLines={1}>{subtitle}</Text> : null}
          {title ? (
            <Text style={[large ? styles.largeTitle : styles.title, { color: colors.label }]} numberOfLines={1}>{title}</Text>
          ) : null}
        </View>
        {rightLabel && onRight ? (
          <Tap onPress={onRight} scale={0.9}>
            <View style={styles.rightBtn}>
              <Text style={[styles.rightText, { color: colors.brand }]}>{rightLabel}</Text>
            </View>
          </Tap>
        ) : right ?? <View style={{ width: 44 }} />}
        </View>
      </BlurView>
    </View>
  );
}

export function CloseButton({ onClose }: { onClose: () => void }) {
  const { colors } = useThemeColors();
  return (
    <Tap onPress={onClose} scale={0.9}>
      <View style={[styles.backBtn, { backgroundColor: colors.cardSecondary }]}>
        <Ionicons name="close" size={18} color={colors.secondaryLabel} />
      </View>
    </Tap>
  );
}

const ambient = StyleSheet.create({
  blob: { position: 'absolute', borderRadius: 9999 },
  blobA: { top: -110, left: -70, width: 300, height: 300 },
  blobAlight: { backgroundColor: 'rgba(59,111,246,0.16)' },
  blobAdark: { backgroundColor: 'rgba(91,133,255,0.26)' },
  blobB: { top: 60, right: -90, width: 320, height: 320 },
  blobBlight: { backgroundColor: 'rgba(255,107,74,0.14)' },
  blobBdark: { backgroundColor: 'rgba(255,129,99,0.20)' },
  blobC: { bottom: -120, left: 40, width: 340, height: 340 },
  blobClight: { backgroundColor: 'rgba(155,107,255,0.12)' },
  blobCdark: { backgroundColor: 'rgba(155,107,255,0.22)' },
});

const styles = StyleSheet.create({
  headerGlass: { borderBottomLeftRadius: 22, borderBottomRightRadius: 22, overflow: 'hidden', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(150,150,160,0.18)' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingBottom: 8, minHeight: 44 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  rightBtn: { paddingHorizontal: 12, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  rightText: { fontSize: 16, fontWeight: '700' },
  title: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  largeTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.6 },
  subtitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 1 },
});
