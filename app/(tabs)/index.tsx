import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductCard } from '../../src/components/ProductCard';
import { RadiusControl } from '../../src/components/RadiusControl';
import { Chip, Empty } from '../../src/components/ui';
import { CATEGORIES } from '../../src/data/products';
import { STORE_TYPE_LABEL, type Category, type StoreType } from '../../src/data/stores';
import { formatDistance, milesToKm } from '../../src/lib/geo';
import { buildListings, type ProductListing } from '../../src/lib/inventory';
import { isOpenNow } from '../../src/lib/pickup';
import { useApp } from '../../src/state/AppState';
import { useSearch } from '../../src/state/Search';
import { colors, DOCK_SPACE, radius, space, type } from '../../src/theme';

const STORE_TYPES = Object.keys(STORE_TYPE_LABEL) as StoreType[];

/** Range "levels" — LocalPick's version of GOAT's floor switcher. Each stop shows how much is on shelves within it. */
const LEVELS_MI = [1, 3, 5, 10, 25, 40];
const MAX_MI = 40;

const CATEGORY_ICON: Record<Category | 'All', string> = {
  All: '🛍️',
  Tech: '📱',
  Fashion: '🧥',
  Beauty: '💄',
  Home: '🪔',
  Outdoors: '⛺',
  Gifts: '🎁',
};

