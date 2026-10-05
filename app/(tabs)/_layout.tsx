import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useApp } from '../../src/state/AppState';
import { colors } from '../../src/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const tab = (title: string, icon: IconName, iconActive: IconName) => ({
  title,
  tabBarIcon: ({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) => (
    <Ionicons name={focused ? iconActive : icon} size={size} color={color} />
  ),
});

export default function TabsLayout() {
  const { cartCount, orders } = useApp();
  const ready = orders.filter((o) => o.status === 'ready').length;
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '800' },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ ...tab('Discover', 'compass-outline', 'compass'), headerShown: false }} />
      <Tabs.Screen name="stores" options={tab('Stores', 'storefront-outline', 'storefront')} />
      <Tabs.Screen
        name="cart"
        options={{ ...tab('Cart', 'bag-outline', 'bag'), title: 'Cart', tabBarBadge: cartCount > 0 ? cartCount : undefined }}
      />
      <Tabs.Screen
        name="orders"
        options={{ ...tab('Pickups', 'ticket-outline', 'ticket'), title: 'Pickups', tabBarBadge: ready > 0 ? ready : undefined }}
      />
      <Tabs.Screen name="profile" options={tab('Me', 'person-outline', 'person')} />
    </Tabs>
  );
}
