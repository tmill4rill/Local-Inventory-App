import { Platform } from 'react-native';

/**
 * LocalPick theme, version B "Chroma": abstract and design-forward. White floor, every piece a
 * cut-out on a saturated colour block, heavy tight grotesque type, ink pills, lime for the
 * one live action. Green and amber stay reserved for stock/status.
 */
export const palette = {
  cobalt: '#2B3CFE',
  tomato: '#FF4A1C',
  lime: '#D5FF3F',
  blush: '#FFB3D1',
  sun: '#FFC21A',
  lilac: '#A99BFF',
};
export const colors = {
  bg: '#FFFFFF',
  /** Pale warm gray the product photos are shot on; tiles use it so packshots sit seamlessly. */
  tile: '#F1F1EC',
  surface: '#F5F4F1',
  card: '#FFFFFF',
  veil: 'rgba(255,255,255,0.86)',
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
  title: { fontSize: 34, fontWeight: '900' as const, color: colors.ink, letterSpacing: -1.4, lineHeight: 36 },
  /** Poster-weight display type. */
  display: { fontWeight: '900' as const, color: colors.ink, letterSpacing: -1.6 },
  overline: { fontSize: 11, fontWeight: '800' as const, letterSpacing: 0.6, textTransform: 'uppercase' as const, color: colors.ink },
  h2: { fontSize: 18, fontWeight: '600' as const, color: colors.ink, letterSpacing: -0.2 },
  body: { fontSize: 15, color: colors.ink },
  small: { fontSize: 13, color: colors.muted },
  /** The italic serif accent, as in Alta's "What do you *wear*?". */
  /** The accent word keeps Alta's italic serif, now set big against the heavy grotesque. */
  accent: { fontFamily: fonts.serif, fontStyle: 'italic' as const, fontWeight: '400' as const, letterSpacing: -0.5 },
};

export const money = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: n % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;
