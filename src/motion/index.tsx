import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type LayoutChangeEvent,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

/**
 * Motion kit, after Doji: things arrive rather than appear. Feeds stagger in, the hero rail
 * scales the centred card up and lets its neighbours peek, product previews loop quietly, and
 * a look "develops" with a shimmer before it resolves. Built on RN's Animated so it runs on
 * iOS, Android and web without extra native modules (expo-video handles the clips).
 */

/** Native driver everywhere except web, where Animated falls back to JS. */
export const ND = Platform.OS !== 'web';

/** Doji's ease: quick out, long settle. */
export const EASE = Easing.bezier(0.22, 1, 0.36, 1);

/** Fade + rise on mount, delayed by `index` so lists stagger in. */
export function Reveal({
  index = 0,
  step = 70,
  distance = 18,
  duration = 620,
  style,
  children,
}: {
  index?: number;
  step?: number;
  distance?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration, delay: Math.min(index, 10) * step, easing: EASE, useNativeDriver: ND }).start();
  }, []);
  return (
    <Animated.View
      style={[
        style,
        { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/** Pressable that gives under the finger (scale 0.97) and springs back. */
export function PressScale({ style, children, to = 0.97, ...rest }: PressableProps & { style?: StyleProp<ViewStyle>; to?: number; children: React.ReactNode }) {
  const s = useRef(new Animated.Value(1)).current;
  const spring = (toValue: number) => Animated.spring(s, { toValue, useNativeDriver: ND, speed: 40, bounciness: toValue === 1 ? 8 : 0 }).start();
  return (
    <Pressable {...rest} onPressIn={(e) => { spring(to); rest.onPressIn?.(e); }} onPressOut={(e) => { spring(1); rest.onPressOut?.(e); }}>
      <Animated.View style={[style, { transform: [{ scale: s }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

/**
 * Doji's home rail: one card centred and full size, neighbours scaled down and faded so they
 * peek in from the edges. Snaps card by card.
 */
export function PeekCarousel<T>({
  data,
  keyOf,
  renderItem,
  itemWidth,
  gap = 12,
  minScale = 0.86,
  minOpacity = 0.45,
  onIndexChange,
  testID,
}: {
  data: T[];
  keyOf: (item: T, i: number) => string;
  renderItem: (item: T, i: number) => React.ReactNode;
  itemWidth: number;
  gap?: number;
  minScale?: number;
  minOpacity?: number;
  onIndexChange?: (i: number) => void;
  testID?: string;
}) {
  const [width, setWidth] = useState(0);
  const x = useRef(new Animated.Value(0)).current;
  const interval = itemWidth + gap;
  const side = Math.max(0, (width - itemWidth) / 2);
  const last = useRef(0);
  return (
    <View onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)} testID={testID}>
      {width ? (
        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={interval}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: side, gap }}
          scrollEventThrottle={16}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x } } }], {
            useNativeDriver: ND,
            listener: (e: { nativeEvent: { contentOffset: { x: number } } }) => {
              const i = Math.round(e.nativeEvent.contentOffset.x / interval);
              if (i !== last.current) {
                last.current = i;
                onIndexChange?.(i);
              }
            },
          })}
        >
          {data.map((item, i) => {
            const inputRange = [(i - 1) * interval, i * interval, (i + 1) * interval];
            const scale = x.interpolate({ inputRange, outputRange: [minScale, 1, minScale], extrapolate: 'clamp' });
            const opacity = x.interpolate({ inputRange, outputRange: [minOpacity, 1, minOpacity], extrapolate: 'clamp' });
            return (
              <Animated.View key={keyOf(item, i)} style={{ width: itemWidth, opacity, transform: [{ scale }] }}>
                {renderItem(item, i)}
              </Animated.View>
            );
          })}
        </Animated.ScrollView>
      ) : null}
    </View>
  );
}

