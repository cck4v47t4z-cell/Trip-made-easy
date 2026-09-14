import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import type { Member } from '../lib/types';

function initials(name: string): string {
  return name.split(' ').filter(Boolean).map((s) => s[0]).slice(0, 2).join('').toUpperCase();
}

export function Avatar({ member, size = 40, border }: { member: Member; size?: number; border?: boolean }) {
  if (member.avatarUri) {
    return (
      <Image
        source={member.avatarUri}
        style={[{ width: size, height: size, borderRadius: size / 2 }, border && { borderWidth: 2, borderColor: '#fff' }]}
        contentFit="cover"
        transition={150}
      />
    );
  }
  return (
    <View
      style={[
        { width: size, height: size, borderRadius: size / 2, backgroundColor: member.avatarColor },
        styles.center, border && { borderWidth: 2, borderColor: '#fff' },
      ]}
    >
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.38 }}>{initials(member.name)}</Text>
    </View>
  );
}

export function AvatarGroup({
  members, size = 30, max = 4, overlap = 11,
}: { members: Member[]; size?: number; max?: number; overlap?: number }) {
  const shown = members.slice(0, max);
  const extra = members.length - shown.length;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {shown.map((m, i) => (
        <View key={m.id} style={{ marginLeft: i === 0 ? 0 : -overlap, zIndex: shown.length - i }}>
          <Avatar member={m} size={size} border />
        </View>
      ))}
      {extra > 0 ? (
        <View
          style={[
            { marginLeft: -overlap, width: size, height: size, borderRadius: size / 2, backgroundColor: 'rgba(120,120,128,0.92)' },
            styles.center, { borderWidth: 2, borderColor: '#fff' },
          ]}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.32 }}>+{extra}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({ center: { alignItems: 'center', justifyContent: 'center' } });
