import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '../src/state/AppState';
import { colors } from '../src/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.ink,
            headerShadowVisible: false,
            headerTitleStyle: { color: colors.ink, fontWeight: '600' },
            headerBackButtonDisplayMode: 'minimal',
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="product/[id]" options={{ title: '' }} />
          <Stack.Screen name="store/[id]" options={{ title: '' }} />
          <Stack.Screen name="look" options={{ headerShown: false }} />
          <Stack.Screen name="stylist" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="cart" options={{ title: 'Your bag' }} />
          <Stack.Screen name="stores" options={{ title: 'Stores' }} />
          <Stack.Screen name="profile" options={{ title: 'Settings' }} />
          <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
          <Stack.Screen name="order/[id]" options={{ title: 'Your pickup' }} />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}
