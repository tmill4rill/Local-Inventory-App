import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductCard } from '../../src/components/ProductCard';
import { RadiusControl } from '../../src/components/RadiusControl';
import { Chip, Empty, Headline } from '../../src/components/ui';
import { CATEGORIES } from '../../src/data/products';
import { STORE_TYPE_LABEL, type Category, type StoreType } from '../../src/data/stores';
import { formatDistance, milesToKm } from '../../src/lib/geo';
import { buildListings, type ProductListing } from '../../src/lib/inventory';
import { isOpenNow } from '../../src/lib/pickup';
import { useApp } from '../../src/state/AppState';
import { colors, TABBAR_SPACE, radius, space, type } from '../../src/theme';

const STORE_TYPES = Object.keys(STORE_TYPE_LABEL) as StoreType[];

/** Range levels: each stop shows how much is on shelves within it. */
const LEVELS_MI = [1, 3, 5, 10, 25, 40];
const MAX_MI = 40;

export default function Shop() {
  const { place, radiusMi, unit, setRadiusMi, cartCount } = useApp();
  const [query, setQuery] = useState('');
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
      <View style={[styles.pad, styles.topRow]}>
        <View style={styles.search}>
          <Ionicons name="search" size={17} color={colors.muted} />
          <TextInput
            testID="search-input"
            value={query}
            onChangeText={setQuery}
            placeholder="Search brands, pieces, colors"
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
            returnKeyType="search"
            accessibilityLabel="Search nearby inventory"
          />
          {query ? (
            <Pressable accessibilityLabel="Clear search" onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>
        <Pressable testID="shop-bag" accessibilityRole="button" accessibilityLabel={`Bag, ${cartCount} items`} onPress={() => router.push('/cart')} style={styles.iconBtn}>
          <Ionicons name="bag-outline" size={20} color={colors.ink} />
          {cartCount ? (
            <View style={styles.bagCount}>
              <Text style={styles.bagCountText}>{cartCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>
      <View style={styles.pad}>
        <Headline before={'Shop it online.\nGo get it '} accent="in person." style={styles.title} />
        <Pressable accessibilityRole="button" accessibilityLabel={`Pick up near ${place.label}. Change area`} onPress={() => router.push('/profile')} style={styles.placeRow}>
          <Text style={type.small}>Pick up near</Text>
          <Text style={styles.place}>{place.label}</Text>
          <Ionicons name="chevron-down" size={13} color={colors.muted} />
          <Text style={type.small}> · </Text>
          <Text testID="all-stores" onPress={() => router.push('/stores')} style={styles.storesLink}>All stores</Text>
        </Pressable>
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
        {(['All', ...CATEGORIES] as const).map((c) => (
          <Chip key={c} testID={`cat-${c}`} label={c} selected={category === c} onPress={() => setCategory(c)} />
        ))}
      </ScrollView>

      {/* Store type */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="Any store" selected={storeType === 'all'} onPress={() => setStoreType('all')} />
        {STORE_TYPES.map((t) => (
          <Chip key={t} label={STORE_TYPE_LABEL[t]} selected={storeType === t} onPress={() => setStoreType(t)} />
        ))}
      </ScrollView>
      {/* Quick toggles */}
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
        <Empty icon="storefront-outline" title="Nothing on the shelves nearby" body="Try a wider pickup range, a different store type, or another search." />
      }
      columnWrapperStyle={{ gap: columns === 3 ? 6 : 10, paddingHorizontal: space.lg }}
      contentContainerStyle={{ gap: columns === 3 ? 14 : 22, paddingBottom: TABBAR_SPACE + insets.bottom + 16 }}
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
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  search: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: radius.pill, paddingHorizontal: 14, backgroundColor: colors.raised },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 15, color: colors.ink },
  iconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.raised, alignItems: 'center', justifyContent: 'center' },
  bagCount: { position: 'absolute', top: 2, right: 2, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  bagCountText: { color: colors.onAccent, fontSize: 10, fontWeight: '700' },
  placeRow: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', marginBottom: 20 },
  place: { fontSize: 13, fontWeight: '600', color: colors.ink },
  storesLink: { fontSize: 13, color: colors.ink, textDecorationLine: 'underline' },
  title: { fontSize: 34, lineHeight: 38, letterSpacing: -1, marginTop: 22, marginBottom: 10 },
  rangeHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 },
  rangeLabel: { fontSize: 15, fontWeight: '600', color: colors.ink },
  rangeHint: { fontSize: 13, color: colors.muted, textDecorationLine: 'underline' },
  levels: { flexDirection: 'row', gap: 6 },
  level: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.md, backgroundColor: colors.surface },
  levelOn: { backgroundColor: colors.accent },
  levelValue: { fontSize: 19, fontWeight: '700', color: colors.ink, letterSpacing: -0.5 },
  levelUnit: { fontSize: 11, color: colors.muted, marginTop: -2 },
  levelCount: { fontSize: 10, fontWeight: '600', color: colors.green, marginTop: 6 },
  levelOnText: { color: colors.onAccent },
  radiusPanel: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 12, marginTop: 8 },
  cats: { paddingHorizontal: space.lg, paddingTop: 20, paddingBottom: 4 },
  chips: { paddingHorizontal: space.lg, paddingVertical: 8 },
  countRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, marginBottom: 12 },
  count: { fontSize: 13, color: colors.muted, flexShrink: 1 },
  density: { flexDirection: 'row', gap: 4 },
  densityBtn: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: colors.raised },
  densityOn: { backgroundColor: colors.accent },
  densityText: { fontSize: 12, fontWeight: '700', color: colors.ink },
  extend: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: space.lg, marginTop: 8, padding: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed' },
  extendText: { flex: 1, fontSize: 13, color: colors.ink, fontWeight: '500' },
});