/** Page dots that stretch into a bar on the active page. */
export function Dots({ count, index, color, idle }: { count: number; index: number; color: string; idle: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
      {Array.from({ length: count }, (_, i) => (
        <Dot key={i} on={i === index} color={color} idle={idle} />
      ))}
    </View>
  );
}
function Dot({ on, color, idle }: { on: boolean; color: string; idle: string }) {
  const w = useRef(new Animated.Value(on ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(w, { toValue: on ? 1 : 0, duration: 320, easing: EASE, useNativeDriver: false }).start();
  }, [on]);
  return (
    <Animated.View
      style={{
        height: 5,
        borderRadius: 3,
        width: w.interpolate({ inputRange: [0, 1], outputRange: [5, 18] }),
        backgroundColor: on ? color : idle,
      }}
    />
  );
}

/**
 * Looping, muted product preview (Higgsfield clip). The poster sits underneath until the first
 * frame is ready, so there's never a blank tile; `paused` freezes it on the poster.
 */
export function PreviewVideo({
  source,
  poster,
  paused,
  style,
  testID,
}: {
  source: number;
  poster: ImageSourcePropType;
  paused?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sub = player.addListener('statusChange', ({ status }) => status === 'readyToPlay' && setReady(true));
    return () => sub.remove();
  }, [player]);
  useEffect(() => {
    paused ? player.pause() : player.play();
  }, [paused, player]);
  return (
    <View style={[{ overflow: 'hidden' }, style]} testID={testID}>
      <Image source={poster} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityIgnoresInvertColors />
      <VideoView
        player={player}
        style={[StyleSheet.absoluteFill, { opacity: ready ? 1 : 0 }]}
        contentFit="cover"
        nativeControls={false}
        allowsPictureInPicture={false}
      />
    </View>
  );
}

/**
 * A look "develops" like Doji / Alta's try-on: while `pending`, the content is veiled and a
 * light band sweeps across it with a pulsing label; when it resolves the content settles in.
 * Re-runs whenever `runKey` changes.
 */
export function Develop({
  runKey,
  duration = 900,
  label = 'Styling from nearby stock…',
  veil,
  style,
  children,
}: {
  runKey: string;
  duration?: number;
  label?: string;
  veil: string;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const [pending, setPending] = useState(true);
  const sweep = useRef(new Animated.Value(0)).current;
  const settle = useRef(new Animated.Value(0)).current;
  const [w, setW] = useState(0);
  useEffect(() => {
    setPending(true);
    settle.setValue(0);
    sweep.setValue(0);
    const loop = Animated.loop(Animated.timing(sweep, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: ND }));
    loop.start();
    const t = setTimeout(() => {
      loop.stop();
      setPending(false);
      Animated.timing(settle, { toValue: 1, duration: 560, easing: EASE, useNativeDriver: ND }).start();
    }, duration);
    return () => {
      clearTimeout(t);
      loop.stop();
    };
  }, [runKey]);
  return (
    <View style={style} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      <Animated.View
        style={{
          opacity: settle.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] }),
          transform: [{ scale: settle.interpolate({ inputRange: [0, 1], outputRange: [1.035, 1] }) }],
        }}
      >
        {children}
      </Animated.View>
      {pending ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: veil, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }]} pointerEvents="none">
          <Animated.View
            style={{
              position: 'absolute',
              top: -40,
              bottom: -40,
              width: 90,
              backgroundColor: 'rgba(255,255,255,0.55)',
              transform: [{ translateX: sweep.interpolate({ inputRange: [0, 1], outputRange: [-w / 2 - 90, w / 2 + 90] }) }, { rotate: '14deg' }],
            }}
          />
          <Pulse>
            <Text style={{ fontSize: 13, fontWeight: '500', color: '#0E0E0E', letterSpacing: 0.2 }}>✦ {label}</Text>
          </Pulse>
        </View>
      ) : null}
    </View>
  );
}

