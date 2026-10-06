import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '../../src/components/Toast';
import { Divider, LookCollage } from '../../src/components/ui';
import { WeekStrip } from '../../src/components/WeekStrip';
import { formatDistance, distanceMiles } from '../../src/lib/geo';
import { DAILY_OCCASIONS, dayKey, fromDayKey, isCold, suggestDay, weatherFor, weekOf } from '../../src/lib/styling';
import { getStore } from '../../src/data/stores';
import { useApp } from '../../src/state/AppState';
import { useReserveLook } from '../../src/state/useReserveLook';
import { colors, money, radius, space, TABBAR_SPACE, type } from '../../src/theme';

const greeting = (d: Date) => (d.getHours() < 12 ? 'Good morning' : d.getHours() < 17 ? 'Good afternoon' : 'Good evening');

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

  const suggestions = useMemo(
    () =>
      suggestDay(DAILY_OCCASIONS, { from: place.coord, radiusMi, cold, seed: `${selected}|${place.label}` }).filter((s) => s.look),
    [selected, place, radiusMi, cold],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 6, paddingBottom: TABBAR_SPACE + insets.bottom }}>
        <View style={styles.header}>
          <Pressable testID="open-settings" accessibilityRole="button" accessibilityLabel="Settings" onPress={() => router.push('/profile')} hitSlop={8}>
            <Ionicons name="options-outline" size={22} color={colors.ink} />
          </Pressable>
          <Text style={styles.wordmark}>LOCALPICK</Text>
          <Pressable testID="open-bag" accessibilityRole="button" accessibilityLabel={`Bag, ${cartCount} items`} onPress={() => router.push('/cart')} hitSlop={8}>
            <Ionicons name="bag-outline" size={22} color={colors.ink} />
            {cartCount ? (
              <View style={styles.count}>
                <Text style={styles.countText}>{cartCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        <WeekStrip days={days} selected={selected} onSelect={setSelected} looks={looks} />

        <View style={styles.actions}>
          <Pressable testID="add-look" accessibilityRole="button" style={styles.pill} onPress={() => router.push({ pathname: '/look', params: { day: selected } })}>
            <Ionicons name="add" size={18} color={colors.ink} />
            <Text style={styles.pillText}>Add look</Text>
          </Pressable>
          <Pressable testID="ask-stylist" accessibilityRole="button" style={styles.pill} onPress={() => router.push('/stylist')}>
            <Ionicons name="sparkles-outline" size={16} color={colors.ink} />
            <Text style={styles.pillText}>Ask stylist</Text>
          </Pressable>
        </View>

        <View style={styles.greetRow}>
          <View style={{ flexShrink: 1 }}>
            <Text style={styles.greet}>{isToday ? greeting(now) : selDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
            <Pressable onPress={() => router.push('/profile')} accessibilityRole="button" accessibilityLabel={`Picking up near ${place.label} within ${radiusMi} miles. Change`}>
              <Text style={type.small}>
                Near {place.label} · within {formatDistance(radiusMi, unit)}
              </Text>
            </Pressable>
          </View>
          <View style={styles.weather} accessibilityLabel={`${weather.label}, ${weather.tempF} degrees, high ${weather.highF}, low ${weather.lowF}`}>
            <Ionicons name={weather.icon as never} size={22} color={colors.amber} />
            <View>
              <Text style={styles.temp}>{weather.tempF}°</Text>
              <Text style={styles.hl}>
                H:{weather.highF}° L:{weather.lowF}°
              </Text>
            </View>
          </View>
        </View>

        {saved ? (
          <View style={styles.section}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>{saved.title}</Text>
              <Text style={styles.cardMeta}>Planned for {dayLabel}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${saved.title}`} onPress={() => router.push({ pathname: '/look', params: { id: saved.id } })}>
              <LookCollage items={saved.items} height={260} />
            </Pressable>
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
          </View>
        ) : null}

        <View style={{ paddingHorizontal: space.lg }}>
          <Divider label={isToday ? "Today's suggestions" : `Suggestions for ${dayLabel}`} />
        </View>

        {suggestions.length === 0 ? (
          <Text style={[type.small, { textAlign: 'center', paddingHorizontal: 32 }]}>
            Not enough on shelves within {formatDistance(radiusMi, unit)} to build a look. Widen your range in Settings.
          </Text>
        ) : null}

        {suggestions.map(({ key, title, dress, look }) => {
          const one = look!.oneStop ? getStore(look!.oneStop) : undefined;
          return (
            <View key={key} testID={`suggestion-${key}`} style={styles.section}>
              <View style={styles.cardHead}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardMeta}>{dress}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Open ${title} look`}
                onPress={() => router.push({ pathname: '/look', params: { day: selected, title, items: look!.items.join(',') } })}
              >
                <LookCollage items={look!.items} height={300} />
              </Pressable>
              <View style={styles.where}>
                <View style={[styles.dot, { backgroundColor: one ? colors.green : colors.amber }]} />
                <Text style={styles.whereText} numberOfLines={1}>
                  {one
                    ? `All at ${one.name} · ${formatDistance(distanceMiles(place.coord, one.coord), unit)}`
                    : 'From a couple of stores nearby'}
                </Text>
                <Text style={styles.total}>{money(look!.total)}</Text>
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
                  <Text style={styles.smallBtnLightText}>{saved ? `Wear ${isToday ? 'today' : 'this day'} instead` : `Save to ${isToday ? 'today' : dayLabel}`}</Text>
                </Pressable>
                <Pressable
                  testID={`reserve-${key}`}
                  style={styles.smallBtn}
                  accessibilityRole="button"
                  onPress={() => showToast({ text: reserve(look!.items), action: { label: 'View bag', onPress: () => router.push('/cart') } })}
                >
                  <Text style={styles.smallBtnText}>{one ? 'Reserve all · 1 stop' : 'Reserve all'}</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>
      {toast}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, paddingBottom: 12 },
  wordmark: { fontSize: 20, fontWeight: '800', letterSpacing: 2, color: colors.ink },
  count: { position: 'absolute', top: -6, right: -8, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  countText: { color: colors.onAccent, fontSize: 10, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 10, paddingHorizontal: space.lg, marginTop: 12 },
  pill: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: radius.pill, backgroundColor: colors.raised },
  pillText: { fontSize: 14, fontWeight: '500', color: colors.ink },
  greetRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, marginTop: 22, gap: 12 },
  greet: { fontSize: 22, fontWeight: '600', color: colors.ink, letterSpacing: -0.4 },
  weather: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  temp: { fontSize: 18, fontWeight: '600', color: colors.ink },
  hl: { fontSize: 11, color: colors.muted },
  section: { paddingHorizontal: space.lg, marginTop: 18, marginBottom: 6 },
  cardHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10, gap: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.ink, flexShrink: 1 },
  cardMeta: { fontSize: 13, color: colors.muted },
  where: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  whereText: { flex: 1, fontSize: 13, color: colors.ink },
  total: { fontSize: 13, fontWeight: '600', color: colors.ink },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  smallBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: radius.pill, backgroundColor: colors.accent },
  smallBtnText: { color: colors.onAccent, fontSize: 14, fontWeight: '600' },
  smallBtnLight: { backgroundColor: colors.raised },
  smallBtnLightText: { color: colors.ink, fontSize: 14, fontWeight: '500' },
});
