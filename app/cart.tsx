import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Empty, ProductArt } from '../src/components/ui';
import { getProduct, SHIPPING_FEE } from '../src/data/products';
import { getStore } from '../src/data/stores';
import { useApp, type CartLine } from '../src/state/AppState';
import { colors, money, radius, type } from '../src/theme';
import { productImage } from '../src/data/productImages';

export default function Cart() {
  const { cart, setQty, removeLine } = useApp();
  if (cart.length === 0) {
    return (
      <Empty icon="bag-outline" title="Your bag is empty" body="Find something nearby and reserve it for pickup.">
        <Button label="Shop nearby" onPress={() => router.navigate('/shop')} />
      </Empty>
    );
  }
  const items = cart.reduce((n, l) => n + (getProduct(l.productId)?.price ?? 0) * l.qty, 0);
  const shipping = cart.some((l) => l.fulfillment.type === 'ship') ? SHIPPING_FEE : 0;
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 12 }}>
      {cart.map((line) => (
        <Line key={line.id} line={line} onQty={(q) => setQty(line.id, q)} onRemove={() => removeLine(line.id)} />
      ))}
      <Card style={{ gap: 8 }}>
        <Row label="Items" value={money(items)} />
        <Row label="Pickup" value="Free" />
        {shipping > 0 ? <Row label="Shipping" value={money(shipping)} /> : null}
        <View style={{ height: 1, backgroundColor: colors.border }} />
        <Row label="Total" value={money(items + shipping)} bold />
      </Card>
      <Button testID="checkout" label="Choose pickup times" icon="time-outline" onPress={() => router.push('/checkout')} />
    </ScrollView>
  );
}

function Line({ line, onQty, onRemove }: { line: CartLine; onQty: (q: number) => void; onRemove: () => void }) {
  const product = getProduct(line.productId);
  if (!product) return null;
  const store = line.fulfillment.type === 'pickup' ? getStore(line.fulfillment.storeId) : undefined;
  return (
    <Card style={{ flexDirection: 'row', gap: 12 }}>
      <ProductArt emoji={product.emoji} image={productImage(product.id)} tint={product.tint} size={72} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '700', color: colors.ink }}>{product.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
          <Ionicons name={store ? 'location' : 'cube-outline'} size={13} color={store ? colors.green : colors.muted} />
          <Text style={[type.small, { flexShrink: 1 }]}>{store ? `Pickup · ${store.name}` : 'Ships to you'}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
          <View style={styles.stepper}>
            <Pressable testID={`dec-${line.id}`} accessibilityLabel="Decrease quantity" onPress={() => onQty(line.qty - 1)} style={styles.stepBtn}>
              <Ionicons name={line.qty === 1 ? 'trash-outline' : 'remove'} size={16} color={colors.ink} />
            </Pressable>
            <Text style={{ minWidth: 24, textAlign: 'center', fontWeight: '700', color: colors.ink }}>{line.qty}</Text>
            <Pressable accessibilityLabel="Increase quantity" onPress={() => onQty(line.qty + 1)} style={styles.stepBtn}>
              <Ionicons name="add" size={16} color={colors.ink} />
            </Pressable>
          </View>
          <View style={{ flex: 1 }} />
          <Text style={{ fontWeight: '800', color: colors.ink }}>{money(product.price * line.qty)}</Text>
        </View>
      </View>
      <Pressable accessibilityLabel="Remove" onPress={onRemove} hitSlop={8}>
        <Ionicons name="close" size={18} color={colors.muted} />
      </Pressable>
    </Card>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ color: bold ? colors.ink : colors.muted, fontWeight: bold ? '800' : '500', fontSize: bold ? 16 : 14 }}>{label}</Text>
      <Text style={{ color: colors.ink, fontWeight: bold ? '800' : '600', fontSize: bold ? 16 : 14 }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill },
  stepBtn: { padding: 8 },
});
