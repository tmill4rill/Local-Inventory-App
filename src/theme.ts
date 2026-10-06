import { Platform } from 'react-native';

/**
 * LocalPick theme — light editorial look referenced from Alta.
 * White floor, product packshots on pale warm gray, black pills for actions,
 * an italic serif for the occasional accent word. Green and amber stay reserved for stock/status.
 */
export const colors = {
  bg: '#FFFFFF',
  /** Pale warm gray the product photos are shot on; tiles use it so packshots sit seamlessly. */
  tile: '#ECEBE7',
  surface: '#F5F4F1',
  card: '#FFFFFF',
  raised: '#F0EFEC',
  glass: 'rgba(255,255,255,0.96)',
  ink: '#0E0E0E',
  muted: '#8B8A85',
  faint: '#BDBCB7',
  border: '#E6E5E1',
  /** Primary action colour: black pills with white text. */
  accent: '#0E0E0E',
  accentSoft: 'rgba(14,14,14,0.06)',
  onAccent: '#FFFFFF',
  green: '#1E7A4C',
  greenSoft: '#E5F2EA',
  amber: '#94600A',
  amberSoft: '#FAF0DB',
  heart: '#E0245E',
  neutralSoft: '#F0EFEC',
};

/** Pastel product tints, used only behind the emoji fallback when a photo is missing. */
export const glow = (hex: string, alpha = 0.6) => {
  const a = Math.round(alpha * 255).toString(16).padStart(2, '0');
  return `${hex}${a}`;
};

export const fonts = {
  serif: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, "Times New Roman", serif' }) as string,
};

export const radius = { sm: 6, md: 12, lg: 18, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };

/** Space the bottom tab bar covers on tab screens. */
export const TABBAR_SPACE = 104;

export const type = {
  title: { fontSize: 30, fontWeight: '700' as const, color: colors.ink, letterSpacing: -0.8 },
  h2: { fontSize: 18, fontWeight: '600' as const, color: colors.ink, letterSpacing: -0.2 },
  body: { fontSize: 15, color: colors.ink },
  small: { fontSize: 13, color: colors.muted },
  /** The italic serif accent, as in Alta's "What do you *wear*?". */
  accent: { fontFamily: fonts.serif, fontStyle: 'italic' as const, fontWeight: '400' as const },
};

export const money = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: n % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;
