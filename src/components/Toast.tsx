import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius } from '../theme';

type ToastMsg = { text: string; action?: { label: string; onPress: () => void } };

/** Dark pill toast at the top of the screen, as in Alta ("Saved look to calendar"). */
export function useToast(): [React.ReactNode, (msg: ToastMsg) => void] {
  const insets = useSafeAreaInsets();
  const [msg, setMsg] = useState<ToastMsg | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((m: ToastMsg) => {
    setMsg(m);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 3200);
  }, []);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const node = msg ? (
    <View pointerEvents="box-none" style={[styles.wrap, { top: insets.top + 8 }]}>
      <View testID="toast" accessibilityLiveRegion="polite" style={styles.toast}>
        <Ionicons name="checkmark-circle" size={18} color={colors.onAccent} />
        <Text style={styles.text} numberOfLines={2}>{msg.text}</Text>
        {msg.action ? (
          <Pressable
            testID="toast-action"
            accessibilityRole="button"
            onPress={() => {
              setMsg(null);
              msg.action!.onPress();
            }}
            hitSlop={8}
          >
            <Text style={styles.action}>{msg.action.label}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  ) : null;
  return [node, show];
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 12, right: 12, zIndex: 50 },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#1C1C1C', borderRadius: radius.lg, paddingVertical: 13, paddingHorizontal: 16 },
  text: { flex: 1, color: colors.onAccent, fontSize: 14 },
  action: { color: colors.onAccent, fontSize: 14, fontWeight: '700', textDecorationLine: 'underline' },
});
