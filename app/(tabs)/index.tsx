import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductCard } from '../../src/components/ProductCard';
import { RadiusControl } from '../../src/components/RadiusControl';
import { Chip, Empty } from '../../src/components/ui';
import { CATEGORIES } from '../../src/data/products';
import { STORE_TYPE_LABEL, type Category, type StoreType } from '../../src/data/stores';
import { formatDistance } from '../../src/lib/geo';
import { buildListings } from '../../src/lib/inventory';
import { useApp } from '../../src/state/AppState';
import { colors, radius, space, type } from '../../src/theme';

const STORE_TYPES = Object.keys(STORE_TYPE_LABEL) as StoreType[];

export default function Discover() {
  const { place, radiusMi, unit, setRadiusMi } = useApp();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | 'All'>('All');
  const [storeType, setStoreType] = useState<StoreType | 'all'>('all');
  const [showRadius, setShowRadius] = useState(false);

  const listings = useMemo(() => buildListings(place.coord, radiusMi, { storeType }), [place, radiusMi, storeType]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings.filter(
      (l) =>
        (category === 'All' || l.product.category === category) &&
        (!q || `${l.product.name} ${l.product.brand} ${l.product.category}`.toLowerCase().includes(q)),
    );
  }, [listings, query, category]);

  const available = matches.filter((l) => l.inRadius.length > 0);
  const beyond = matches.filter((l) => l.inRadius.length === 0 && l.nearestAnywhere);
  const nextReach = beyond.length ? Math.min(...beyond.map((l) => l.nearestAnywhere!.distanceMi)) : undefined;

  const header = (
    <View style={{ paddingTop: insets.top + 8 }}>
      <View style={styles.pad}>
        <Text style={type.small}>Pick up near</Text>
        <Pressable accessibilityRole="button" onPress={() => router.push('/profile')} style={styles.placeRow}>
          <Ionicons name="location" size={18} color={colors.accent} />
          <Text style={styles.place}>{place.label}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.muted} />
        </Pressable>
        <Text style={[type.title, { marginTop: 10 }]}>Shop it online.{'\n'}Go get it in person.</Text>

        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            testID="search-input"
            value={query}
            onChangeText={setQuery}
            placeholder="Search what's on the shelves nearby"
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>

        <Pressable testID="radius-toggle" accessibilityRole="button" onPress={() => setShowRadius((v) => !v)} style={styles.radiusPill}>
          <Ionicons name="navigate-circle-outline" size={20} color={colors.ink} />
          <Text style={styles.radiusText}>Within {formatDistance(radiusMi, unit)}</Text>
          <Text style={styles.radiusHint}>{showRadius ? 'Done' : 'Change'}</Text>
        </Pressable>
        {showRadius ? (
          <View style={styles.radiusPanel}>
            <RadiusControl radiusMi={radiusMi} unit={unit} onChange={setRadiusMi} />
          </View>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="All" selected={category === 'All'} onPress={() => setCategory('All')} />
        {CATEGORIES.map((c) => (
          <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.chips, { paddingTop: 0 }]}>
        <Chip icon="business-outline" label="Any store" selected={storeType === 'all'} onPress={() => setStoreType('all')} />
        {STORE_TYPES.map((t) => (
          <Chip key={t} label={STORE_TYPE_LABEL[t]} selected={storeType === t} onPress={() => setStoreType(t)} />
        ))}
      </ScrollView>

      <Text style={[styles.pad, styles.count]}>
        {available.length} {available.length === 1 ? 'item' : 'items'} ready for pickup nearby
      </Text>
    </View>
  );

  const footer =
    nextReach !== undefined ? (
      <Pressable
        testID="extend-radius"
        accessibilityRole="button"
        onPress={() => setRadiusMi(Math.min(40, Math.ceil(nextReach)))}
        style={styles.extend}
      >
        <Ionicons name="arrow-forward-circle" size={20} color={colors.accent} />
        <Text style={styles.extendText}>
          {beyond.length} more {beyond.length === 1 ? 'item is' : 'items are'} just beyond your range. Extend to {formatDistance(Math.min(40, Math.ceil(nextReach)), unit)}
        </Text>
      </Pressable>
    ) : null;

  return (
    <FlatList
      testID="discover-list"
      data={available}
      keyExtractor={(l) => l.product.id}
      numColumns={2}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
      ListEmptyComponent={
        <Empty icon="storefront-outline" title="Nothing on the shelves nearby" body="Try a wider pickup range or a different store type." />
      }
      columnWrapperStyle={{ gap: space.md, paddingHorizontal: space.lg }}
      contentContainerStyle={{ gap: space.md, paddingBottom: 32 }}
      renderItem={({ item }) => <ProductCard listing={item} unit={unit} />}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: space.lg },
  placeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  place: { fontSize: 17, fontWeight: '700', color: colors.ink },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, marginTop: 16 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: colors.ink },
  radiusPill: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, backgroundColor: colors.accentSoft, borderRadius: radius.md, paddingVertical: 10, paddingHorizontal: 12 },
  radiusText: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.ink },
  radiusHint: { fontSize: 13, fontWeight: '700', color: colors.accent },
  radiusPanel: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 12, marginTop: 8 },
  chips: { paddingHorizontal: space.lg, paddingVertical: 12 },
  count: { fontSize: 13, color: colors.muted, marginBottom: 12 },
  extend: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: space.lg, padding: 14, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed' },
  extendText: { flex: 1, fontSize: 13, color: colors.ink, fontWeight: '600' },
});
