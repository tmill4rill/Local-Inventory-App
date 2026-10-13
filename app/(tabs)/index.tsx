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
import { onColor } from '../../src/data/productImages';
import { availabilityFor, buildListings, withinRadius } from '../../src/lib/inventory';
import { Develop, Dots, Float, FloatingPill, Marquee, PeekCarousel, PressScale, PreviewVideo, Reveal, Spin } from '../../src/motion';
import { useApp } from '../../src/state/AppState';
import { useReserveLook } from '../../src/state/useReserveLook';
import { colors, fonts, money, palette, radius, space, TABBAR_SPACE, type } from '../../src/theme';

const greeting = (d: Date) => (d.getHours() < 12 ? 'Good morning' : d.getHours() < 17 ? 'Good afternoon' : 'Good evening');
const when = (d: Date) => (d.getHours() < 12 ? 'this morning.' : d.getHours() < 17 ? 'today.' : 'tonight.');

/** Each look card gets its own block, cycling through the palette. */
const CARD_COLORS = [palette.cobalt, palette.tomato, palette.lime, palette.blush, palette.sun, palette.lilac];

/** Version B, "Chroma": poster type, colour blocks, a ticker, a floating clip and a peek rail of looks. */

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
  const cardW = Math.min(width, 520) - 64;
  const [active, setActive] = useState(0);
  const scroll = useRef<ScrollView>(null);
  const heroY = useRef(0);

  const featured = getProduct(FEATURED_CLIP_ID);
  const clip = productClip(FEATURED_CLIP_ID);
  const featuredNear = useMemo(() => (featured ? withinRadius(availabilityFor(featured, place.coord), radiusMi)[0] : undefined), [featured, place, radiusMi]);
  const onShelves = useMemo(() => buildListings(place.coord, radiusMi).length, [place, radiusMi]);

  const suggestions = useMemo(
    () =>
      suggestDay(DAILY_OCCASIONS, { from: place.coord, radiusMi, cold, seed: `${selected}|${place.label}` }).filter((s) => s.look),
    [selected, place, radiusMi, cold],
  );

  const ticker = [`On shelves near ${place.label}`, `${onShelves} pieces within ${formatDistance(radiusMi, unit)}`, 'Reserve now, pick up today', 'Try it on in person'];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView ref={scroll} contentContainerStyle={{ paddingTop: insets.top + 6, paddingBottom: TABBAR_SPACE + insets.bottom + 40 }}>
        <View style={styles.header}>
          <Pressable testID="open-settings" accessibilityRole="button" accessibilityLabel="Settings" onPress={() => router.push('/profile')} hitSlop={8} style={styles.iconBtn}>
            <Ionicons name="options-outline" size={20} color={colors.ink} />
          </Pressable>
          <Text style={styles.wordmark}>LOCALPICK</Text>
          <Pressable testID="open-bag" accessibilityRole="button" accessibilityLabel={`Bag, ${cartCount} items`} onPress={() => router.push('/cart')} hitSlop={8} style={styles.iconBtn}>
            <Ionicons name="bag-outline" size={20} color={colors.ink} />
            {cartCount ? (
              <View style={styles.count}>
                <Text style={styles.countText}>{cartCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        <Marquee style={styles.ticker} speed={36}>
          {ticker.map((t) => (
            <Text key={t} style={styles.tickerText}>
              {t.toUpperCase()}  ✺  
            </Text>
          ))}
        </Marquee>

        <Reveal index={0} style={styles.hero}>
          <Text style={styles.big}>
            {isToday ? 'Wear it' : 'Plan it'}
            {'\n'}
            <Text style={styles.bigAccent}>{isToday ? when(now) : `for ${selDate.toLocaleDateString('en-US', { weekday: 'long' })}.`}</Text>
          </Text>
          <View style={styles.heroRow}>
            <Pressable onPress={() => router.push('/profile')} accessibilityRole="button" accessibilityLabel={`Picking up near ${place.label} within ${radiusMi} miles. Change`} style={{ flexShrink: 1 }}>
              <Text style={styles.greetSmall}>
                {isToday ? greeting(now) : selDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · near {place.label}
              </Text>
            </Pressable>
            <View style={styles.weather} accessibilityLabel={`${weather.label}, ${weather.tempF} degrees, high ${weather.highF}, low ${weather.lowF}`}>
              <Ionicons name={weather.icon as never} size={15} color={colors.ink} />
              <Text style={styles.weatherText}>{weather.tempF}°</Text>
            </View>
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
          <Develop runKey={`${selected}|${place.label}|${radiusMi}`} veil={colors.veil} label="Pulling pieces off nearby shelves…">
            <PeekCarousel
              testID="look-rail"
              data={suggestions}
              keyOf={(s) => s.key}
              itemWidth={cardW}
              gap={10}
              minScale={0.84}
              minOpacity={0.6}
              onIndexChange={setActive}
              renderItem={({ key, title, dress, look }, i) => {
                const one = look!.oneStop ? getStore(look!.oneStop) : undefined;
                const bg = CARD_COLORS[i % CARD_COLORS.length];
                const fg = onColor(bg);
                return (
                  <View testID={`suggestion-${key}`} style={[styles.lookCard, { backgroundColor: bg }]}>
                    <View style={styles.lookHead}>
                      <Text style={[styles.num, { color: fg }]}>{String(i + 1).padStart(2, '0')}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.lookTitle, { color: fg }]} numberOfLines={1}>{title}</Text>
                        <Text style={[styles.lookDress, { color: fg }]} numberOfLines={1}>{dress}</Text>
                      </View>
                    </View>
                    <PressScale
                      accessibilityRole="button"
                      accessibilityLabel={`Open ${title} look`}
                      onPress={() => router.push({ pathname: '/look', params: { day: selected, title, items: look!.items.join(',') } })}
                      style={styles.collageWrap}
                    >
                      <LookCollage items={look!.items} height={Math.round(cardW * 0.98)} />
                    </PressScale>
                    <View style={styles.where}>
                      <Text style={[styles.whereText, { color: fg }]} numberOfLines={1}>
                        {one ? `● All at ${one.name} · ${formatDistance(distanceMiles(place.coord, one.coord), unit)}` : '● From a couple of stores nearby'}
                      </Text>
                      <Text style={[styles.total, { color: fg }]}>{money(look!.total)}</Text>
                    </View>
                    <View style={styles.cardActions}>
                      <Pressable
                        testID={`save-${key}`}
                        style={[styles.smallBtn, { backgroundColor: colors.bg }]}
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
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Piece of{'\n'}the day</Text>
              <Text style={styles.sectionSide}>{featuredNear ? `${formatDistance(featuredNear.distanceMi, unit)} away\n${featuredNear.store.name}` : 'Out of range today'}</Text>
            </View>
            <PressScale
              testID="featured-clip"
              accessibilityRole="button"
              accessibilityLabel={`${featured.brand} ${featured.name}, preview`}
              onPress={() => router.push(`/product/${featured.id}`)}
              to={0.985}
              style={[styles.clipBlock, { backgroundColor: clip.bg }]}
            >
              <PreviewVideo source={clip.video} webm={clip.webm} poster={clip.poster} style={StyleSheet.absoluteFill} />
              <Spin period={22000} style={styles.ring} />
              <Spin period={9000} reverse style={styles.star}>
                <Text style={styles.starText}>✺</Text>
              </Spin>
              <Float amplitude={5} period={2600} style={styles.sticker}>
                <View style={styles.stickerInner}>
                  <Text style={styles.stickerPrice}>{money(featured.price)}</Text>
                  <Text style={styles.stickerSub}>PICK UP{'\n'}TODAY</Text>
                </View>
              </Float>
              <View style={styles.clipFoot}>
                <Text style={styles.clipBrand}>{featured.brand.toUpperCase()}</Text>
                <Text style={styles.clipName}>{featured.name}</Text>
              </View>
            </PressScale>
          </Reveal>
        ) : null}

        {saved ? (
          <Reveal index={4} style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>{saved.title}</Text>
              <Text style={styles.sectionSide}>Planned for{'\n'}{dayLabel}</Text>
            </View>
            <PressScale accessibilityRole="button" accessibilityLabel={`Edit ${saved.title}`} onPress={() => router.push({ pathname: '/look', params: { id: saved.id } })} to={0.985}>
              <LookCollage items={saved.items} height={260} />
            </PressScale>
            <View style={styles.cardActions}>
              <Pressable style={[styles.smallBtn, { backgroundColor: colors.raised }]} accessibilityRole="button" onPress={() => router.push({ pathname: '/look', params: { id: saved.id } })}>
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
          <Pressable testID="add-look" accessibilityRole="button" style={[styles.pill, { backgroundColor: palette.lime }]} onPress={() => router.push({ pathname: '/look', params: { day: selected } })}>
            <Ionicons name="add" size={18} color={colors.ink} />
            <Text style={styles.pillText}>Build a look</Text>
          </Pressable>
          <Pressable testID="ask-stylist" accessibilityRole="button" style={[styles.pill, { backgroundColor: palette.blush }]} onPress={() => router.push('/stylist')}>
            <Ionicons name="sparkles" size={16} color={colors.ink} />
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
          bg={palette.lime}
          fg={colors.ink}
          badge={palette.tomato}
          labelStyle={{ fontWeight: '800' }}
          onPress={() => scroll.current?.scrollTo({ y: heroY.current, animated: true })}
        />
      ) : null}
      {toast}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, paddingBottom: 10 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.raised, alignItems: 'center', justifyContent: 'center' },
  wordmark: { fontSize: 19, fontWeight: '900', letterSpacing: -0.6, color: colors.ink },
  count: { position: 'absolute', top: -2, right: -4, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: palette.tomato, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  countText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  ticker: { backgroundColor: colors.ink, paddingVertical: 8 },
  tickerText: { color: palette.lime, fontSize: 12, fontWeight: '800', letterSpacing: 0.8 },
  hero: { paddingHorizontal: space.lg, paddingTop: 18, paddingBottom: 14 },
  big: { fontSize: 58, lineHeight: 58, fontWeight: '900', letterSpacing: -3, color: colors.ink },
  bigAccent: { fontFamily: fonts.serif, fontStyle: 'italic', fontWeight: '400', letterSpacing: -2, color: palette.cobalt },
  heroRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 10 },
  greetSmall: { fontSize: 14, fontWeight: '600', color: colors.ink },
  weather: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: palette.sun, borderRadius: radius.pill, paddingVertical: 6, paddingHorizontal: 11 },
  weatherText: { fontSize: 14, fontWeight: '800', color: colors.ink },
  lookCard: { borderRadius: 26, padding: 12, paddingTop: 14 },
  lookHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, paddingHorizontal: 4 },
  num: { fontSize: 40, fontWeight: '900', letterSpacing: -2, lineHeight: 42 },
  lookTitle: { fontSize: 19, fontWeight: '900', letterSpacing: -0.6 },
  lookDress: { fontSize: 12, fontWeight: '600', opacity: 0.8 },
  collageWrap: { borderRadius: 16, overflow: 'hidden' },
  where: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, paddingHorizontal: 4 },
  whereText: { flex: 1, fontSize: 13, fontWeight: '600' },
  total: { fontSize: 15, fontWeight: '900' },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  smallBtn: { flex: 1, alignItems: 'center', paddingVertical: 13, borderRadius: radius.pill, backgroundColor: colors.ink },
  smallBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  smallBtnLightText: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  section: { paddingHorizontal: space.lg, marginTop: 30 },
  sectionHead: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12, gap: 12 },
  sectionTitle: { fontSize: 34, lineHeight: 34, fontWeight: '900', letterSpacing: -1.6, color: colors.ink, flexShrink: 1 },
  sectionSide: { fontSize: 12, fontWeight: '600', color: colors.muted, textAlign: 'right' },
  clipBlock: { width: '100%', aspectRatio: 0.9, borderRadius: 26, overflow: 'hidden' },
  ring: { position: 'absolute', width: 230, height: 230, borderRadius: 115, borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)', borderStyle: 'dashed', top: -60, right: -70 },
  star: { position: 'absolute', top: 18, left: 18 },
  starText: { fontSize: 38, color: palette.lime },
  sticker: { position: 'absolute', top: 22, right: 18 },
  stickerInner: { width: 88, height: 88, borderRadius: 44, backgroundColor: palette.lime, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-12deg' }] },
  stickerPrice: { fontSize: 17, fontWeight: '900', color: colors.ink, letterSpacing: -0.6 },
  stickerSub: { fontSize: 9, fontWeight: '800', color: colors.ink, textAlign: 'center', letterSpacing: 0.4 },
  clipFoot: { position: 'absolute', left: 18, right: 18, bottom: 16 },
  clipBrand: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1.2, opacity: 0.85 },
  clipName: { color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: -1 },
  actions: { flexDirection: 'row', gap: 10, paddingHorizontal: space.lg, marginTop: 26 },
  pill: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: radius.pill },
  pillText: { fontSize: 14, fontWeight: '800', color: colors.ink },
});
