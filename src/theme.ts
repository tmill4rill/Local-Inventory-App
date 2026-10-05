export const colors = {
  bg: '#FAF7F2',
  card: '#FFFFFF',
  ink: '#1B1A17',
  muted: '#7C776D',
  border: '#E8E2D8',
  accent: '#C8553D',
  accentSoft: '#F8E4DE',
  green: '#2F7D5B',
  greenSoft: '#DDF0E6',
  amber: '#B7791F',
  amberSoft: '#FBEFD5',
};

export const radius = { sm: 8, md: 14, lg: 20, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };

export const type = {
  title: { fontSize: 26, fontWeight: '800' as const, color: colors.ink, letterSpacing: -0.5 },
  h2: { fontSize: 18, fontWeight: '700' as const, color: colors.ink },
  body: { fontSize: 15, color: colors.ink },
  small: { fontSize: 13, color: colors.muted },
};

export const money = (n: number) => `$${n.toFixed(n % 1 === 0 ? 0 : 2)}`;
