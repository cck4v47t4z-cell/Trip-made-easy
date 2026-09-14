import React, { useEffect, useRef } from 'react';
import {
  Animated as RNAnimated, Modal, Pressable, ScrollView, StyleSheet, Text, View,
  type ViewStyle, type TextStyle, type StyleProp,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming, Easing } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { useThemeColors } from '../lib/theme';

/* ---------- color helpers ---------- */
function hexToRgb(h: string) {
  let s = h.replace('#', '');
  if (s.length === 3) s = s.split('').map((c) => c + c).join('');
  const n = parseInt(s, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}
export function mixHex(a: string, b: string, t: number) {
  const A = hexToRgb(a); const B = hexToRgb(b);
  return rgbToHex(A.r + (B.r - A.r) * t, A.g + (B.g - A.g) * t, A.b + (B.b - A.b) * t);
}

/* ---------- pure-JS gradient ---------- */
export function GradientView({
  colors, style, children, startTop = true,
}: { colors: [string, string] | string[]; style?: StyleProp<ViewStyle>; children?: React.ReactNode; startTop?: boolean }) {
  const [c1, c2] = colors as [string, string];
  const slices = 28;
  return (
    <View style={[{ overflow: 'hidden' }, style]}>
      {Array.from({ length: slices }).map((_, i) => {
        const t = startTop ? i / (slices - 1) : 1 - i / (slices - 1);
        return (
          <View
            key={i}
            pointerEvents="none"
            style={{
              position: 'absolute', left: 0, right: 0,
              top: `${(i / slices) * 100}%`,
              height: `${100 / slices + 0.8}%`,
              backgroundColor: mixHex(c1, c2, t),
            }}
          />
        );
      })}
      {children}
    </View>
  );
}

/* ---------- animated tap ---------- */
export function Tap({
  onPress, children, style, scale = 0.97, disabled, onLongPress,
}: {
  onPress?: () => void; children: React.ReactNode; style?: StyleProp<ViewStyle>;
  scale?: number; disabled?: boolean; onLongPress?: () => void;
}) {
  const s = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  const spring = { damping: 18, stiffness: 320, mass: 0.6 };
  return (
    <Animated.View style={[anim, style]}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={disabled}
        onPressIn={() => { s.value = withSpring(scale, spring); }}
        onPressOut={() => { s.value = withSpring(1, spring); }}
        style={disabled ? { opacity: 0.5 } : undefined}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

/* ---------- glass surface ---------- */
export function GlassSurface({
  children, intensity, style, radius = 18, blur = true,
}: {
  children: React.ReactNode; intensity?: number; style?: StyleProp<ViewStyle>;
  radius?: number; blur?: boolean;
}) {
  const { dark } = useThemeColors();
  return (
    <View style={[{ borderRadius: radius, overflow: 'hidden' }, style]}>
      {blur ? (
        <BlurView intensity={intensity ?? (dark ? 40 : 60)} tint={dark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      ) : null}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.42)' }]} />
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius, borderWidth: StyleSheet.hairlineWidth, borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.70)' }]} />
      {children}
    </View>
  );
}

/* ---------- card ---------- */
export function Card({
  children, style, onPress, padded = true,
}: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; padded?: boolean }) {
  return (
    <GlassSurface style={[styles.cardShadow, padded && { padding: 16 }, style]} radius={18}>
      {children}
    </GlassSurface>
  );
}

/* ---------- button ---------- */
export function Button({
  label, onPress, variant = 'primary', icon, style, textStyle, disabled, loading,
}: {
  label: string; onPress?: () => void; variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: string; style?: StyleProp<ViewStyle>; textStyle?: StyleProp<TextStyle>; disabled?: boolean; loading?: boolean;
}) {
  const { colors } = useThemeColors();
  const bg = variant === 'primary' ? colors.brand
    : variant === 'secondary' ? colors.cardSecondary
    : variant === 'danger' ? colors.red
    : 'transparent';
  const fg = variant === 'primary' || variant === 'danger' ? '#fff' : colors.label;
  return (
    <Tap onPress={onPress} disabled={disabled || loading} scale={0.98} style={{ width: '100%' }}>
      <View style={[styles.button, { backgroundColor: bg }, variant === 'secondary' && { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.separator }, style]}>
        {loading ? (
          <RNAnimated.View style={styles.spinner} />
        ) : (
          <>
            {icon ? <Ionicons name={icon as any} size={18} color={fg} style={{ marginRight: 8 }} /> : null}
            <Text style={[styles.buttonLabel, { color: fg }, textStyle]}>{label}</Text>
          </>
        )}
      </View>
    </Tap>
  );
}

/* ---------- pill / tag ---------- */
export function Pill({
  children, color, bg, icon, style,
}: { children: React.ReactNode; color?: string; bg?: string; icon?: string; style?: StyleProp<ViewStyle> }) {
  const { colors } = useThemeColors();
  return (
    <View style={[styles.pill, { backgroundColor: bg ?? colors.cardSecondary }, style]}>
      {icon ? <Ionicons name={icon as any} size={13} color={color ?? colors.secondaryLabel} style={{ marginRight: 4 }} /> : null}
      <Text style={[styles.pillText, { color: color ?? colors.secondaryLabel }]}>{children}</Text>
    </View>
  );
}

/* ---------- section title ---------- */
export function SectionTitle({ children, action, onAction }: { children: React.ReactNode; action?: string; onAction?: () => void }) {
  const { colors } = useThemeColors();
  return (
    <View style={styles.sectionRow}>
      <Text style={[styles.sectionTitle, { color: colors.label }]}>{children}</Text>
      {action ? (
        <Tap onPress={onAction}><Text style={[styles.sectionAction, { color: colors.brand }]}>{action}</Text></Tap>
      ) : null}
    </View>
  );
}

export function Hairline({ style }: { style?: StyleProp<ViewStyle> }) {
  const { colors } = useThemeColors();
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: colors.separator }, style]} />;
}

