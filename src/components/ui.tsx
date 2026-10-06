import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { getProduct } from '../data/products';
import { productImage } from '../data/productImages';
import { colors, glow, radius, space, type } from '../theme';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];

/** Black pill for the main action, light-gray pill for the secondary one, as in Alta. */
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
        variant === 'secondary' && { backgroundColor: colors.raised },
        variant === 'ghost' && { backgroundColor: 'transparent' },
        disabled && { opacity: 0.4 },
        pressed && { opacity: 0.75 },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={17} color={fg} style={{ marginRight: 8 }} /> : null}
      <Text style={[styles.btnText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

/** Filter chip: soft gray when off, black when on. */
export function Chip({
  label,
  selected,
  onPress,
  icon,
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
      style={[styles.chip, selected && { backgroundColor: colors.accent }]}
    >
      {icon ? <Ionicons name={icon} size={14} color={fg} style={{ marginRight: 5 }} /> : null}
      <Text style={[styles.chipText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

/** Small price label for the corner of a photo. */
export function PricePill({ label, style }: { label: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.pricePill, style]}>
      <Text style={styles.pricePillText}>{label}</Text>
    </View>
  );
}

/** Three side-by-side figures. */
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
    accent: [colors.accent, colors.onAccent],
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
  image?: ImageSourcePropType;
  emoji: string;
  tint: string;
  emojiSize: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  const showPhoto = !!image && !failed;
  return (
    <View style={[{ alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: showPhoto ? colors.tile : glow(tint) }, style]}>
      {showPhoto ? (
        <Image source={image!} onError={() => setFailed(true)} resizeMode="cover" style={styles.photo} accessibilityIgnoresInvertColors />
      ) : (
        <Text style={{ fontSize: emojiSize }}>{emoji}</Text>
      )}
      {children}
    </View>
  );
}

export function ProductArt({ emoji, tint, image, size = 96, style }: { emoji: string; tint: string; image?: ImageSourcePropType; size?: number; style?: StyleProp<ViewStyle> }) {
  return <ProductPhoto image={image} emoji={emoji} tint={tint} emojiSize={size * 0.5} style={[{ width: size, height: size, borderRadius: radius.sm }, style]} />;
}

/** Thumbnail for a product id. */
export function Thumb({ id, size = 64, style }: { id: string; size?: number; style?: StyleProp<ViewStyle> }) {
  const p = getProduct(id);
  if (!p) return null;
  return <ProductArt emoji={p.emoji} tint={p.tint} image={productImage(p.id)} size={size} style={style} />;
}

/**
 * Alta-style outfit collage: clothes stacked on the left, shoes, bag and small pieces on the
 * right, all on the same pale tile so it reads as one flat-lay.
 */
export function LookCollage({ items, height = 300, style }: { items: string[]; height?: number; style?: StyleProp<ViewStyle> }) {
  const products = items.map(getProduct).filter((p): p is NonNullable<typeof p> => !!p);
  const left = products.filter((p) => ['Outerwear', 'Tops', 'Dresses', 'Bottoms'].includes(p.category));
  const right = products.filter((p) => !left.includes(p));
  const col = (list: typeof products, flexWeights: number[]) =>
    list.map((p, i) => (
      <ProductPhoto key={p.id} image={productImage(p.id)} emoji={p.emoji} tint={p.tint} emojiSize={36} style={{ flex: flexWeights[i] ?? 1, width: '100%' }} />
    ));
  return (
    <View style={[styles.collage, { height }, style]} accessibilityLabel={`Look: ${products.map((p) => p.name).join(', ')}`}>
      <View style={styles.collageCol}>{col(left, left.map(() => 1))}</View>
      {right.length ? <View style={[styles.collageCol, { flex: 0.82 }]}>{col(right, right.map(() => 1))}</View> : null}
    </View>
  );
}

export function Heart({ on, onPress, size = 20, testID, style }: { on: boolean; onPress: () => void; size?: number; testID?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={on ? 'Remove from wishlist' : 'Add to wishlist'}
      accessibilityState={{ selected: on }}
      hitSlop={10}
      onPress={onPress}
      style={style}
    >
      <Ionicons name={on ? 'heart' : 'heart-outline'} size={size} color={on ? colors.heart : colors.ink} />
    </Pressable>
  );
}

/** Price with the original struck through when the piece is marked down. */
export function Price({ price, compareAt, style }: { price: number; compareAt?: number; style?: StyleProp<TextStyle> }) {
  const money = (n: number) => `$${n.toLocaleString('en-US')}`;
  return (
    <Text style={[styles.price, style]}>
      {money(price)}
      {compareAt ? <Text style={styles.compare}>{'  '}{money(compareAt)}</Text> : null}
    </Text>
  );
}

/** A heading with an italic serif accent word, e.g. "What do you *wear*?". */
export function Headline({ before, accent, after = '', style }: { before: string; accent: string; after?: string; style?: StyleProp<TextStyle> }) {
  return (
    <Text style={[type.title, style]}>
      {before}
      <Text style={type.accent}>{accent}</Text>
      {after}
    </Text>
  );
}

/** Thin rule with a centred caption, like Alta's "Today's suggestions". */
export function Divider({ label }: { label: string }) {
  return (
    <View style={styles.divider}>
      <View style={styles.rule} />
      <Text style={styles.dividerText}>{label}</Text>
      <View style={styles.rule} />
    </View>
  );
}

export function Empty({ icon, title, body, children }: { icon: IconName; title: string; body: string; children?: React.ReactNode }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={40} color={colors.faint} />
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

/** Key/value row for detail tables. */
export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Explicit 100% sizes: on web, a bundled image otherwise keeps its intrinsic 800px size.
  photo: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, paddingHorizontal: 18, borderRadius: radius.pill },
  btnText: { fontSize: 15, fontWeight: '600' },
  chip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: colors.raised, marginRight: space.sm },
  chipText: { fontSize: 13, fontWeight: '500', color: colors.ink },
  pricePill: { alignSelf: 'flex-start', backgroundColor: colors.bg, borderRadius: radius.pill, paddingVertical: 3, paddingHorizontal: 9 },
  pricePillText: { color: colors.ink, fontWeight: '700', fontSize: 12 },
  trio: { flexDirection: 'row', gap: 8 },
  trioCell: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: 10, paddingHorizontal: 12 },
  trioLabel: { fontSize: 12, color: colors.muted },
  trioValue: { fontSize: 17, fontWeight: '700', color: colors.ink, marginTop: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3, paddingHorizontal: 8, borderRadius: radius.pill, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '600' },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: space.lg },
  collage: { flexDirection: 'row', gap: 6, backgroundColor: colors.bg },
  collageCol: { flex: 1, gap: 6 },
  price: { fontSize: 13, color: colors.ink },
  compare: { color: colors.muted, textDecorationLine: 'line-through' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 14 },
  rule: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  dividerText: { fontSize: 13, color: colors.muted },
  empty: { alignItems: 'center', padding: 32, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.ink, marginTop: 8 },
  emptyBody: { fontSize: 14, color: colors.muted, textAlign: 'center', marginBottom: 8, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '600', color: colors.muted, marginBottom: 6 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, gap: 16 },
  detailLabel: { fontSize: 13, color: colors.muted },
  detailValue: { fontSize: 15, color: colors.ink, flexShrink: 1, textAlign: 'right' },
});
