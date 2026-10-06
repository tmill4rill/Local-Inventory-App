import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '../src/components/Toast';
import { LookCollage, ProductPhoto } from '../src/components/ui';
import { productImage } from '../src/data/productImages';
import { getProduct, OCCASION_LABEL, PRODUCTS, type Occasion } from '../src/data/products';
import type { Category } from '../src/data/stores';
import { formatDistance } from '../src/lib/geo';
import { availabilityFor, withinRadius } from '../src/lib/inventory';
import { dayKey, DAILY_OCCASIONS, fromDayKey, isCold, SLOT_ORDER, suggestLook, weatherFor, weekOf } from '../src/lib/styling';
import { useApp } from '../src/state/AppState';
import { useReserveLook } from '../src/state/useReserveLook';
import { money, radius } from '../src/theme';

/** The builder is dark, like Alta's outfit editor, so the pale packshots pop. */
const D = { bg: '#0F0F0F', panel: '#1B1B1B', line: '#2A2A2A', ink: '#F4F4F2', muted: '#8E8E89', box: '#FFFFFF' };

const SLOT_LABEL: Record<Category, string> = {
  Outerwear: 'Outerwear',
  Tops: 'Tops',
  Dresses: 'Dresses',
  Bottoms: 'Bottoms',
  Shoes: 'Shoes',
  Bags: 'Bags',
  Jewelry: 'Jewelry',
  Accessories: 'Accessories',
};

