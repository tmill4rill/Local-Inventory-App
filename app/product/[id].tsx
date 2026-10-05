import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, Button, Card, Empty, PricePill, StatTrio } from '../../src/components/ui';
import { getProduct, SHIPPING_FEE } from '../../src/data/products';
import { STORE_TYPE_LABEL } from '../../src/data/stores';
import { formatDistance } from '../../src/lib/geo';
import { availabilityFor, withinRadius } from '../../src/lib/inventory';
import { isOpenNow } from '../../src/lib/pickup';
import { useApp } from '../../src/state/AppState';
import { colors, glow, money, radius, space, type } from '../../src/theme';

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = getProduct(String(id));
  const { place, radiusMi, unit, setRadiusMi, addToCart } = useApp();
  const [chosen, setChosen] = useState<string | undefined>();
  const [added, setAdded] = useState<string | null>(null);

  const all = useMemo(() => (product ? availabilityFor(product, place.coord) : []), [product, place]);
  const nearby = useMemo(() => withinRadius(all, radiusMi), [all, radiusMi]);

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
        <View style={[styles.hero, { backgroundColor: glow(product.tint, 0.1) }]}>
          <View style={[styles.halo, { borderColor: glow(product.tint, 0.55), backgroundColor: glow(product.tint, 0.12) }]} />
          <Text style={{ fontSize: 132 }}>{product.emoji}</Text>
          <PricePill label={money(product.price)} style={styles.heroPrice} />
        </View>
        <View style={styles.pad}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={type.title}>{product.name}</Text>

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
            label={`Ship to me instead · +${money(SHIPPING_FEE)}`}
            onPress={() => add('ship')}
          />
          <Text style={[type.small, { textAlign: 'center', marginTop: 8 }]}>Pickup is free. Shipping takes 3–5 days.</Text>

          {added ? (
            <Card style={styles.toast}>
              <Ionicons name="checkmark-circle" size={20} color={colors.green} />
              <Text style={{ flex: 1, color: colors.ink, fontWeight: '600' }}>{added}</Text>
              <Pressable testID="go-cart" accessibilityRole="button" onPress={() => router.navigate('/cart')}>
                <Text style={{ color: colors.ink, fontWeight: '800', textDecorationLine: 'underline' }}>View cart</Text>
              </Pressable>
            </Card>
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  hero: { height: 320, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  halo: { position: 'absolute', width: 230, height: 230, borderRadius: 115, borderWidth: 3 },
  heroPrice: { position: 'absolute', bottom: 16, alignSelf: 'center' },
  pad: { padding: space.lg, gap: 0 },
  brand: { fontSize: 13, fontWeight: '600', color: colors.muted, marginBottom: 2 },
  perk: { flexDirection: 'row', gap: 12, marginTop: 16, backgroundColor: colors.amberSoft, borderColor: 'transparent' },
  perkTitle: { fontWeight: '800', color: colors.ink, marginBottom: 2 },
  perkBody: { color: colors.ink, lineHeight: 20 },
  section: { ...type.h2, marginTop: 24, marginBottom: 10 },
  store: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, marginBottom: 8 },
  storeName: { fontSize: 15, fontWeight: '700', color: colors.ink },
  exp: { marginTop: 8, fontSize: 13, color: colors.amber, fontWeight: '700' },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16, padding: 14 },
});
