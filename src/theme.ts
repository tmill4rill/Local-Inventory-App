/**
 * LocalPick theme — dark "gallery" look referenced from GOAT.
 * Black floor, product colour does the talking, white is the only action colour.
 * Green and amber are reserved for stock/status signals.
 */
export const colors = {
  bg: '#000000',
  card: '#141414',
  raised: '#1F1F1F',
  glass: 'rgba(28,28,28,0.92)',
  ink: '#F2F2EF',
  muted: '#8C8C86',
  border: '#2A2A2A',
  /** Primary action colour: white pills with black text, like GOAT's price and filter pills. */
  accent: '#FFFFFF',
  accentSoft: 'rgba(255,255,255,0.10)',
  onAccent: '#000000',
  green: '#5BD68E',
  greenSoft: 'rgba(91,214,142,0.14)',
  amber: '#F5B544',
  amberSoft: 'rgba(245,181,68,0.14)',
  neutralSoft: 'rgba(255,255,255,0.08)',
};

/** Tints in the product data are pastels; on black they become a low glow behind the item. */
export const glow = (hex: string, alpha = 0.18) => {
  const a = Math.round(alpha * 255).toString(16).padStart(2, '0');
  return `${hex}${a}`;
};

export const radius = { sm: 6, md: 12, lg: 16, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };

/** Space the floating dock (search + tabs) covers at the bottom of tab screens. */
export const DOCK_SPACE = 132;

export const type = {
  title: { fontSize: 28, fontWeight: '800' as const, color: colors.ink, letterSpacing: -0.8 },
  h2: { fontSize: 18, fontWeight: '700' as const, color: colors.ink, letterSpacing: -0.3 },
  body: { fontSize: 15, color: colors.ink },
  small: { fontSize: 13, color: colors.muted },
};

export const money = (n: number) => `$${n.toFixed(n % 1 === 0 ? 0 : 2)}`;
