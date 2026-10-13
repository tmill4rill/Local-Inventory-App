import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '../../src/components/Toast';
import { Divider, LookCollage } from '../../src/components/ui';
import { WeekStrip } from '../../src/components/WeekStrip';
import { formatDistance, distanceMiles } from '../../src/lib/geo';
import { DAILY_OCCASIONS, dayKey, fromDayKey, isCold, suggestDay, weatherFor, weekOf } from '../../src/lib/styling';
import { getStore } from '../../src/data/stores';
import { getProduct } from '../../src/data/products';
import { FEATURED_CLIP_ID, productClip } from '../../src/data/productClips';
import { availabilityFor, withinRadius } from '../../src/lib/inventory';
import { Develop, Dots, FloatingPill, PeekCarousel, PressScale, PreviewVideo, Reveal } from '../../src/motion';
import { useApp } from '../../src/state/AppState';
import { useReserveLook } from '../../src/state/useReserveLook';
import { colors, fonts, money, radius, space, TABBAR_SPACE, type } from '../../src/theme';

const greeting = (d: Date) => (d.getHours() < 12 ? 'Good morning' : d.getHours() < 17 ? 'Good afternoon' : 'Good evening');

/** Version A, "Atelier": Doji's centred hero rail of looks, a looping in-the-round preview, ivory and serif. */

