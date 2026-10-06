import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/tabs';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../state/AppState';
import { colors, radius } from '../theme';
import type { IconName } from './ui';

const TABS: Record<string, { label: string; icon: IconName; iconOn: IconName }> = {
  index: { label: 'Today', icon: 'home-outline', iconOn: 'home' },
  shop: { label: 'Shop', icon: 'search-outline', iconOn: 'search' },
  closet: { label: 'Closet', icon: 'shirt-outline', iconOn: 'shirt' },
  orders: { label: 'Pickups', icon: 'bag-handle-outline', iconOn: 'bag-handle' },
};

/**
 * Alta-style bottom bar: four icon tabs with a black "+" in the middle that opens
 * "New look" and "Ask the stylist".
 */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { orders } = useApp();
  const [menu, setMenu] = useState(false);
  const ready = orders.filter((o) => o.status === 'ready').length;
  const routes = state.routes.filter((r) => TABS[r.name]);
  const half = Math.ceil(routes.length / 2);

  const tab = (route: (typeof routes)[number]) => {
    const i = state.routes.indexOf(route);
    const focused = state.index === i;
    const t = TABS[route.name];
    const count = route.name === 'orders' ? ready : 0;
    return (
      <Pressable
        key={route.key}
        testID={`tab-${route.name}`}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={count ? `${t.label}, ${count} ready` : t.label}
        onPress={() => {
          const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
        }}
        style={styles.tab}
      >
        <View>
          <Ionicons name={focused ? t.iconOn : t.icon} size={23} color={focused ? colors.ink : colors.muted} />
          {count ? <View style={styles.dot} /> : null}
        </View>
        <Text style={[styles.tabText, focused && { color: colors.ink, fontWeight: '600' }]}>{t.label}</Text>
      </Pressable>
    );
  };

  const go = (path: '/look' | '/stylist') => {
    setMenu(false);
    router.push(path);
  };

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {routes.slice(0, half).map(tab)}
      <Pressable testID="plus" accessibilityRole="button" accessibilityLabel="New look or ask the stylist" onPress={() => setMenu(true)} style={styles.plusWrap}>
        <View style={styles.plus}>
          <Ionicons name="add" size={28} color={colors.onAccent} />
        </View>
      </Pressable>
      {routes.slice(half).map(tab)}

      <Modal visible={menu} transparent animationType="fade" onRequestClose={() => setMenu(false)}>
        <Pressable style={styles.scrim} onPress={() => setMenu(false)} accessibilityLabel="Close menu">
          <View style={[styles.menu, { marginBottom: Math.max(insets.bottom, 10) + 78 }]}>
            <Pressable testID="menu-new-look" accessibilityRole="button" style={styles.menuRow} onPress={() => go('/look')}>
              <Text style={styles.menuText}>New look</Text>
              <View style={styles.menuIcon}>
                <Ionicons name="shirt-outline" size={18} color={colors.onAccent} />
              </View>
            </Pressable>
            <Pressable testID="menu-stylist" accessibilityRole="button" style={styles.menuRow} onPress={() => go('/stylist')}>
              <Text style={styles.menuText}>Ask the stylist</Text>
              <View style={styles.menuIcon}>
                <Ionicons name="sparkles-outline" size={18} color={colors.onAccent} />
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.glass, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: 8, paddingHorizontal: 6 },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  tabText: { fontSize: 11, color: colors.muted },
  dot: { position: 'absolute', top: -1, right: -4, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green, borderWidth: 1.5, borderColor: colors.bg },
  plusWrap: { flex: 1, alignItems: 'center' },
  plus: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-end', alignItems: 'center' },
  menu: { backgroundColor: '#1C1C1C', borderRadius: radius.lg, padding: 6, minWidth: 240 },
  menuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 12, gap: 16 },
  menuText: { color: colors.onAccent, fontSize: 15 },
  menuIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' },
});
