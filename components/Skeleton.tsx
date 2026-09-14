import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { useThemeColors } from '../lib/theme';

export function Skeleton({
  width, height, radius = 12, style,
}: { width?: number | string; height?: number | string; radius?: number; style?: any }) {
  const { colors } = useThemeColors();
  const op = useRef(new Animated.Value(0.35)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(op, { toValue: 0.7, duration: 700, useNativeDriver: true }),
        Animated.timing(op, { toValue: 0.35, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [op]);
  return (
    <Animated.View
      style={[{ width, height, borderRadius: radius, backgroundColor: colors.cardSecondary, opacity: op }, style]}
    />
  );
}

export function TripCardSkeleton() {
  return (
    <View style={{ paddingHorizontal: 16, gap: 14, marginBottom: 16 }}>
      <Skeleton width={'100%'} height={150} radius={18} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Skeleton width={140} height={18} />
        <Skeleton width={90} height={18} />
      </View>
      <Skeleton width={'100%'} height={70} radius={16} />
    </View>
  );
}
