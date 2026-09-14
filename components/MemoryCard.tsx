import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Memory, Member } from '../lib/types';
import { useThemeColors } from '../lib/theme';
import { formatDateShort } from '../lib/format';
import { Tap } from './primitives';
import { Avatar } from './Avatar';

function ScrimBottom() {
  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => (
        <View
          key={i}
          pointerEvents="none"
          style={{
            position: 'absolute', left: 0, right: 0, bottom: `${(i / 12) * 100}%`,
            height: `${100 / 12 + 0.8}%`,
            backgroundColor: `rgba(0,0,0,${0.6 * (1 - i / 12)})`,
          }}
        />
      ))}
    </>
  );
}

export function MemoryCard({
  memory, members, onPress, onToggleFavorite,
}: {
  memory: Memory; members: Member[]; onPress?: () => void; onToggleFavorite?: () => void;
}) {
  const { colors } = useThemeColors();
  const author = members.find((m) => m.id === memory.authorId);
  const tagged = memory.taggedMemberIds.map((id) => members.find((m) => m.id === id)).filter(Boolean) as Member[];
  const date = formatDateShort(memory.date.split('T')[0] ?? memory.date);

  if (memory.type === 'note' || (memory.type === 'location' && !memory.uri)) {
    return (
      <Tap onPress={onPress} disabled={!onPress} style={{ paddingHorizontal: 16, marginBottom: 12 }} scale={0.99}>
        <View style={[styles.noteCard, { backgroundColor: colors.card }]}>
          <View style={styles.noteHead}>
            <Ionicons name={memory.type === 'location' ? 'location' : 'chatbubble-ellipses'} size={16} color={colors.brand} />
            <Text style={[styles.noteMeta, { color: colors.secondaryLabel }]}>
              {author?.name ?? 'You'} · {date}{memory.locationName ? ` · ${memory.locationName}` : ''}
            </Text>
            {onToggleFavorite ? (
              <Tap onPress={onToggleFavorite} scale={0.8}>
                <Ionicons name={memory.isFavorite ? 'heart' : 'heart-outline'} size={20} color={memory.isFavorite ? colors.brandWarm : colors.tertiaryLabel} />
              </Tap>
            ) : null}
          </View>
          <Text style={[styles.noteText, { color: colors.label }]}>{memory.text ?? memory.caption ?? ''}</Text>
        </View>
      </Tap>
    );
  }

  // photo / video
  return (
    <Tap onPress={onPress} disabled={!onPress} style={{ paddingHorizontal: 16, marginBottom: 16 }} scale={0.99}>
      <View style={[styles.mediaCard, { backgroundColor: colors.card }]}>
        <View style={styles.imageWrap}>
          <Image
            source={memory.uri}
            style={styles.image}
            contentFit="cover"
            transition={200}
            placeholder={colors.cardSecondary}
          />
          <ScrimBottom />
          {memory.type === 'video' ? (
            <View style={styles.playBadge}>
              <Ionicons name="play" size={18} color="#fff" />
            </View>
          ) : null}
          <View style={styles.mediaTopRow}>
            <View style={styles.datePill}>
              <Text style={styles.datePillText}>{date}</Text>
            </View>
            {onToggleFavorite ? (
              <Tap onPress={onToggleFavorite} scale={0.8}>
                <View style={styles.heartCircle}>
                  <Ionicons name={memory.isFavorite ? 'heart' : 'heart-outline'} size={17} color={memory.isFavorite ? '#FF6B4A' : '#fff'} />
                </View>
              </Tap>
            ) : null}
          </View>
          {(memory.caption || memory.locationName) ? (
            <View style={styles.captionWrap}>
              {memory.locationName ? (
                <View style={styles.locChip}>
                  <Ionicons name="location" size={11} color="#fff" />
                  <Text style={styles.locChipText} numberOfLines={1}>{memory.locationName}</Text>
                </View>
              ) : null}
              {memory.caption ? (
                <Text style={styles.caption} numberOfLines={2}>{memory.caption}</Text>
              ) : null}
            </View>
          ) : null}
        </View>
        <View style={styles.mediaFooter}>
          <View style={styles.authorRow}>
            <Avatar member={author ?? members[0]} size={24} />
            <Text style={[styles.authorName, { color: colors.secondaryLabel }]}>{author?.name ?? 'You'}</Text>
          </View>
          {tagged.length > 0 ? (
            <View style={styles.taggedRow}>
              <Ionicons name="people" size={12} color={colors.tertiaryLabel} />
              <Text style={[styles.taggedText, { color: colors.tertiaryLabel }]} numberOfLines={1}>
                {tagged.map((m) => m.name).join(', ')}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Tap>
  );
}

const styles = StyleSheet.create({
  noteCard: { borderRadius: 18, padding: 14 },
  noteHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  noteMeta: { fontSize: 12.5, fontWeight: '600', marginLeft: 6, flex: 1 },
  noteText: { fontSize: 15.5, lineHeight: 22, fontWeight: '500' },
  mediaCard: { borderRadius: 20, overflow: 'hidden', paddingBottom: 10 },
  imageWrap: { aspectRatio: 4 / 3, position: 'relative' },
  image: { width: '100%', height: '100%' },
  playBadge: { position: 'absolute', top: '50%', left: '50%', marginLeft: -22, marginTop: -22, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  mediaTopRow: { position: 'absolute', top: 10, left: 10, right: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  datePill: { backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 12 },
  datePillText: { color: '#fff', fontSize: 11.5, fontWeight: '700' },
  heartCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  captionWrap: { position: 'absolute', left: 12, right: 12, bottom: 12 },
  locChip: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, marginBottom: 6 },
  locChipText: { color: '#fff', fontSize: 11.5, fontWeight: '700', marginLeft: 4 },
  caption: { color: '#fff', fontSize: 14.5, fontWeight: '700', letterSpacing: -0.1, textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  mediaFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 10 },
  authorRow: { flexDirection: 'row', alignItems: 'center' },
  authorName: { fontSize: 13, fontWeight: '600', marginLeft: 7 },
  taggedRow: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end', marginLeft: 8 },
  taggedText: { fontSize: 12, fontWeight: '600', marginLeft: 4 },
});