/** Gentle opacity breathing for loading labels and live badges. */
export function Pulse({ children, min = 0.35, period = 1100, style }: { children: React.ReactNode; min?: number; period?: number; style?: StyleProp<ViewStyle> }) {
  const v = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const a = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: min, duration: period / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: ND }),
        Animated.timing(v, { toValue: 1, duration: period / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: ND }),
      ]),
    );
    a.start();
    return () => a.stop();
  }, []);
  return <Animated.View style={[style, { opacity: v }]}>{children}</Animated.View>;
}

/**
 * Doji's floating "New Looks (8)" pill: slides up after a beat, badge pulses.
 */
export function FloatingPill({
  label,
  count,
  onPress,
  bottom,
  bg,
  fg,
  badge,
  labelStyle,
  testID,
}: {
  label: string;
  count?: number;
  onPress: () => void;
  bottom: number;
  bg: string;
  fg: string;
  badge: string;
  labelStyle?: StyleProp<TextStyle>;
  testID?: string;
}) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(v, { toValue: 1, delay: 700, useNativeDriver: ND, speed: 10, bounciness: 9 }).start();
  }, []);
  return (
    <Animated.View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom,
        alignItems: 'center',
        opacity: v,
        transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
      }}
    >
      <PressScale testID={testID} accessibilityRole="button" accessibilityLabel={count ? `${label}, ${count}` : label} onPress={onPress} style={[pill.wrap, { backgroundColor: bg }]}>
        <Text style={[pill.text, { color: fg }, labelStyle]}>{label}</Text>
        {count ? (
          <Pulse min={0.55} period={1600}>
            <View style={[pill.badge, { backgroundColor: badge }]}>
              <Text style={pill.badgeText}>{count}</Text>
            </View>
          </Pulse>
        ) : null}
      </PressScale>
    </Animated.View>
  );
}

/** Endless horizontal ticker (two copies of the content, translated by one width). */
export function Marquee({ children, speed = 40, style }: { children: React.ReactNode; speed?: number; style?: StyleProp<ViewStyle> }) {
  const [w, setW] = useState(0);
  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!w) return;
    x.setValue(0);
    const a = Animated.loop(Animated.timing(x, { toValue: -w, duration: (w / speed) * 1000, easing: Easing.linear, useNativeDriver: ND }));
    a.start();
    return () => a.stop();
  }, [w]);
  return (
    <View style={[{ overflow: 'hidden' }, style]}>
      <Animated.View style={{ flexDirection: 'row', transform: [{ translateX: x }] }}>
        <View style={{ flexDirection: 'row' }} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
          {children}
        </View>
        <View style={{ flexDirection: 'row' }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

/** Slow continuous rotation, for abstract shapes. */
export function Spin({ period = 18000, reverse, style, children }: { period?: number; reverse?: boolean; style?: StyleProp<ViewStyle>; children?: React.ReactNode }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.timing(v, { toValue: 1, duration: period, easing: Easing.linear, useNativeDriver: ND }));
    a.start();
    return () => a.stop();
  }, []);
  return (
    <Animated.View
      pointerEvents="none"
      style={[style, { transform: [{ rotate: v.interpolate({ inputRange: [0, 1], outputRange: reverse ? ['360deg', '0deg'] : ['0deg', '360deg'] }) }] }]}
    >
      {children}
    </Animated.View>
  );
}

/** Slow up-and-down drift, for floating product cut-outs. */
export function Float({ amplitude = 6, period = 3200, style, children }: { amplitude?: number; period?: number; style?: StyleProp<ViewStyle>; children: React.ReactNode }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: period / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: ND }),
        Animated.timing(v, { toValue: 0, duration: period / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: ND }),
      ]),
    );
    a.start();
    return () => a.stop();
  }, []);
  return <Animated.View style={[style, { transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -amplitude] }) }] }]}>{children}</Animated.View>;
}

const pill = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 11, paddingLeft: 20, paddingRight: 12, borderRadius: 999, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  text: { fontSize: 15 },
  badge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
