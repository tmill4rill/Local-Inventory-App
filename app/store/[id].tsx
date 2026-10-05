import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Empty, ProductArt } from '../../src/components/ui';
import { getStore, STORE_TYPE_LABEL } from '../../src/data/stores';
import { directionsUrl, distanceMiles, formatDistance } from '../../src/lib/geo';
import { productsAtStore } from '../../src/lib/inventory';
import { formatHour, isOpenNow } from '../../src/lib/pickup';
import { useApp } from '../../src/state/AppState';
import { colors, money, radius, type } from '../../src/theme';

export default function StoreDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = getStore(String(id));
  const { place, unit } = useApp();
  if (!store) return <Empty icon="alert-circle-outline" title="Store not found" body="This store isn't available." />;
  const d = distanceMiles(place.coord, store.coord);
  const items = productsAtStore(store);
  return (
    <>
      <Stack.Screen options={{ title: STORE_TYPE_LABEL[store.type] }} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={type.title}>{store.name}</Text>
        <Text style={[type.small, { marginTop: 4 }]}>
          {store.address} · {store.area} · {formatDistance(d, unit)} away
        </Text>
        <Text style={[type.small, { marginTop: 2 }]}>
          {formatHour(store.hours.open)}–{formatHour(store.hours.close)} daily · {isOpenNow(store.hours) ? 'Open now' : 'Closed now'}
        </Text>

        <Card style={styles.exp}>
          <View style={styles.expIcon}>
            <Ionicons name={store.experience.icon as never} size={26} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.expTitle}>{store.experience.title}</Text>
            <Text style={{ color: colors.ink, lineHeight: 20 }}>{store.experience.detail}</Text>
          </View>
        </Card>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
          {store.perks.map((p) => (
            <View key={p} style={styles.perk}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.ink }}>{p}</Text>
            </View>
          ))}
        </View>

        <Button
          style={{ marginTop: 16 }}
          variant="secondary"
          icon="navigate-outline"
          label="Get directions"
          onPress={() => Linking.openURL(directionsUrl(store.coord))}
        />

        <Text style={[type.h2, { marginTop: 24, marginBottom: 10 }]}>On the shelves ({items.length})</Text>
        {items.map((p) => (
          <Pressable key={p.id} accessibilityRole="button" onPress={() => router.push(`/product/${p.id}`)} style={styles.item}>
            <ProductArt emoji={p.emoji} tint={p.tint} size={52} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', color: colors.ink }}>{p.name}</Text>
              <Text style={type.small}>{p.brand}</Text>
            </View>
            <Text style={{ fontWeight: '800', color: colors.ink }}>{money(p.price)}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  exp: { flexDirection: 'row', gap: 12, marginTop: 16, backgroundColor: colors.accentSoft, borderColor: colors.accentSoft },
  expIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  expTitle: { fontSize: 16, fontWeight: '800', color: colors.ink, marginBottom: 2 },
  perk: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginBottom: 8 },
});
