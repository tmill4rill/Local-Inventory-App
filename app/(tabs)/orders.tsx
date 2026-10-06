import { router } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Badge, Button, Empty, ProductArt } from '../../src/components/ui';
import { getProduct } from '../../src/data/products';
import { getStore } from '../../src/data/stores';
import { formatSlot } from '../../src/lib/pickup';
import { STATUS_LABEL, useApp } from '../../src/state/AppState';
import { colors, DOCK_SPACE, money, radius } from '../../src/theme';

export default function Orders() {
  const { orders } = useApp();
  if (orders.length === 0) {
    return (
      <Empty icon="ticket-outline" title="No pickups yet" body="Reserve something nearby and your pickup code will show up here.">
        <Button label="Discover nearby" onPress={() => router.navigate('/')} />
      </Empty>
    );
  }
  return (
    <FlatList
      testID="orders-list"
      data={orders}
      keyExtractor={(o) => o.id}
      contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: DOCK_SPACE }}
      renderItem={({ item: o }) => {
        const store = o.fulfillment.type === 'pickup' ? getStore(o.fulfillment.storeId) : undefined;
        const first = getProduct(o.lines[0].productId);
        return (
          <Pressable testID={`order-${o.id}`} accessibilityRole="button" onPress={() => router.push(`/order/${o.id}`)} style={styles.card}>
            {first ? <ProductArt emoji={first.emoji} tint={first.tint} image={first.image} size={52} /> : null}
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{store ? store.name : 'Shipped to you'}</Text>
              <Text style={styles.meta}>
                {o.lines.reduce((n, l) => n + l.qty, 0)} items · {money(o.total)}
                {o.slotISO ? ` · ${formatSlot(o.slotISO)}` : ''}
              </Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                <Badge tone={o.status === 'ready' ? 'green' : o.status === 'picked_up' ? 'neutral' : 'amber'} label={STATUS_LABEL[o.status]} />
                {o.invited.length > 0 ? <Badge tone="accent" icon="people" label={`${o.invited.length} joining`} /> : null}
              </View>
            </View>
            {store ? <Text style={styles.code}>{o.code}</Text> : null}
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 14, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  title: { fontSize: 16, fontWeight: '800', color: colors.ink },
  meta: { fontSize: 13, color: colors.muted, marginTop: 2 },
  code: { fontSize: 12, fontWeight: '800', color: colors.ink, letterSpacing: 1 },
});
