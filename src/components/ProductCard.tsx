import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatDistance, type DistanceUnit } from '../lib/geo';
import type { ProductListing } from '../lib/inventory';
import { colors, money, radius } from '../theme';
import { PricePill, ProductPhoto } from './ui';
import { productImage } from '../data/productImages';

/**
 * Gallery-style card: the item sits on black with a faint glow of its own colour,
 * price floats on the art, and the words underneath stay small.
 * `dense` is the 3-across scanning view — art and price only.
 */
export function ProductCard({ listing, unit, dense }: { listing: ProductListing; unit: DistanceUnit; dense?: boolean }) {
  const { product, inRadius } = listing;
  const nearest = inRadius[0];
  const low = nearest && nearest.stock <= 2;
  return (
    <Pressable
      testID={`product-${product.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${money(product.price)}${nearest ? `, ${formatDistance(nearest.distanceMi, unit)} away` : ''}`}
      onPress={() => router.push(`/product/${product.id}`)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}
    >
      <ProductPhoto image={productImage(product.id)} emoji={product.emoji} tint={product.tint} emojiSize={dense ? 38 : 60} style={[styles.art, dense && styles.artDense]}>
        {low && !dense ? (
          <View style={styles.tag}>
            <Text style={styles.tagText}>Only {nearest.stock} left</Text>
          </View>
        ) : null}
        <PricePill label={money(product.price)} style={[styles.price, dense && styles.priceDense]} />
      </ProductPhoto>
      {dense ? null : (
        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={2}>
            {product.name.startsWith(product.brand) ? product.name : `${product.brand} ${product.name}`}
          </Text>
          {nearest ? (
            <View style={styles.near}>
              <Ionicons name="location" size={11} color={colors.green} />
              <Text style={styles.nearText} numberOfLines={1}>
                {formatDistance(nearest.distanceMi, unit)} · {nearest.store.name}
              </Text>
            </View>
          ) : null}
          {inRadius.length > 1 ? <Text style={styles.more}>+{inRadius.length - 1} more nearby</Text> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1 },
  art: { aspectRatio: 1, borderRadius: radius.md },
  artDense: {},
  tag: { position: 'absolute', top: 8, left: 8, backgroundColor: colors.amberSoft, borderRadius: radius.pill, paddingVertical: 3, paddingHorizontal: 8 },
  tagText: { fontSize: 11, fontWeight: '700', color: colors.amber },
  price: { position: 'absolute', bottom: 8, left: 8 },
  priceDense: { bottom: 6, left: 6, paddingVertical: 2, paddingHorizontal: 7 },
  body: { paddingTop: 8, paddingHorizontal: 2, gap: 3 },
  name: { fontSize: 13, color: colors.ink, lineHeight: 17 },
  near: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  nearText: { fontSize: 11, color: colors.green, fontWeight: '600', flexShrink: 1 },
  more: { fontSize: 11, color: colors.muted },
});
