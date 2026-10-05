import { Tabs } from 'expo-router';
import { Dock } from '../../src/components/Dock';
import { SearchProvider } from '../../src/state/Search';
import { colors } from '../../src/theme';

export default function TabsLayout() {
  return (
    <SearchProvider>
      <Tabs
        tabBar={(props) => <Dock {...props} />}
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerShadowVisible: false,
          headerTintColor: colors.ink,
          headerTitleStyle: { fontWeight: '800', color: colors.ink },
          sceneStyle: { backgroundColor: colors.bg },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Discover', headerShown: false }} />
        <Tabs.Screen name="stores" options={{ title: 'Stores' }} />
        <Tabs.Screen name="cart" options={{ title: 'Cart' }} />
        <Tabs.Screen name="orders" options={{ title: 'Pickups' }} />
        <Tabs.Screen name="profile" options={{ title: 'Me' }} />
      </Tabs>
    </SearchProvider>
  );
}