export default function Discover() {
  const { place, radiusMi, unit, setRadiusMi } = useApp();
  const { query } = useSearch();
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<Category | 'All'>('All');
  const [storeType, setStoreType] = useState<StoreType | 'all'>('all');
  const [openNow, setOpenNow] = useState(false);
  const [withPerk, setWithPerk] = useState(false);
  const [columns, setColumns] = useState<2 | 3>(2);
  const [showRadius, setShowRadius] = useState(false);

  // Every filter except distance, applied once at the widest range so the level counts come for free.
  const pool = useMemo<ProductListing[]>(() => {
    const q = query.trim().toLowerCase();
    return buildListings(place.coord, MAX_MI, { storeType })
      .filter(
        (l) =>
          (category === 'All' || l.product.category === category) &&
          (!withPerk || !!l.product.pickupPerk) &&
          (!q || `${l.product.name} ${l.product.brand} ${l.product.category}`.toLowerCase().includes(q)),
      )
      .map((l) => (openNow ? { ...l, inRadius: l.inRadius.filter((a) => isOpenNow(a.store.hours)) } : l));
  }, [place, storeType, category, withPerk, openNow, query]);

  const within = (mi: number) =>
    pool.map((l) => ({ ...l, inRadius: l.inRadius.filter((a) => a.distanceMi <= mi) })).filter((l) => l.inRadius.length > 0);

  const available = useMemo(() => within(radiusMi), [pool, radiusMi]);
  const levelCounts = useMemo(() => LEVELS_MI.map((mi) => within(mi).length), [pool]);

  const beyond = pool.filter((l) => !l.inRadius.some((a) => a.distanceMi <= radiusMi) && l.nearestAnywhere);
  const nextReach = beyond.length ? Math.min(...beyond.map((l) => l.nearestAnywhere!.distanceMi)) : undefined;

  const levelValue = (mi: number) => (unit === 'km' ? String(Math.round(milesToKm(mi))) : String(mi));

  const header = (
    <View style={{ paddingTop: insets.top + 8 }}>
      <View style={styles.pad}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Pick up near ${place.label}. Change area`} onPress={() => router.push('/profile')} style={styles.placeRow}>
          <Text style={type.small}>Pick up near</Text>
          <Text style={styles.place}>{place.label}</Text>
          <Ionicons name="chevron-down" size={14} color={colors.muted} />
        </Pressable>
        <Text style={styles.title}>Shop it online.{'\n'}Go get it in person.</Text>
      </View>

      {/* Range levels */}
      <View style={styles.pad}>
        <View style={styles.rangeHead}>
          <Text style={styles.rangeLabel}>Within {formatDistance(radiusMi, unit)}</Text>
          <Pressable testID="radius-toggle" accessibilityRole="button" onPress={() => setShowRadius((v) => !v)} hitSlop={8}>
            <Text style={styles.rangeHint}>{showRadius ? 'Done' : 'Fine-tune'}</Text>
          </Pressable>
        </View>
        <View style={styles.levels} accessibilityRole="radiogroup" accessibilityLabel="Pickup range">
          {LEVELS_MI.map((mi, i) => {
            const on = radiusMi === mi;
            return (
              <Pressable
                key={mi}
                testID={`level-${mi}`}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                accessibilityLabel={`${formatDistance(mi, unit)}, ${levelCounts[i]} items`}
                onPress={() => setRadiusMi(mi)}
                style={[styles.level, on && styles.levelOn]}
              >
                <Text style={[styles.levelValue, on && styles.levelOnText]}>{levelValue(mi)}</Text>
                <Text style={[styles.levelUnit, on && styles.levelOnText]}>{unit}</Text>
                <Text style={[styles.levelCount, on && styles.levelOnText]}>{levelCounts[i]} items</Text>
              </Pressable>
            );
          })}
        </View>
        {showRadius ? (
          <View style={styles.radiusPanel}>
            <RadiusControl radiusMi={radiusMi} unit={unit} onChange={setRadiusMi} />
          </View>
        ) : null}
      </View>

      {/* Category row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cats}>
        {(['All', ...CATEGORIES] as const).map((c) => {
          const on = category === c;
          return (
            <Pressable key={c} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => setCategory(c)} style={styles.cat}>
              <View style={[styles.catIcon, on && styles.catIconOn]}>
                <Text style={{ fontSize: 24 }}>{CATEGORY_ICON[c]}</Text>
              </View>
              <Text style={[styles.catText, on && styles.catTextOn]}>{c}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Structural filters (square) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip shape="square" label="Any store" selected={storeType === 'all'} onPress={() => setStoreType('all')} />
        {STORE_TYPES.map((t) => (
          <Chip key={t} shape="square" label={STORE_TYPE_LABEL[t]} selected={storeType === t} onPress={() => setStoreType(t)} />
        ))}
      </ScrollView>
      {/* Quick toggles (round) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.chips, { paddingTop: 0 }]}>
        <Chip testID="filter-open" icon="time-outline" label="Open now" selected={openNow} onPress={() => setOpenNow((v) => !v)} />
        <Chip testID="filter-perk" icon="sparkles-outline" label="Pickup perk" selected={withPerk} onPress={() => setWithPerk((v) => !v)} />
      </ScrollView>

      <View style={[styles.pad, styles.countRow]}>
        <Text style={styles.count}>
          {available.length} {available.length === 1 ? 'item' : 'items'} ready for pickup nearby
        </Text>
        <View style={styles.density} accessibilityRole="radiogroup" accessibilityLabel="Grid size">
          {([2, 3] as const).map((n) => (
            <Pressable
              key={n}
              testID={`grid-${n}`}
              accessibilityRole="radio"
              accessibilityState={{ selected: columns === n }}
              accessibilityLabel={`${n} per row`}
              onPress={() => setColumns(n)}
              style={[styles.densityBtn, columns === n && styles.densityOn]}
            >
              <Text style={[styles.densityText, columns === n && { color: colors.onAccent }]}>{n}×</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );

  const footer =
    nextReach !== undefined ? (
      <Pressable
        testID="extend-radius"
        accessibilityRole="button"
        onPress={() => setRadiusMi(Math.min(MAX_MI, Math.ceil(nextReach)))}
        style={styles.extend}
      >
        <Ionicons name="add-circle-outline" size={20} color={colors.ink} />
        <Text style={styles.extendText}>
          {beyond.length} more {beyond.length === 1 ? 'item is' : 'items are'} just beyond your range. Extend to {formatDistance(Math.min(MAX_MI, Math.ceil(nextReach)), unit)}
        </Text>
      </Pressable>
    ) : null;

  return (
    <FlatList
      key={`grid-${columns}`}
      testID="discover-list"
      data={available}
      keyExtractor={(l) => l.product.id}
      numColumns={columns}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
      ListEmptyComponent={
        <Empty icon="storefront-outline" title="Nothing on the shelves nearby" body="Try a wider pickup range or a different store type." />
      }
      columnWrapperStyle={{ gap: columns === 3 ? space.sm : space.md, paddingHorizontal: space.lg }}
      contentContainerStyle={{ gap: columns === 3 ? space.md : space.xl, paddingBottom: DOCK_SPACE + insets.bottom + 16 }}
      renderItem={({ item }) => (
        <View style={{ flex: 1 / columns }}>
          <ProductCard listing={item} unit={unit} dense={columns === 3} />
        </View>
      )}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: space.lg },
  placeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  place: { fontSize: 13, fontWeight: '700', color: colors.ink },
  title: { ...type.title, fontSize: 34, lineHeight: 36, letterSpacing: -1.2, marginTop: 14, marginBottom: 22 },
  rangeHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 },
  rangeLabel: { fontSize: 15, fontWeight: '700', color: colors.ink },
  rangeHint: { fontSize: 13, fontWeight: '700', color: colors.muted, textDecorationLine: 'underline' },
  levels: { flexDirection: 'row', gap: 6 },
  level: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  levelOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  levelValue: { fontSize: 20, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },
  levelUnit: { fontSize: 11, color: colors.muted, marginTop: -2 },
  levelCount: { fontSize: 10, fontWeight: '700', color: colors.green, marginTop: 6 },
  levelOnText: { color: colors.onAccent },
  radiusPanel: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 12, marginTop: 8 },
  cats: { paddingHorizontal: space.lg, paddingTop: 22, paddingBottom: 6, gap: 14 },
  cat: { alignItems: 'center', width: 58 },
  catIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  catIconOn: { borderColor: colors.ink, borderWidth: 2 },
  catText: { fontSize: 12, color: colors.muted, marginTop: 6 },
  catTextOn: { color: colors.ink, fontWeight: '700' },
  chips: { paddingHorizontal: space.lg, paddingVertical: 10 },
  countRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, marginBottom: 0 },
  count: { fontSize: 13, color: colors.muted, flexShrink: 1 },
  density: { flexDirection: 'row', gap: 4 },
  densityBtn: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  densityOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  densityText: { fontSize: 12, fontWeight: '800', color: colors.ink },
  extend: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: space.lg, marginTop: 8, padding: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed' },
  extendText: { flex: 1, fontSize: 13, color: colors.ink, fontWeight: '600' },
});