/* ---------- progress bar ---------- */
export function ProgressBar({ value, color, track, height = 8 }: { value: number; color: string; track?: string; height?: number }) {
  const w = useSharedValue(Math.max(0, Math.min(1, value)));
  useEffect(() => { w.value = withTiming(Math.max(0, Math.min(1, value)), { duration: 600, easing: Easing.out(Easing.ease) }); }, [value]);
  const { colors } = useThemeColors();
  const anim = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View style={[{ height, borderRadius: height / 2, backgroundColor: track ?? colors.cardSecondary, overflow: 'hidden' }]}>
      <Animated.View style={[{ height: '100%', borderRadius: height / 2, backgroundColor: color }, anim]} />
    </View>
  );
}

/* ---------- segmented control (scrollable pills) ---------- */
export interface SegTab { key: string; label: string; icon?: string }
export function SegmentedControl({
  tabs, value, onChange,
}: { tabs: SegTab[]; value: string; onChange: (k: string) => void }) {
  const { colors } = useThemeColors();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }}
    >
      {tabs.map((t) => {
        const active = t.key === value;
        return (
          <Tap key={t.key} onPress={() => onChange(t.key)} scale={0.95}>
            <View style={[styles.segPill, { backgroundColor: active ? colors.brand : colors.cardSecondary }]}>
              {t.icon ? <Ionicons name={t.icon as any} size={14} color={active ? '#fff' : colors.secondaryLabel} style={{ marginRight: 5 }} /> : null}
              <Text style={[styles.segPillText, { color: active ? '#fff' : colors.secondaryLabel }]}>{t.label}</Text>
            </View>
          </Tap>
        );
      })}
    </ScrollView>
  );
}

