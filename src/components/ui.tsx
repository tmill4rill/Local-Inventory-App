import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { colors, glow, radius, space } from '../theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  style,
  testID,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: IconName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const fg = variant === 'primary' ? colors.onAccent : colors.ink;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        variant === 'primary' && { backgroundColor: colors.accent },
        variant === 'secondary' && { backgroundColor: colors.raised, borderWidth: 1, borderColor: colors.border },
        variant === 'ghost' && { backgroundColor: 'transparent' },
        disabled && { opacity: 0.45 },
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={18} color={fg} style={{ marginRight: 8 }} /> : null}
      <Text style={[styles.btnText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

/**
 * Two chip shapes, as in GOAT's filter rows: squared chips for structural filters
 * (category, store type) and rounded pills for quick on/off toggles.
 */
export function Chip({
  label,
  selected,
  onPress,
  icon,
  shape = 'pill',
  testID,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  shape?: 'pill' | 'square';
  testID?: string;
}) {
  const fg = selected ? colors.onAccent : colors.ink;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={[
        styles.chip,
        shape === 'square' && styles.chipSquare,
        selected && { backgroundColor: colors.accent, borderColor: colors.accent },
      ]}
    >
      {icon ? <Ionicons name={icon} size={14} color={fg} style={{ marginRight: 4 }} /> : null}
      <Text style={[styles.chipText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

/** White price pill that floats on product art. */
export function PricePill({ label, style }: { label: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.pricePill, style]}>
      <Text style={styles.pricePillText}>{label}</Text>
    </View>
  );
}

/** Three side-by-side figures, after GOAT's Best price / Last sold / Top offer row. */
export function StatTrio({ stats, testID }: { stats: { label: string; value: string }[]; testID?: string }) {
  return (
    <View testID={testID} style={styles.trio}>
      {stats.map((s) => (
        <View key={s.label} style={styles.trioCell}>
          <Text style={styles.trioLabel}>{s.label}</Text>
          <Text style={styles.trioValue} numberOfLines={1}>{s.value}</Text>
        </View>
      ))}
    </View>
  );
}

export function Badge({ label, tone = 'green', icon }: { label: string; tone?: 'green' | 'amber' | 'accent' | 'neutral'; icon?: IconName }) {
  const map = {
    green: [colors.greenSoft, colors.green],
    amber: [colors.amberSoft, colors.amber],
    accent: [colors.accentSoft, colors.accent],
    neutral: [colors.neutralSoft, colors.muted],
  }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: map[0] }]}>
      {icon ? <Ionicons name={icon} size={12} color={map[1]} style={{ marginRight: 4 }} /> : null}
      <Text style={[styles.badgeText, { color: map[1] }]}>{label}</Text>
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/** Product photo when there is one; falls back to the emoji on a tinted tile if it is missing or fails to load. */
export function ProductPhoto({
  image,
  emoji,
  tint,
  emojiSize,
  style,
  children,
}: {
  image?: string;
  emoji: string;
  tint: string;
  emojiSize: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  const showPhoto = !!image && !failed;
  return (
    <View style={[{ alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: showPhoto ? colors.bg : glow(tint, 0.18) }, style]}>
      {showPhoto ? (
        <Image source={{ uri: image }} onError={() => setFailed(true)} resizeMode="cover" style={StyleSheet.absoluteFill} accessibilityIgnoresInvertColors />
      ) : (
        <Text style={{ fontSize: emojiSize }}>{emoji}</Text>
      )}
      {children}
    </View>
  );
}

export function ProductArt({ emoji, tint, image, size = 96, style }: { emoji: string; tint: string; image?: string; size?: number; style?: StyleProp<ViewStyle> }) {
  return <ProductPhoto image={image} emoji={emoji} tint={tint} emojiSize={size * 0.5} style={[{ width: size, height: size, borderRadius: radius.md }, style]} />;
}

export function Empty({ icon, title, body, children }: { icon: IconName; title: string; body: string; children?: React.ReactNode }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={44} color={colors.muted} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      {children}
    </View>
  );
}

export function Row({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>;
}

export function Label({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, paddingHorizontal: 18, borderRadius: radius.pill },
  btnText: { fontSize: 16, fontWeight: '700' },
  chip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 13, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, marginRight: space.sm },
  chipSquare: { borderRadius: radius.sm, backgroundColor: colors.raised, borderColor: colors.raised },
  pricePill: { alignSelf: 'flex-start', backgroundColor: colors.accent, borderRadius: radius.pill, paddingVertical: 4, paddingHorizontal: 10 },
  pricePillText: { color: colors.onAccent, fontWeight: '800', fontSize: 13 },
  trio: { flexDirection: 'row', gap: 8 },
  trioCell: { flex: 1, backgroundColor: colors.raised, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingVertical: 10, paddingHorizontal: 12 },
  trioLabel: { fontSize: 12, color: colors.muted },
  trioValue: { fontSize: 17, fontWeight: '800', color: colors.ink, marginTop: 4 },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.ink },
  badge: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3, paddingHorizontal: 8, borderRadius: radius.pill, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '700' },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: space.lg },
  empty: { alignItems: 'center', padding: 32, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.ink, marginTop: 8 },
  emptyBody: { fontSize: 14, color: colors.muted, textAlign: 'center', marginBottom: 8 },
  label: { fontSize: 13, fontWeight: '700', color: colors.muted, marginBottom: 6 },
});
