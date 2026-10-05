import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatDistance, type DistanceUnit } from '../lib/geo';
import type { ProductListing } from '../lib/inventory';
import { colors, money, radius } from '../theme';
import { Badge } from './ui';

export function ProductCard({ listing, unit }: { listing: ProductListing; unit: DistanceUnit }) {
  const { product, inRadius } = listing;
  const nearest = inRadius[0];
  const low = nearest && nearest.stock <= 2;
  return (
    <Pressable
      testID={`product-${product.id}`}
      accessibilityRole="button"
      onPress={() => router.push(`/product/${product.id}`)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={[styles.art, { backgroundColor: product.tint }]}>
        <Text style={{ fontSize: 56 }}>{product.emoji}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.brand}>{product.brand.toUpperCase()}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.price}>{money(product.price)}</Text>
        {nearest ? (
          <View style={{ marginTop: 6, gap: 4 }}>
            <View style={styles.near}>
              <Ionicons name="location" size={12} color={colors.green} />
              <Text style={styles.nearText} numberOfLines={1}>
                {formatDistance(nearest.distanceMi, unit)} · {nearest.store.name}
              </Text>
            </View>
            {inRadius.length > 1 ? (
              <Text style={styles.more}>+{inRadius.length - 1} more nearby</Text>
            ) : low ? (
              <Badge tone="amber" label={`Only ${nearest.stock} left`} />
            ) : null}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  art: { height: 112, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 12 },
  brand: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8, color: colors.muted },
  name: { fontSize: 14, fontWeight: '700', color: colors.ink, marginTop: 2, minHeight: 36 },
  price: { fontSize: 15, fontWeight: '800', color: colors.ink, marginTop: 2 },
  near: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  nearText: { fontSize: 11, color: colors.green, fontWeight: '600', flexShrink: 1 },
  more: { fontSize: 11, color: colors.muted },
});
