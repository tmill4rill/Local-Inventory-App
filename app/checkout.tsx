import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Chip, Empty, Label } from '../src/components/ui';
import { getStore } from '../src/data/stores';
import { distanceMiles, formatDistance } from '../src/lib/geo';
import { generateSlots } from '../src/lib/pickup';
import { groupTotal, useApp, type CartLine, type Fulfillment } from '../src/state/AppState';
import { colors, money, type } from '../src/theme';

type Group = { key: string; fulfillment: Fulfillment; lines: CartLine[] };

export default function Checkout() {
  const { cart, place, unit, placeOrders } = useApp();
  const [slots, setSlots] = useState<Record<string, string>>({});
  const [dayIdx, setDayIdx] = useState<Record<string, number>>({});
  const now = useMemo(() => new Date(), []);

  const groups = useMemo<Group[]>(() => {
    const map = new Map<string, Group>();
    for (const line of cart) {
      const key = line.fulfillment.type === 'ship' ? 'ship' : `pickup:${line.fulfillment.storeId}`;
      const g = map.get(key) ?? { key, fulfillment: line.fulfillment, lines: [] };
      g.lines.push(line);
      map.set(key, g);
    }
    return [...map.values()];
  }, [cart]);

  if (groups.length === 0) return <Empty icon="bag-outline" title="Nothing to check out" body="Your bag is empty." />;

  const pickupGroups = groups.filter((g) => g.fulfillment.type === 'pickup');
  const ready = pickupGroups.every((g) => slots[g.key]);
  const total = groups.reduce((sum, g) => sum + groupTotal(g.fulfillment, g.lines), 0);

  const submit = () => {
    const orders = placeOrders({
      groups: groups.map((g) => ({ fulfillment: g.fulfillment, slotISO: slots[g.key], lines: g.lines })),
    });
    if (orders.length === 1) router.replace(`/order/${orders[0].id}?new=1`);
    else router.replace('/orders');
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14 }}>
      {groups.map((g) => {
        if (g.fulfillment.type === 'ship') {
          return (
            <Card key={g.key} style={{ gap: 6 }}>
              <Label>Shipping</Label>
              <Text style={styles.h}>Ships to you · 3–5 days</Text>
              <Text style={type.small}>{g.lines.length} {g.lines.length === 1 ? 'item' : 'items'} · {money(groupTotal(g.fulfillment, g.lines))} incl. shipping</Text>
            </Card>
          );
        }
        const store = getStore(g.fulfillment.storeId)!;
        const days = generateSlots(store.hours, now);
        const idx = Math.min(dayIdx[g.key] ?? 0, days.length - 1);
        return (
          <Card key={g.key} style={{ gap: 8 }}>
            <Label>Pickup</Label>
            <Text style={styles.h}>{store.name}</Text>
            <Text style={type.small}>
              {store.address} · {formatDistance(distanceMiles(place.coord, store.coord), unit)} away
            </Text>
            <View style={styles.exp}>
              <Ionicons name="sparkles" size={16} color={colors.accent} />
              <Text style={{ flex: 1, color: colors.ink, fontSize: 13 }}>
                <Text style={{ fontWeight: '800' }}>{store.experience.title}. </Text>
                {store.experience.detail}
              </Text>
            </View>
            <Text style={[type.small, { marginTop: 6, fontWeight: '700' }]}>When will you come?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {days.map((d, i) => (
                <Chip key={d.key} label={d.label} selected={i === idx} onPress={() => setDayIdx((s) => ({ ...s, [g.key]: i }))} />
              ))}
            </ScrollView>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {days[idx]?.slots.map((s) => (
                <Pressable
                  key={s.iso}
                  testID={`slot-${g.key}-${s.label}`}
                  accessibilityRole="button"
                  onPress={() => setSlots((st) => ({ ...st, [g.key]: s.iso }))}
                  style={[styles.slot, slots[g.key] === s.iso && { backgroundColor: colors.accent, borderColor: colors.accent }]}
                >
                  <Text style={[styles.slotText, slots[g.key] === s.iso && { color: '#fff' }]}>{s.label}</Text>
                </Pressable>
              ))}
            </View>
          </Card>
        );
      })}

      <Card style={{ gap: 4 }}>
        <Text style={styles.h}>Total {money(total)}</Text>
        <Text style={type.small}>Demo checkout — no payment is taken. You'll get a pickup code to show in store.</Text>
      </Card>
      <Button testID="place-order" label={ready ? 'Place order' : 'Pick a time for each pickup'} disabled={!ready} onPress={submit} icon="checkmark-circle-outline" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  h: { fontSize: 17, fontWeight: '800', color: colors.ink },
  exp: { flexDirection: 'row', gap: 8, padding: 10, borderRadius: 10, backgroundColor: colors.accentSoft, marginTop: 4 },
  slot: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  slotText: { fontWeight: '700', color: colors.ink, fontSize: 13 },
});
