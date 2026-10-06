import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { productImage } from '../data/productImages';
import { formatDistance, type DistanceUnit } from '../lib/geo';
import type { ProductListing } from '../lib/inventory';
import { useApp } from '../state/AppState';
import { colors, money } from '../theme';
import { Heart, Price, ProductPhoto } from './ui';

/**
 * Alta-style catalog card: packshot on a pale tile with a heart in the corner, brand in bold,
 * name and price underneath, plus LocalPick's nearest-pickup line.
 * `dense` is the 3-across closet-style view: tile, brand and name only.
 */
export function ProductCard({ listing, unit, dense }: { listing: ProductListing; unit: DistanceUnit; dense?: boolean }) {
  const { product, inRadius } = listing;
  const { wished, toggleWishlist, owns } = useApp();
  const nearest = inRadius[0];
  const low = nearest && nearest.stock <= 2;
  return (
    <Pressable
      testID={`product-${product.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${product.brand} ${product.name}, ${money(product.price)}${nearest ? `, ${formatDistance(nearest.distanceMi, unit)} away` : ''}`}
      onPress={() => router.push(`/product/${product.id}`)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <ProductPhoto image={productImage(product.id)} emoji={product.emoji} tint={product.tint} emojiSize={dense ? 36 : 56} style={styles.art}>
        {!dense ? <Heart on={wished(product.id)} onPress={() => toggleWishlist(product.id)} style={styles.heart} size={19} testID={`heart-${product.id}`} /> : null}
        {owns(product.id) ? (
          <View style={styles.owned}>
            <Ionicons name="checkmark" size={11} color={colors.onAccent} />
          </View>
        ) : null}
        {low && !dense ? (
          <View style={styles.tag}>
            <Text style={styles.tagText}>Only {nearest.stock} left</Text>
          </View>
        ) : null}
      </ProductPhoto>
      <View style={styles.body}>
        <Text style={styles.brand} numberOfLines={1}>{product.brand}</Text>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        {!dense ? (
          <>
            <Price price={product.price} compareAt={product.compareAt} />
            {nearest ? (
              <View style={styles.near}>
                <View style={styles.dot} />
                <Text style={styles.nearText} numberOfLines={1}>
                  {formatDistance(nearest.distanceMi, unit)} · {nearest.store.name}
                </Text>
              </View>
            ) : null}
          </>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1 },
  art: { aspectRatio: 1, width: '100%' },
  heart: { position: 'absolute', top: 10, right: 10 },
  owned: { position: 'absolute', top: 8, left: 8, width: 18, height: 18, borderRadius: 9, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  tag: { position: 'absolute', bottom: 8, left: 8, backgroundColor: colors.bg, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 8 },
  tagText: { fontSize: 11, fontWeight: '600', color: colors.amber },
  body: { paddingTop: 8, gap: 2 },
  brand: { fontSize: 14, fontWeight: '600', color: colors.ink },
  name: { fontSize: 13, color: colors.muted },
  near: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green },
  nearText: { fontSize: 12, color: colors.green, flexShrink: 1 },
});
