import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Empty, Label, ProductArt } from '../../src/components/ui';
import { getProduct } from '../../src/data/products';
import { getStore } from '../../src/data/stores';
import { directionsUrl } from '../../src/lib/geo';
import { formatSlot } from '../../src/lib/pickup';
import { inviteMessage, shareText, type ShareResult } from '../../src/lib/share';
import { FRIENDS, STATUS_LABEL, useApp, type OrderStatus } from '../../src/state/AppState';
import { colors, money, radius, type } from '../../src/theme';
import { productImage } from '../../src/data/productImages';

const STEPS: OrderStatus[] = ['placed', 'ready', 'picked_up'];

export default function OrderDetail() {
  const { id, new: isNew } = useLocalSearchParams<{ id: string; new?: string }>();
  const { orders, toggleInvite, advanceOrder } = useApp();
  const [shareNote, setShareNote] = useState<ShareResult | null>(null);
  const order = orders.find((o) => o.id === id);
  if (!order) return <Empty icon="alert-circle-outline" title="Order not found" body="This order is no longer available." />;

  const store = order.fulfillment.type === 'pickup' ? getStore(order.fulfillment.storeId) : undefined;
  const stepIdx = STEPS.indexOf(order.status);
  const itemSummary = order.lines
    .map((l) => getProduct(l.productId)?.name)
    .filter(Boolean)
    .join(', ');

  const invite = async () => {
    if (!store) return;
    const names = FRIENDS.filter((f) => order.invited.includes(f.id)).map((f) => f.name);
    setShareNote(await shareText(inviteMessage({ code: order.code, store, slotISO: order.slotISO, friendNames: names, itemSummary })));
  };

  return (
    <>
      <Stack.Screen options={{ title: store ? 'Your pickup' : 'Your order' }} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 14 }}>
        {isNew ? (
          <View style={styles.banner}>
            <Ionicons name="checkmark-circle" size={22} color={colors.green} />
            <Text style={{ flex: 1, fontWeight: '700', color: colors.ink }}>
              {store ? "You're all set. Now bring a friend along." : 'Order placed. It will ship soon.'}
            </Text>
          </View>
        ) : null}

        {store ? (
          <>
            <View style={styles.ticket}>
              <Text style={styles.ticketLabel}>Pickup code</Text>
              <Text testID="pickup-code" style={styles.code}>{order.code}</Text>
              <Text style={styles.ticketSub}>Show this at {store.experience.title === 'Concierge pickup' ? 'the concierge desk' : 'the counter'}</Text>
              <View style={styles.perforation} />
              <Text style={styles.ticketStore}>{store.name}</Text>
              <Text style={styles.ticketSub}>{store.address} · {store.area}</Text>
              {order.slotISO ? <Text style={styles.ticketWhen}>{formatSlot(order.slotISO)}</Text> : null}
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button style={{ flex: 1 }} variant="secondary" icon="navigate-outline" label="Directions" onPress={() => Linking.openURL(directionsUrl(store.coord))} />
              <Button testID="advance" style={{ flex: 1 }} variant="ghost" label="Advance (demo)" onPress={() => advanceOrder(order.id)} disabled={order.status === 'picked_up'} />
            </View>

            <Card>
              <Label>Status</Label>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                {STEPS.map((s, i) => (
                  <React.Fragment key={s}>
                    <View style={{ alignItems: 'center', width: 76 }}>
                      <View style={[styles.dot, i <= stepIdx && { backgroundColor: colors.green, borderColor: colors.green }]}>
                        {i <= stepIdx ? <Ionicons name="checkmark" size={14} color={colors.onAccent} /> : null}
                      </View>
                      <Text testID={`step-${s}`} style={[styles.stepText, i === stepIdx && { color: colors.ink, fontWeight: '800' }]}>{STATUS_LABEL[s]}</Text>
                    </View>
                    {i < STEPS.length - 1 ? <View style={[styles.line, i < stepIdx && { backgroundColor: colors.green }]} /> : null}
                  </React.Fragment>
                ))}
              </View>
            </Card>

            <Card style={{ gap: 10 }}>
              <Label>Go with a friend</Label>
              <Text style={type.body}>Pickup is better with company. Pick who's coming and send them the details.</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {FRIENDS.map((f) => {
                  const on = order.invited.includes(f.id);
                  return (
                    <Pressable
                      key={f.id}
                      testID={`friend-${f.id}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                      onPress={() => toggleInvite(order.id, f.id)}
                      style={[styles.friend, on && { backgroundColor: colors.accentSoft, borderColor: colors.accent }]}
                    >
                      <Text style={{ fontSize: 20 }}>{f.emoji}</Text>
                      <Text style={{ fontWeight: '700', color: colors.ink }}>{f.name}</Text>
                      {on ? <Ionicons name="checkmark-circle" size={16} color={colors.accent} /> : null}
                    </Pressable>
                  );
                })}
              </View>
              <Button testID="send-invite" icon="paper-plane-outline" label={order.invited.length ? `Invite ${order.invited.length} to come along` : 'Share with anyone'} onPress={invite} />
              {shareNote === 'copied' ? <Text testID="share-note" style={styles.note}>Invite copied. Paste it into any chat.</Text> : null}
              {shareNote === 'shared' ? <Text testID="share-note" style={styles.note}>Invite sent.</Text> : null}
              {shareNote === 'failed' ? <Text style={[styles.note, { color: colors.amber }]}>Couldn't open sharing on this device.</Text> : null}
            </Card>
          </>
        ) : (
          <Card>
            <Label>Status</Label>
            <Text style={type.h2}>{STATUS_LABEL[order.status]}</Text>
          </Card>
        )}

        <Card style={{ gap: 10 }}>
          <Label>Items</Label>
          {order.lines.map((l) => {
            const p = getProduct(l.productId);
            return p ? (
              <View key={l.productId} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <ProductArt emoji={p.emoji} image={productImage(p.id)} tint={p.tint} size={44} />
                <Text style={{ flex: 1, fontWeight: '600', color: colors.ink }}>{p.name} × {l.qty}</Text>
                <Text style={{ fontWeight: '700', color: colors.ink }}>{money(l.price * l.qty)}</Text>
              </View>
            ) : null;
          })}
          <View style={{ height: 1, backgroundColor: colors.border }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '800', color: colors.ink }}>Total</Text>
            <Text style={{ fontWeight: '800', color: colors.ink }}>{money(order.total)}</Text>
          </View>
        </Card>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 14, borderRadius: radius.md, backgroundColor: colors.greenSoft },
  ticket: { backgroundColor: colors.ink, borderRadius: radius.lg, padding: 22, alignItems: 'center' }, // light paper ticket on the black floor
  ticketLabel: { color: '#5E5E58', fontSize: 13, fontWeight: '700' },
  code: { color: colors.onAccent, fontSize: 40, fontWeight: '800', letterSpacing: 4, marginVertical: 6 },
  ticketSub: { color: '#5E5E58', fontSize: 13, textAlign: 'center' },
  perforation: { alignSelf: 'stretch', borderTopWidth: 2, borderStyle: 'dashed', borderColor: '#BDBDB6', marginVertical: 16 },
  ticketStore: { color: colors.onAccent, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  ticketWhen: { color: colors.onAccent, fontSize: 16, fontWeight: '800', marginTop: 8, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#E2E2DC', overflow: 'hidden' },
  dot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.raised },
  line: { flex: 1, height: 2, backgroundColor: colors.border, marginTop: 11 },
  stepText: { fontSize: 11, color: colors.muted, marginTop: 6, textAlign: 'center' },
  friend: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  note: { fontSize: 13, color: colors.green, fontWeight: '600', textAlign: 'center' },
});
