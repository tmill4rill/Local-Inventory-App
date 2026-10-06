import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Chip, Empty, LookCollage, Price, ProductPhoto } from '../../src/components/ui';
import { productImage } from '../../src/data/productImages';
import { CATEGORIES, getProduct, type Product } from '../../src/data/products';
import type { Category } from '../../src/data/stores';
import { fromDayKey } from '../../src/lib/styling';
import { useApp } from '../../src/state/AppState';
import { colors, space, TABBAR_SPACE } from '../../src/theme';

type Tab = 'closet' | 'wishlist' | 'looks';

/** Closet, Wishlist and saved Looks, after Alta's closet tab. */
export default function Closet() {
  const insets = useSafeAreaInsets();
  const { closet, wishlist, looks, removeLook } = useApp();
  const [tab, setTab] = useState<Tab>('closet');
  const [category, setCategory] = useState<Category | 'All'>('All');

  const items = useMemo(() => {
    const ids = tab === 'closet' ? closet.map((c) => c.productId) : wishlist;
    return ids.map(getProduct).filter((p): p is Product => !!p && (category === 'All' || p.category === category));
  }, [tab, closet, wishlist, category]);

  const counts = { closet: closet.length, wishlist: wishlist.length, looks: looks.length };

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <View style={styles.tabs} accessibilityRole="tablist">
        {(['closet', 'wishlist', 'looks'] as Tab[]).map((t) => (
          <Pressable key={t} testID={`closet-tab-${t}`} accessibilityRole="tab" accessibilityState={{ selected: tab === t }} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabOn]}>
            <Text style={[styles.tabText, tab === t && styles.tabTextOn]}>{t[0].toUpperCase() + t.slice(1)}</Text>
          </Pressable>
        ))}
      </View>

      {tab === 'looks' ? (
        <FlatList
          data={looks}
          keyExtractor={(l) => l.id}
          contentContainerStyle={{ padding: space.lg, gap: 26, paddingBottom: TABBAR_SPACE + insets.bottom }}
          ListHeaderComponent={<Text style={styles.meta}>{counts.looks} saved {counts.looks === 1 ? 'look' : 'looks'}</Text>}
          ListEmptyComponent={
            <Empty icon="calendar-outline" title="No looks yet" body="Save a suggestion from Today, or build your own look from nearby stock.">
              <Button label="New look" icon="add" onPress={() => router.push('/look')} />
            </Empty>
          }
          renderItem={({ item }) => (
            <View testID={`look-${item.id}`}>
              <View style={styles.lookHead}>
                <Text style={styles.lookTitle}>{item.title}</Text>
                <Text style={styles.meta}>{fromDayKey(item.day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${item.title}`} onPress={() => router.push({ pathname: '/look', params: { id: item.id } })}>
                <LookCollage items={item.items} height={230} />
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => removeLook(item.id)} style={styles.remove} hitSlop={6}>
                <Ionicons name="trash-outline" size={14} color={colors.muted} />
                <Text style={styles.meta}>Remove</Text>
              </Pressable>
            </View>
          )}
        />
      ) : (
        <FlatList
          key={tab}
          data={items}
          keyExtractor={(p) => p.id}
          numColumns={3}
          columnWrapperStyle={{ gap: 4, paddingHorizontal: space.lg }}
          contentContainerStyle={{ gap: 16, paddingBottom: TABBAR_SPACE + insets.bottom }}
          ListHeaderComponent={
            <View>
              <View style={styles.sortRow}>
                <Text style={styles.sort}>Newest</Text>
                <Text style={styles.meta}>
                  {counts[tab]} {counts[tab] === 1 ? 'item' : 'items'}
                </Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: 12 }}>
                {(['All', ...CATEGORIES] as const).map((c) => (
                  <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
                ))}
              </ScrollView>
            </View>
          }
          ListEmptyComponent={
            tab === 'closet' ? (
              <Empty icon="shirt-outline" title="Your closet is empty" body={'Pieces you pick up land here automatically. You can also tap "I own this" on anything you already have, so the stylist can use it.'}>
                <Button label="Browse the shop" onPress={() => router.navigate('/shop')} />
              </Empty>
            ) : (
              <Empty icon="heart-outline" title="Nothing saved yet" body="Tap the heart on any piece to keep it here." />
            )
          }
          renderItem={({ item }) => (
            <Pressable testID={`closet-${item.id}`} accessibilityRole="button" accessibilityLabel={`${item.brand} ${item.name}`} onPress={() => router.push(`/product/${item.id}`)} style={{ flex: 1 / 3 }}>
              <ProductPhoto image={productImage(item.id)} emoji={item.emoji} tint={item.tint} emojiSize={34} style={{ aspectRatio: 1, width: '100%' }} />
              <Text style={styles.brand} numberOfLines={1}>{item.brand}</Text>
              <Text style={styles.meta} numberOfLines={1}>{item.name}</Text>
              {tab === 'wishlist' ? <Price price={item.price} compareAt={item.compareAt} style={{ fontSize: 12 }} /> : null}
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabOn: { borderBottomColor: colors.ink },
  tabText: { fontSize: 16, color: colors.muted },
  tabTextOn: { color: colors.ink, fontWeight: '600' },
  sortRow: { paddingHorizontal: space.lg, paddingTop: 14, paddingBottom: 10 },
  sort: { fontSize: 15, fontWeight: '600', color: colors.ink },
  meta: { fontSize: 12, color: colors.muted },
  brand: { fontSize: 13, fontWeight: '600', color: colors.ink, marginTop: 6 },
  lookHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  lookTitle: { fontSize: 16, fontWeight: '600', color: colors.ink },
  remove: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end', marginTop: 8 },
});
