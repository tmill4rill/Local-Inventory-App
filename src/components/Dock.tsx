import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from 'expo-router/tabs';
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../state/AppState';
import { useSearch } from '../state/Search';
import { colors, radius } from '../theme';

const LABELS: Record<string, string> = { index: 'Discover', stores: 'Stores', cart: 'Cart', orders: 'Pickups', profile: 'Me' };

/**
 * Floating glass dock, after GOAT's bottom card: search on top (Discover only),
 * text-only tabs underneath, counts shown inline.
 */
export function Dock({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { query, setQuery } = useSearch();
  const { cartCount, orders } = useApp();
  const ready = orders.filter((o) => o.status === 'ready').length;
  const counts: Record<string, number> = { cart: cartCount, orders: ready };
  const onDiscover = state.routes[state.index]?.name === 'index';

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.dock}>
        {onDiscover ? (
          <View style={styles.search}>
            <Ionicons name="search" size={17} color={colors.muted} />
            <TextInput
              testID="search-input"
              value={query}
              onChangeText={setQuery}
              placeholder="Search what's on the shelves nearby"
              placeholderTextColor={colors.muted}
              style={styles.searchInput}
              returnKeyType="search"
              accessibilityLabel="Search nearby inventory"
            />
            {query ? (
              <Pressable accessibilityLabel="Clear search" onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={colors.muted} />
              </Pressable>
            ) : null}
          </View>
        ) : null}
        <View style={styles.tabs} accessibilityRole="tablist">
          {state.routes.map((route, i) => {
            const focused = state.index === i;
            const count = counts[route.name] ?? 0;
            const label = LABELS[route.name] ?? route.name;
            return (
              <Pressable
                key={route.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={count ? `${label}, ${count}` : label}
                onPress={() => {
                  const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                  if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
                }}
                style={styles.tab}
              >
                <Text style={[styles.tabText, focused && styles.tabTextOn]}>{label}</Text>
                {count > 0 ? (
                  <View style={styles.count}>
                    <Text style={styles.countText}>{count}</Text>
                  </View>
                ) : null}
                <View style={[styles.marker, focused && styles.markerOn]} />
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 12 },
  dock: { backgroundColor: colors.glass, borderRadius: 22, borderWidth: 1, borderColor: colors.border, paddingTop: 10, paddingHorizontal: 10 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#4A4A46', borderRadius: radius.md, paddingHorizontal: 12, backgroundColor: colors.bg },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 15, color: colors.ink },
  tabs: { flexDirection: 'row', justifyContent: 'space-between' },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingTop: 12, paddingBottom: 14 },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.muted },
  tabTextOn: { color: colors.ink, fontWeight: '800' },
  count: { minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  countText: { fontSize: 11, fontWeight: '800', color: colors.onAccent },
  marker: { position: 'absolute', bottom: 6, width: 4, height: 4, borderRadius: 2, backgroundColor: 'transparent' },
  markerOn: { backgroundColor: colors.ink },
});
