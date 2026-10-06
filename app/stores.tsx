import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Badge } from '../src/components/ui';
import { STORES, STORE_TYPE_LABEL } from '../src/data/stores';
import { distanceMiles, formatDistance } from '../src/lib/geo';
import { isOpenNow } from '../src/lib/pickup';
import { useApp } from '../src/state/AppState';
import { colors, radius } from '../src/theme';

export default function Stores() {
  const { place, radiusMi, unit } = useApp();
  const rows = useMemo(
    () => STORES.map((s) => ({ store: s, d: distanceMiles(place.coord, s.coord) })).sort((a, b) => a.d - b.d),
    [place],
  );
  return (
    <FlatList
      testID="stores-list"
      data={rows}
      keyExtractor={(r) => r.store.id}
      contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 48 }}
      ListHeaderComponent={
        <Text style={{ color: colors.muted, marginBottom: 4 }}>
          Stores with an in-person experience. Dimmed ones are outside your {formatDistance(radiusMi, unit)} range.
        </Text>
      }
      renderItem={({ item: { store, d } }) => {
        const inRange = d <= radiusMi;
        return (
          <Pressable
            testID={`store-${store.id}`}
            accessibilityRole="button"
            onPress={() => router.push(`/store/${store.id}`)}
            style={[styles.card, !inRange && { opacity: 0.55 }]}
          >
            <View style={styles.icon}>
              <Ionicons name={store.experience.icon as never} size={24} color={colors.ink} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{store.name}</Text>
              <Text style={styles.meta}>
                {STORE_TYPE_LABEL[store.type]} · {formatDistance(d, unit)} · {store.area}
              </Text>
              <Text style={styles.exp}>✦ {store.experience.title}</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                <Badge tone={isOpenNow(store.hours) ? 'green' : 'neutral'} label={isOpenNow(store.hours) ? 'Open now' : 'Closed now'} />
                {inRange ? <Badge tone="accent" label="In your range" /> : null}
              </View>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 12, padding: 14, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  icon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.raised, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '800', color: colors.ink },
  meta: { fontSize: 13, color: colors.muted, marginTop: 2 },
  exp: { fontSize: 13, color: colors.amber, fontWeight: '700', marginTop: 6 },
});
