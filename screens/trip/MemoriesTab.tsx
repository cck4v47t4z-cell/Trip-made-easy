import { useMemo, useState } from 'react';
import { Modal, SectionList, StyleSheet, Text, View, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../../lib/store';
import { useThemeColors } from '../../lib/theme';
import { formatDateFull, timeAgo } from '../../lib/format';
import type { Memory, Trip } from '../../lib/types';
import { Tap, Pill } from '../../components/primitives';
import { MemoryCard } from '../../components/MemoryCard';
import { EmptyState } from '../../components/EmptyState';
import Ionicons from '@expo/vector-icons/Ionicons';

export function MemoriesTab({ trip }: { trip: Trip }) {
  const { colors } = useThemeColors();
  const { tripMemories, toggleFavorite } = useStore();
  const navigation = useNavigation<any>();
  const [favOnly, setFavOnly] = useState(false);
  const [lightbox, setLightbox] = useState<Memory | null>(null);

  const all = tripMemories(trip.id);
  const memories = favOnly ? all.filter((m) => m.isFavorite) : all;
  const photoCount = all.filter((m) => m.type === 'photo' || m.type === 'video').length;

  const sections = useMemo(() => {
    const map = new Map<string, Memory[]>();
    for (const m of memories) {
      const key = (m.date.split('T')[0] ?? m.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, items]) => ({ date, data: items }));
  }, [memories]);

  if (all.length === 0) {
    return (
      <EmptyState
        icon="images"
        title="No memories yet"
        subtitle="Capture photos, notes and favourite moments to build your travel diary."
        actionLabel="Add a memory"
        onAction={() => navigation.navigate('AddMemory', { tripId: trip.id })}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.filterRow}>
        <Pill icon="images" color={colors.secondaryLabel}>{photoCount} photos</Pill>
        <Tap onPress={() => setFavOnly((v) => !v)} scale={0.95}>
          <View style={[styles.favPill, { backgroundColor: favOnly ? colors.brandWarm : colors.cardSecondary }]}>
            <Ionicons name={favOnly ? 'heart' : 'heart-outline'} size={14} color={favOnly ? '#fff' : colors.secondaryLabel} />
            <Text style={[styles.favPillText, { color: favOnly ? '#fff' : colors.secondaryLabel }]}>Favourites</Text>
          </View>
        </Tap>
      </View>

      <SectionList
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        stickySectionHeadersEnabled={false}
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionDate, { color: colors.label }]}>{formatDateFull(section.date)}</Text>
            <Text style={[styles.sectionCount, { color: colors.tertiaryLabel }]}>{section.data.length} moment{section.data.length === 1 ? '' : 's'}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <MemoryCard
            memory={item}
            members={trip.members}
            onPress={(item.type === 'photo' || item.type === 'video') ? () => setLightbox(item) : undefined}
            onToggleFavorite={() => toggleFavorite(trip.id, item.id)}
          />
        )}
        ListEmptyComponent={
          <EmptyState icon="heart-outline" title="No favourites yet" subtitle="Tap the heart on a memory to save it here." />
        }
      />

      <Modal visible={!!lightbox} transparent animationType="fade" onRequestClose={() => setLightbox(null)}>
        {lightbox ? <Lightbox memory={lightbox} members={trip.members} onClose={() => setLightbox(null)} onFav={() => toggleFavorite(trip.id, lightbox.id)} /> : null}
      </Modal>
    </View>
  );
}

function Lightbox({ memory, members, onClose, onFav }: { memory: Memory; members: Trip['members']; onClose: () => void; onFav: () => void }) {
  const { colors } = useThemeColors();
  const author = members.find((m) => m.id === memory.authorId);
  const W = Dimensions.get('window').width;
  return (
    <View style={styles.lbWrap}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={styles.lbTop}>
        <Pressable onPress={onClose} hitSlop={12}>
          <Ionicons name="close" size={26} color="#fff" />
        </Pressable>
        <Pressable onPress={onFav} hitSlop={12}>
          <Ionicons name={memory.isFavorite ? 'heart' : 'heart-outline'} size={24} color={memory.isFavorite ? '#FF6B4A' : '#fff'} />
        </Pressable>
      </View>
      {memory.uri ? (
        <Image source={memory.uri} style={{ width: W, height: W * 0.95 }} contentFit="contain" />
      ) : null}
      <View style={styles.lbCaption}>
        {memory.caption ? <Text style={styles.lbCaptionText}>{memory.caption}</Text> : null}
        <Text style={styles.lbMeta}>{author?.name ?? 'You'} · {timeAgo(memory.date)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 4 },
  favPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, paddingVertical: 7, borderRadius: 20, gap: 5 },
  favPillText: { fontSize: 13, fontWeight: '700' },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  sectionDate: { fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
  sectionCount: { fontSize: 13, fontWeight: '600' },
  lbWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  lbTop: { position: 'absolute', top: 56, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', zIndex: 2 },
  lbCaption: { marginTop: 16, paddingHorizontal: 24 },
  lbCaptionText: { color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  lbMeta: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600', textAlign: 'center' },
});