export default function Today() {
  const insets = useSafeAreaInsets();
  const { place, radiusMi, unit, looks, saveLook, cartCount } = useApp();
  const reserve = useReserveLook();
  const [toast, showToast] = useToast();
  const now = new Date();
  const [selected, setSelected] = useState(dayKey(now));
  const selDate = fromDayKey(selected);
  const days = useMemo(() => weekOf(now), [dayKey(now)]);
  const weather = weatherFor(selected, place.coord);
  const cold = isCold(weather);
  const saved = looks.find((l) => l.day === selected);
  const isToday = selected === dayKey(now);
  const dayLabel = isToday ? 'today' : selDate.toLocaleDateString('en-US', { weekday: 'long' });

  const { width } = useWindowDimensions();
  const cardW = Math.min(width, 520) - 56;
  const [active, setActive] = useState(0);
  const scroll = useRef<ScrollView>(null);
  const heroY = useRef(0);

  const featured = getProduct(FEATURED_CLIP_ID);
  const clip = productClip(FEATURED_CLIP_ID);
  const featuredNear = useMemo(() => (featured ? withinRadius(availabilityFor(featured, place.coord), radiusMi)[0] : undefined), [featured, place, radiusMi]);

  const suggestions = useMemo(
    () =>
      suggestDay(DAILY_OCCASIONS, { from: place.coord, radiusMi, cold, seed: `${selected}|${place.label}` }).filter((s) => s.look),
    [selected, place, radiusMi, cold],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView ref={scroll} contentContainerStyle={{ paddingTop: insets.top + 6, paddingBottom: TABBAR_SPACE + insets.bottom + 40 }}>
        <View style={styles.header}>
          <Pressable testID="open-settings" accessibilityRole="button" accessibilityLabel="Settings" onPress={() => router.push('/profile')} hitSlop={8}>
            <Ionicons name="options-outline" size={21} color={colors.ink} />
          </Pressable>
          <Text style={styles.wordmark}>LocalPick</Text>
          <Pressable testID="open-bag" accessibilityRole="button" accessibilityLabel={`Bag, ${cartCount} items`} onPress={() => router.push('/cart')} hitSlop={8}>
            <Ionicons name="bag-outline" size={21} color={colors.ink} />
            {cartCount ? (
              <View style={styles.count}>
                <Text style={styles.countText}>{cartCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        <Reveal index={0} style={styles.greetRow}>
          <View style={{ flexShrink: 1 }}>
            <Text style={type.overline}>{isToday ? selDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Planning ahead'}</Text>
            <Text style={styles.greet}>{isToday ? `${greeting(now)}.` : selDate.toLocaleDateString('en-US', { weekday: 'long' })}</Text>
            <Pressable onPress={() => router.push('/profile')} accessibilityRole="button" accessibilityLabel={`Picking up near ${place.label} within ${radiusMi} miles. Change`}>
              <Text style={type.small}>
                Dressed from shelves near {place.label} · {formatDistance(radiusMi, unit)}
              </Text>
            </Pressable>
          </View>
          <View style={styles.weather} accessibilityLabel={`${weather.label}, ${weather.tempF} degrees, high ${weather.highF}, low ${weather.lowF}`}>
            <Text style={styles.temp}>{weather.tempF}°</Text>
            <Text style={styles.hl}>
              {weather.label} · H{weather.highF}° L{weather.lowF}°
            </Text>
          </View>
        </Reveal>

        <Reveal index={1}>
          <WeekStrip days={days} selected={selected} onSelect={(d) => { setSelected(d); setActive(0); }} looks={looks} />
        </Reveal>

        <View style={{ paddingHorizontal: space.lg }} onLayout={(e) => (heroY.current = e.nativeEvent.layout.y)}>
          <Divider label={isToday ? "Today's suggestions" : `Suggestions for ${dayLabel}`} />
        </View>

        {suggestions.length === 0 ? (
          <Text style={[type.small, { textAlign: 'center', paddingHorizontal: 32 }]}>
            Not enough on shelves within {formatDistance(radiusMi, unit)} to build a look. Widen your range in Settings.
          </Text>
        ) : (
          <Develop runKey={`${selected}|${place.label}|${radiusMi}`} veil={colors.veil}>
            <PeekCarousel
              testID="look-rail"
              data={suggestions}
              keyOf={(s) => s.key}
              itemWidth={cardW}
              gap={10}
              onIndexChange={setActive}
              renderItem={({ key, title, dress, look }) => {
                const one = look!.oneStop ? getStore(look!.oneStop) : undefined;
                return (
                  <View testID={`suggestion-${key}`} style={styles.lookCard}>
                    <PressScale
                      accessibilityRole="button"
                      accessibilityLabel={`Open ${title} look`}
                      onPress={() => router.push({ pathname: '/look', params: { day: selected, title, items: look!.items.join(',') } })}
                    >
                      <LookCollage items={look!.items} height={Math.round(cardW * 1.12)} />
                    </PressScale>
                    <View style={styles.lookBody}>
                      <Text style={type.overline}>{dress}</Text>
                      <View style={styles.lookTitleRow}>
                        <Text style={styles.lookTitle} numberOfLines={1}>{title}</Text>
                        <Text style={styles.total}>{money(look!.total)}</Text>
                      </View>
                      <View style={styles.where}>
                        <View style={[styles.dot, { backgroundColor: one ? colors.green : colors.amber }]} />
                        <Text style={styles.whereText} numberOfLines={1}>
                          {one ? `All at ${one.name} · ${formatDistance(distanceMiles(place.coord, one.coord), unit)}` : 'From a couple of stores nearby'}
                        </Text>
                      </View>
                      <View style={styles.cardActions}>
                        <Pressable
                          testID={`save-${key}`}
                          style={[styles.smallBtn, styles.smallBtnLight]}
                          accessibilityRole="button"
                          onPress={() => {
                            saveLook({ id: saved?.id, day: selected, title, items: look!.items });
                            showToast({ text: `Saved look to ${isToday ? 'today' : dayLabel}` });
                          }}
                        >
                          <Text style={styles.smallBtnLightText}>{saved ? (isToday ? 'Wear today' : 'Wear this day') : `Save to ${isToday ? 'today' : dayLabel}`}</Text>
                        </Pressable>
                        <Pressable
                          testID={`reserve-${key}`}
                          style={styles.smallBtn}
                          accessibilityRole="button"
                          onPress={() => showToast({ text: reserve(look!.items), action: { label: 'View bag', onPress: () => router.push('/cart') } })}
                        >
                          <Text style={styles.smallBtnText}>{one ? 'Reserve · 1 stop' : 'Reserve all'}</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              }}
            />
            <View style={{ marginTop: 14 }}>
              <Dots count={suggestions.length} index={active} color={colors.ink} idle={colors.faint} />
            </View>
          </Develop>
        )}

        {featured && clip ? (
          <Reveal index={3} style={styles.section}>
            <Divider label="In the round" />
            <PressScale
              testID="featured-clip"
              accessibilityRole="button"
              accessibilityLabel={`${featured.brand} ${featured.name}, ${clip.label} preview`}
              onPress={() => router.push(`/product/${featured.id}`)}
              to={0.985}
            >
              <PreviewVideo source={clip.video} webm={clip.webm} poster={clip.poster} style={styles.clip} />
              <View style={styles.clipChip}>
                <View style={[styles.dot, { backgroundColor: colors.gold }]} />
                <Text style={styles.clipChipText}>{clip.label} PREVIEW</Text>
              </View>
            </PressScale>
            <View style={styles.clipBody}>
              <View style={{ flex: 1 }}>
                <Text style={type.overline}>{featured.brand}</Text>
                <Text style={styles.clipName} numberOfLines={1}>{featured.name}</Text>
                <Text style={type.small} numberOfLines={1}>
                  {featuredNear ? `Turn it over in person · ${featuredNear.store.name}, ${formatDistance(featuredNear.distanceMi, unit)}` : 'Not on shelves in your range today'}
                </Text>
              </View>
              <Text style={styles.total}>{money(featured.price)}</Text>
            </View>
          </Reveal>
        ) : null}

        {saved ? (
          <Reveal index={4} style={styles.section}>
            <Divider label={`Planned for ${dayLabel}`} />
            <View style={styles.cardHead}>
              <Text style={styles.lookTitle}>{saved.title}</Text>
            </View>
            <PressScale accessibilityRole="button" accessibilityLabel={`Edit ${saved.title}`} onPress={() => router.push({ pathname: '/look', params: { id: saved.id } })} to={0.985}>
              <LookCollage items={saved.items} height={260} />
            </PressScale>
            <View style={styles.cardActions}>
              <Pressable style={[styles.smallBtn, styles.smallBtnLight]} accessibilityRole="button" onPress={() => router.push({ pathname: '/look', params: { id: saved.id } })}>
                <Text style={styles.smallBtnLightText}>Edit look</Text>
              </Pressable>
              <Pressable
                testID="reserve-saved"
                style={styles.smallBtn}
                accessibilityRole="button"
                onPress={() => showToast({ text: reserve(saved.items), action: { label: 'View bag', onPress: () => router.push('/cart') } })}
              >
                <Text style={styles.smallBtnText}>Reserve for pickup</Text>
              </Pressable>
            </View>
          </Reveal>
        ) : null}

        <Reveal index={5} style={styles.actions}>
          <Pressable testID="add-look" accessibilityRole="button" style={styles.pill} onPress={() => router.push({ pathname: '/look', params: { day: selected } })}>
            <Ionicons name="add" size={18} color={colors.ink} />
            <Text style={styles.pillText}>Build a look</Text>
          </Pressable>
          <Pressable testID="ask-stylist" accessibilityRole="button" style={styles.pill} onPress={() => router.push('/stylist')}>
            <Ionicons name="sparkles-outline" size={16} color={colors.ink} />
            <Text style={styles.pillText}>Ask the stylist</Text>
          </Pressable>
        </Reveal>
      </ScrollView>
      {suggestions.length ? (
        <FloatingPill
          testID="new-looks"
          label="New looks"
          count={suggestions.length}
          bottom={TABBAR_SPACE + insets.bottom - 8}
          bg={colors.ink}
          fg={colors.onAccent}
          badge="#B3261E"
          labelStyle={{ fontFamily: fonts.serif }}
          onPress={() => scroll.current?.scrollTo({ y: heroY.current, animated: true })}
        />
      ) : null}
      {toast}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, paddingBottom: 10 },
  wordmark: { fontFamily: fonts.serif, fontSize: 24, letterSpacing: -0.4, color: colors.ink },
  count: { position: 'absolute', top: -6, right: -8, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  countText: { color: colors.onAccent, fontSize: 10, fontWeight: '700' },
  greetRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: space.lg, marginTop: 14, marginBottom: 16, gap: 12 },
  greet: { fontFamily: fonts.serif, fontSize: 34, color: colors.ink, letterSpacing: -0.8, marginTop: 4, marginBottom: 2 },
  weather: { alignItems: 'flex-end' },
  temp: { fontFamily: fonts.serif, fontSize: 30, color: colors.ink },
  hl: { fontSize: 11, color: colors.muted },
  lookCard: { backgroundColor: colors.card, borderRadius: radius.lg, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  lookBody: { padding: 14, gap: 4 },
  lookTitleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 },
  lookTitle: { fontFamily: fonts.serif, fontSize: 22, color: colors.ink, letterSpacing: -0.3, flexShrink: 1 },
  section: { paddingHorizontal: space.lg, marginTop: 18 },
  cardHead: { marginBottom: 10 },
  where: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  whereText: { flex: 1, fontSize: 13, color: colors.ink },
  total: { fontSize: 14, fontWeight: '600', color: colors.ink },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  smallBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: radius.pill, backgroundColor: colors.accent },
  smallBtnText: { color: colors.onAccent, fontSize: 14, fontWeight: '600' },
  smallBtnLight: { backgroundColor: colors.raised },
  smallBtnLightText: { color: colors.ink, fontSize: 14, fontWeight: '500' },
  clip: { width: '100%', aspectRatio: 1, borderRadius: radius.lg, backgroundColor: colors.tile },
  clipChip: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.glass, borderRadius: radius.pill, paddingVertical: 5, paddingHorizontal: 10 },
  clipChipText: { fontSize: 10.5, fontWeight: '700', letterSpacing: 1.4, color: colors.ink },
  clipBody: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginTop: 12 },
  clipName: { fontFamily: fonts.serif, fontSize: 22, color: colors.ink, letterSpacing: -0.3, marginTop: 2, marginBottom: 2 },
  actions: { flexDirection: 'row', gap: 10, paddingHorizontal: space.lg, marginTop: 26 },
  pill: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13, borderRadius: radius.pill, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.ink },
  pillText: { fontSize: 14, fontWeight: '500', color: colors.ink },
});
