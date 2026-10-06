import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, Button, Card, DetailRow, Empty, Heart, Price, ProductPhoto, StatTrio, Thumb } from '../../src/components/ui';
import { getProduct, OCCASION_LABEL, PRODUCTS, SHIPPING_FEE } from '../../src/data/products';
import { STORE_TYPE_LABEL } from '../../src/data/stores';
import { formatDistance } from '../../src/lib/geo';
import { availabilityFor, withinRadius } from '../../src/lib/inventory';
import { isOpenNow } from '../../src/lib/pickup';
import { useApp } from '../../src/state/AppState';
import { colors, money, radius, space, type } from '../../src/theme';
import { productImage } from '../../src/data/productImages';

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = getProduct(String(id));
  const { place, radiusMi, unit, setRadiusMi, addToCart, wished, toggleWishlist, owns, setOwned } = useApp();
  const [chosen, setChosen] = useState<string | undefined>();
  const [added, setAdded] = useState<string | null>(null);

  const all = useMemo(() => (product ? availabilityFor(product, place.coord) : []), [product, place]);
  const nearby = useMemo(() => withinRadius(all, radiusMi), [all, radiusMi]);
  // Same category first, then pieces that share an occasion; only what is on shelves nearby.
  const similar = useMemo(() => {
    if (!product) return [];
    return PRODUCTS.filter((p) => p.id !== product.id && withinRadius(availabilityFor(p, place.coord), radiusMi).length)
      .map((p) => ({ p, score: (p.category === product.category ? 2 : 0) + (p.occasions.some((o) => product.occasions.includes(o)) ? 1 : 0) }))
      .filter((x) => x.score >= 2)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((x) => x.p);
  }, [product, place, radiusMi]);

  if (!product) return <Empty icon="alert-circle-outline" title="Product not found" body="This item is no longer available." />;

  const selected = nearby.find((a) => a.store.id === (chosen ?? nearby[0]?.store.id));
  const nearestAnywhere = all[0];

  const add = (kind: 'pickup' | 'ship') => {
    if (kind === 'pickup' && !selected) return;
    addToCart(product.id, kind === 'pickup' ? { type: 'pickup', storeId: selected!.store.id } : { type: 'ship' });
    setAdded(kind === 'pickup' ? `Added for pickup at ${selected!.store.name}` : 'Added — shipping to you');
  };

  return (
    <>
      <Stack.Screen options={{ title: product.category }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <ProductPhoto image={productImage(product.id)} emoji={product.emoji} tint={product.tint} emojiSize={132} style={styles.hero} />
        <View style={styles.pad}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.brand}>{product.brand}</Text>
              <Text style={styles.name}>{product.name}</Text>
              <Price price={product.price} compareAt={product.compareAt} style={styles.price} />
            </View>
            <Heart testID="wish" on={wished(product.id)} onPress={() => toggleWishlist(product.id)} size={24} />
          </View>

          <View style={styles.duo}>
            <Pressable
              testID="style-item"
              accessibilityRole="button"
              style={[styles.duoBtn, styles.duoLight]}
              onPress={() => router.push({ pathname: '/look', params: { anchor: product.id } })}
            >
              <Ionicons name="sparkles-outline" size={16} color={colors.ink} />
              <Text style={styles.duoLightText}>Style this item</Text>
            </Pressable>
            <Pressable
              testID="own-item"
              accessibilityRole="button"
              accessibilityState={{ selected: owns(product.id) }}
              style={[styles.duoBtn, styles.duoLight, owns(product.id) && { backgroundColor: colors.greenSoft }]}
              onPress={() => setOwned(product.id, !owns(product.id))}
            >
              <Ionicons name={owns(product.id) ? 'checkmark-circle' : 'shirt-outline'} size={16} color={owns(product.id) ? colors.green : colors.ink} />
              <Text style={[styles.duoLightText, owns(product.id) && { color: colors.green }]}>{owns(product.id) ? 'In your closet' : 'I own this'}</Text>
            </Pressable>
          </View>

          <View style={{ height: 14 }} />
          <StatTrio
            testID="stock-stats"
            stats={[
              { label: 'Nearest', value: nearby[0] ? formatDistance(nearby[0].distanceMi, unit) : '—' },
              { label: 'On shelves', value: String(nearby.reduce((n, a) => n + a.stock, 0)) },
              { label: 'Stores', value: String(nearby.length) },
            ]}
          />

          <Text style={[type.body, { marginTop: 16, lineHeight: 22, color: colors.muted }]}>{product.description}</Text>
          <View style={{ marginTop: 8 }}>
            <DetailRow label="Brand" value={product.brand} />
            <DetailRow label="Category" value={product.category} />
            <DetailRow label="Color" value={product.color} />
            <DetailRow label="Wear it for" value={product.occasions.map((o) => OCCASION_LABEL[o]).join(', ')} />
          </View>

          {product.pickupPerk ? (
            <Card style={styles.perk}>
              <Ionicons name="sparkles" size={20} color={colors.amber} />
              <View style={{ flex: 1 }}>
                <Text style={styles.perkTitle}>The in-person difference</Text>
                <Text style={styles.perkBody}>{product.pickupPerk}</Text>
              </View>
            </Card>
          ) : null}

          <Text style={styles.section}>Pick up at</Text>
          {nearby.length === 0 ? (
            <Card>
              <Empty icon="navigate-outline" title="Not in your pickup range" body={nearestAnywhere ? `The closest store with this is ${formatDistance(nearestAnywhere.distanceMi, unit)} away.` : 'No local stock right now.'}>
                {nearestAnywhere && nearestAnywhere.distanceMi <= 40 ? (
                  <Button testID="extend-range" label={`Extend range to ${formatDistance(Math.ceil(nearestAnywhere.distanceMi), unit)}`} variant="secondary" onPress={() => setRadiusMi(Math.ceil(nearestAnywhere.distanceMi))} />
                ) : null}
              </Empty>
            </Card>
          ) : (
            nearby.map((a) => {
              const isSel = selected?.store.id === a.store.id;
              const open = isOpenNow(a.store.hours);
              return (
                <Pressable
                  key={a.store.id}
                  testID={`store-option-${a.store.id}`}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSel }}
                  onPress={() => setChosen(a.store.id)}
                  style={[styles.store, isSel && { borderColor: colors.ink, backgroundColor: colors.raised }]}
                >
                  <Ionicons name={isSel ? 'radio-button-on' : 'radio-button-off'} size={22} color={isSel ? colors.ink : colors.muted} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.storeName}>{a.store.name}</Text>
                    <Text style={type.small}>
                      {STORE_TYPE_LABEL[a.store.type]} · {formatDistance(a.distanceMi, unit)} · {a.store.area}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                      <Badge tone={a.stock <= 2 ? 'amber' : 'green'} label={a.stock <= 2 ? `Only ${a.stock} left` : 'In stock'} />
                      <Badge tone="neutral" label={open ? 'Open now' : 'Closed now'} icon="time-outline" />
                    </View>
                    {isSel ? <Text style={styles.exp}>✦ {a.store.experience.title}</Text> : null}
                  </View>
                </Pressable>
              );
            })
          )}

          {selected ? (
            <Button testID="add-pickup" style={{ marginTop: 16 }} icon="bag-add-outline" label={`Reserve for pickup · ${money(product.price)}`} onPress={() => add('pickup')} />
          ) : null}
          <Button
            testID="add-ship"
            style={{ marginTop: 10 }}
            variant="secondary"
            icon="cube-outline"
            label={`Ship to me instead · +${money(SHIPPING_FEE)} insured`}
            onPress={() => add('ship')}
          />
          <Text style={[type.small, { textAlign: 'center', marginTop: 8 }]}>Pickup is free. Shipping takes 3–5 days.</Text>


          {added ? (
            <Card style={styles.toast}>
              <Ionicons name="checkmark-circle" size={20} color={colors.green} />
              <Text style={{ flex: 1, color: colors.ink, fontWeight: '600' }}>{added}</Text>
              <Pressable testID="go-cart" accessibilityRole="button" onPress={() => router.navigate('/cart')}>
                <Text style={{ color: colors.ink, fontWeight: '700', textDecorationLine: 'underline' }}>View bag</Text>
              </Pressable>
            </Card>
          ) : null}

          {similar.length ? (
            <>
              <Text style={styles.section}>Similar nearby</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {similar.map((p) => (
                  <Pressable key={p.id} testID={`similar-${p.id}`} accessibilityRole="button" accessibilityLabel={`${p.brand} ${p.name}`} onPress={() => router.push(`/product/${p.id}`)} style={{ width: 132 }}>
                    <Thumb id={p.id} size={132} />
                    <Text style={styles.simBrand} numberOfLines={1}>{p.brand}</Text>
                    <Text style={type.small} numberOfLines={1}>{p.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', aspectRatio: 1, maxHeight: 460 },
  pad: { padding: space.lg },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  brand: { fontSize: 18, fontWeight: '700', color: colors.ink },
  name: { fontSize: 15, color: colors.muted, marginTop: 2 },
  price: { fontSize: 15, marginTop: 8 },
  duo: { flexDirection: 'row', gap: 8, marginTop: 16 },
  duoBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13, borderRadius: radius.pill },
  duoLight: { backgroundColor: colors.raised },
  duoLightText: { fontSize: 14, fontWeight: '500', color: colors.ink },
  perk: { flexDirection: 'row', gap: 12, marginTop: 16, backgroundColor: colors.amberSoft, borderColor: 'transparent' },
  perkTitle: { fontWeight: '700', color: colors.ink, marginBottom: 2 },
  perkBody: { color: colors.ink, lineHeight: 20 },
  section: { ...type.h2, marginTop: 26, marginBottom: 10 },
  store: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, marginBottom: 8 },
  storeName: { fontSize: 15, fontWeight: '600', color: colors.ink },
  exp: { marginTop: 8, fontSize: 13, color: colors.amber, fontWeight: '600' },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16, padding: 14 },
  simBrand: { fontSize: 13, fontWeight: '600', color: colors.ink, marginTop: 6 },
});