export default function LookBuilder() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string; day?: string; title?: string; items?: string; anchor?: string }>();
  const { looks, saveLook, place, radiusMi, unit, closet, owns } = useApp();
  const reserve = useReserveLook();
  const [toast, showToast] = useToast();
  const existing = params.id ? looks.find((l) => l.id === params.id) : undefined;
  const [day, setDay] = useState(existing?.day ?? params.day ?? dayKey(new Date()));
  const cold = isCold(weatherFor(day, place.coord));
  const anchorProduct = params.anchor ? getProduct(params.anchor) : undefined;
  const [occasion, setOccasion] = useState<Occasion>(anchorProduct?.occasions[0] ?? 'work');

  const initial = useMemo(() => {
    if (existing) return existing.items;
    if (params.items) return params.items.split(',').filter((id) => !!getProduct(id));
    const s = suggestLook({ occasion, from: place.coord, radiusMi, cold, seed: `builder|${day}`, anchor: params.anchor ? [params.anchor] : undefined });
    return s?.items ?? (params.anchor ? [params.anchor] : []);
    // Only on first render: later changes are the user's edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [items, setItems] = useState<string[]>(initial);
  const [title, setTitle] = useState(
    existing?.title ?? params.title ?? (anchorProduct ? `Styling the ${anchorProduct.name}` : DAILY_OCCASIONS.find((o) => o.key === occasion)!.title),
  );
  const [hidden, setHidden] = useState<Category[]>([]);

  const restyle = (o: Occasion) => {
    setOccasion(o);
    if (!params.id && !params.items) setTitle(DAILY_OCCASIONS.find((x) => x.key === o)!.title);
    const s = suggestLook({ occasion: o, from: place.coord, radiusMi, cold, seed: `builder|${day}|${o}`, anchor: params.anchor ? [params.anchor] : undefined });
    if (s) setItems(s.items);
  };

  const closetIds = new Set(closet.map((c) => c.productId));
  const options = (cat: Category) =>
    PRODUCTS.filter((p) => p.category === cat)
      .map((p) => {
        const near = withinRadius(availabilityFor(p, place.coord), radiusMi)[0];
        return { p, near, mine: closetIds.has(p.id) };
      })
      .filter((o) => o.near || o.mine || items.includes(o.p.id))
      .sort((a, b) => Number(items.includes(b.p.id)) - Number(items.includes(a.p.id)) || Number(b.mine) - Number(a.mine) || (a.near?.distanceMi ?? 99) - (b.near?.distanceMi ?? 99));

  const choose = (id: string) => {
    const p = getProduct(id)!;
    setItems((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      let next = cur.filter((x) => getProduct(x)!.category !== p.category);
      // A dress replaces separates, and separates replace a dress.
      if (p.category === 'Dresses') next = next.filter((x) => !['Tops', 'Bottoms'].includes(getProduct(x)!.category));
      if (p.category === 'Tops' || p.category === 'Bottoms') next = next.filter((x) => getProduct(x)!.category !== 'Dresses');
      return [...next, id].sort((a, b) => SLOT_ORDER.indexOf(getProduct(a)!.category) - SLOT_ORDER.indexOf(getProduct(b)!.category));
    });
  };

  const toggleHidden = (cat: Category) => {
    setHidden((h) => (h.includes(cat) ? h.filter((c) => c !== cat) : [...h, cat]));
    setItems((cur) => cur.filter((x) => getProduct(x)!.category !== cat));
  };

  const toBuy = items.filter((id) => !owns(id));
  const total = toBuy.reduce((n, id) => n + (getProduct(id)?.price ?? 0), 0);

  const save = () => {
    saveLook({ id: existing?.id, day, title: title.trim() || 'Untitled look', items });
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: D.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 130 + insets.bottom }}>
        <View style={styles.top}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.round}>
            <Ionicons name="chevron-back" size={20} color={D.ink} />
          </Pressable>
          <View style={styles.preview}>
            <LookCollage items={items} height={118} style={{ backgroundColor: D.bg }} />
          </View>
          <Pressable testID="save-look" accessibilityRole="button" disabled={!items.length} onPress={save} style={[styles.save, !items.length && { opacity: 0.4 }]}>
            <Ionicons name="checkmark" size={17} color="#000" />
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
        </View>

        <View style={styles.block}>
          <TextInput testID="look-title" value={title} onChangeText={setTitle} style={styles.title} placeholder="Name this look" placeholderTextColor={D.muted} accessibilityLabel="Look name" />
          <Text style={styles.label}>Show on calendar</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {weekOf(new Date()).concat(weekOf(new Date(Date.now() + 7 * 864e5))).map((d) => {
              const k = dayKey(d);
              const on = k === day;
              return (
                <Pressable key={k} testID={`look-day-${k}`} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => setDay(k)} style={[styles.dayChip, on && styles.dayChipOn]}>
                  <Text style={[styles.dayChipText, on && { color: '#000' }]}>{d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          {!params.id && !params.items ? (
            <>
              <Text style={[styles.label, { marginTop: 14 }]}>Occasion</Text>
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                {(Object.keys(OCCASION_LABEL) as Occasion[]).map((o) => (
                  <Pressable key={o} testID={`occasion-${o}`} accessibilityRole="button" accessibilityState={{ selected: o === occasion }} onPress={() => restyle(o)} style={[styles.dayChip, o === occasion && styles.dayChipOn]}>
                    <Text style={[styles.dayChipText, o === occasion && { color: '#000' }]}>{OCCASION_LABEL[o]}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}
        </View>

        {SLOT_ORDER.map((cat) => {
          const opts = options(cat);
          const isHidden = hidden.includes(cat);
          return (
            <View key={cat} style={styles.slot} testID={`slot-${cat}`}>
              <View style={styles.slotHead}>
                <View style={{ width: 60 }} />
                <Text style={[styles.slotTitle, isHidden && { color: D.muted }]}>{SLOT_LABEL[cat]}</Text>
                <Pressable accessibilityRole="button" accessibilityLabel={isHidden ? `Show ${cat}` : `Hide ${cat}`} onPress={() => toggleHidden(cat)} style={styles.hide} hitSlop={6}>
                  <Ionicons name={isHidden ? 'eye-outline' : 'eye-off-outline'} size={15} color={D.muted} />
                  <Text style={styles.hideText}>{isHidden ? 'show' : 'hide'}</Text>
                </Pressable>
              </View>
              {isHidden ? null : opts.length === 0 ? (
                <Text style={styles.none}>Nothing within {formatDistance(radiusMi, unit)}</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.opts}>
                  {opts.map(({ p, near, mine }) => {
                    const on = items.includes(p.id);
                    return (
                      <Pressable
                        key={p.id}
                        testID={`opt-${p.id}`}
                        accessibilityRole="button"
                        accessibilityState={{ selected: on }}
                        accessibilityLabel={`${p.brand} ${p.name}${mine ? ', in your closet' : near ? `, ${formatDistance(near.distanceMi, unit)} away` : ''}`}
                        onPress={() => choose(p.id)}
                        style={[styles.opt, on && styles.optOn]}
                      >
                        <ProductPhoto image={productImage(p.id)} emoji={p.emoji} tint={p.tint} emojiSize={30} style={styles.optImg} />
                        <Text style={styles.optMeta} numberOfLines={1}>{mine ? 'Yours' : money(p.price)}</Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.footTotal}>{toBuy.length ? money(total) : 'All from your closet'}</Text>
          <Text style={styles.footMeta}>
            {items.length} {items.length === 1 ? 'piece' : 'pieces'}
            {items.length - toBuy.length ? ` · ${items.length - toBuy.length} yours` : ''} · {fromDayKey(day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </Text>
        </View>
        <Pressable
          testID="reserve-look"
          accessibilityRole="button"
          disabled={!toBuy.length}
          onPress={() => showToast({ text: reserve(toBuy), action: { label: 'View bag', onPress: () => router.push('/cart') } })}
          style={[styles.reserve, !toBuy.length && { opacity: 0.4 }]}
        >
          <Text style={styles.reserveText}>Reserve for pickup</Text>
        </Pressable>
      </View>
      {toast}
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 16 },
  round: { width: 40, height: 40, borderRadius: 20, backgroundColor: D.panel, alignItems: 'center', justifyContent: 'center' },
  preview: { width: 120 },
  save: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: D.box, borderRadius: radius.pill, paddingVertical: 10, paddingHorizontal: 18 },
  saveText: { color: '#000', fontSize: 15, fontWeight: '600' },
  block: { paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: D.line, marginTop: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: D.line },
  title: { color: D.ink, fontSize: 20, fontWeight: '600', paddingVertical: 4, marginBottom: 12 },
  label: { color: D.muted, fontSize: 13, marginBottom: 8 },
  dayChip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: D.panel },
  dayChipOn: { backgroundColor: D.box },
  dayChipText: { color: D.ink, fontSize: 13 },
  slot: { paddingTop: 20 },
  slotHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 10 },
  slotTitle: { color: D.ink, fontSize: 14 },
  hide: { width: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  hideText: { color: D.muted, fontSize: 13 },
  none: { color: D.muted, fontSize: 13, textAlign: 'center' },
  opts: { paddingHorizontal: 16, gap: 10 },
  opt: { width: 92, padding: 3, borderRadius: 4, borderWidth: 1.5, borderColor: 'transparent', opacity: 0.55 },
  optOn: { borderColor: D.box, opacity: 1 },
  optImg: { width: '100%', aspectRatio: 1, borderRadius: 2 },
  optMeta: { color: D.ink, fontSize: 11, textAlign: 'center', marginTop: 4 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 12, backgroundColor: 'rgba(15,15,15,0.96)', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: D.line },
  footTotal: { color: D.ink, fontSize: 17, fontWeight: '700' },
  footMeta: { color: D.muted, fontSize: 12, marginTop: 2 },
  reserve: { backgroundColor: D.box, borderRadius: radius.pill, paddingVertical: 13, paddingHorizontal: 18 },
  reserveText: { color: '#000', fontSize: 15, fontWeight: '600' },
});