/* ---------- option sheet (bottom picker) ---------- */
export interface OptionItem { key: string; label: string; icon?: string; color?: string; rightLabel?: string }
export function OptionSheet({
  visible, onClose, title, options, selectedKey, onSelect,
}: {
  visible: boolean; onClose: () => void; title?: string; options: OptionItem[];
  selectedKey?: string; onSelect: (k: string) => void;
}) {
  const { colors, dark } = useThemeColors();
  const slide = useRef(new RNAnimated.Value(0)).current;
  useEffect(() => {
    RNAnimated.timing(slide, { toValue: visible ? 1 : 0, duration: 240, useNativeDriver: true }).start();
  }, [visible]);
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={onClose} />
        <RNAnimated.View style={[styles.sheet, { transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [400, 0] }) }] }]}>
          <BlurView intensity={dark ? 45 : 75} tint={dark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: dark ? 'rgba(28,28,30,0.42)' : 'rgba(255,255,255,0.5)' }]} />
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: StyleSheet.hairlineWidth, borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.7)' }]} />
          {title ? <Text style={[styles.sheetTitle, { color: colors.secondaryLabel }]}>{title}</Text> : null}
          <View style={[styles.sheetGrabber, { backgroundColor: colors.separator }]} />
          <ScrollView style={{ maxHeight: 420 }}>
            {options.map((o) => {
              const active = o.key === selectedKey;
              return (
                <Tap key={o.key} onPress={() => { onSelect(o.key); onClose(); }} scale={0.99}>
                  <View style={[styles.sheetRow, { borderBottomColor: colors.separator }]}>
                    {o.icon ? (
                      <View style={[styles.sheetRowIcon, { backgroundColor: o.color ?? colors.cardSecondary }]}>
                        <Ionicons name={o.icon as any} size={18} color="#fff" />
                      </View>
                    ) : null}
                    <Text style={[styles.sheetRowLabel, { color: colors.label, flex: 1 }]}>{o.label}</Text>
                    {o.rightLabel ? <Text style={{ color: colors.secondaryLabel, fontSize: 14, marginRight: 8 }}>{o.rightLabel}</Text> : null}
                    {active ? <Ionicons name="checkmark" size={20} color={colors.brand} /> : null}
                  </View>
                </Tap>
              );
            })}
            <View style={{ height: 12 }} />
          </ScrollView>
        </RNAnimated.View>
      </View>
    </Modal>
  );
}

/* ---------- large title header ---------- */
export function LargeTitle({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  const { colors } = useThemeColors();
  return (
    <View style={styles.largeTitleWrap}>
      <View style={{ flex: 1 }}>
        {subtitle ? <Text style={[styles.largeTitleSub, { color: colors.secondaryLabel }]}>{subtitle}</Text> : null}
        <Text style={[styles.largeTitle, { color: colors.label }]}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, overflow: 'hidden' },
  cardShadow: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  button: { height: 52, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  buttonLabel: { fontSize: 16, fontWeight: '700' },
  spinner: { width: 22, height: 22, borderRadius: 11, borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.4)', borderTopColor: '#fff' },
  pill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, alignSelf: 'flex-start' },
  pillText: { fontSize: 12.5, fontWeight: '600' },
  sectionRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  sectionAction: { fontSize: 15, fontWeight: '600' },
  segPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 22 },
  segPillText: { fontSize: 13.5, fontWeight: '700' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 28, paddingTop: 6, paddingHorizontal: 8, overflow: 'hidden' },
  sheetTitle: { fontSize: 13, fontWeight: '600', textAlign: 'center', paddingVertical: 4, letterSpacing: 0.2 },
  sheetGrabber: { width: 36, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 10 },
  sheetRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  sheetRowIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  sheetRowLabel: { fontSize: 16, fontWeight: '500' },
  largeTitleWrap: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  largeTitle: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  largeTitleSub: { fontSize: 13, fontWeight: '700', letterSpacing: 0.4, marginBottom: 2, textTransform: 'uppercase' },
});
