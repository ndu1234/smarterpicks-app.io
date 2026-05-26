export const Colors = {
  bg: '#0d0b08',
  bgElevated: '#161310',
  bgSurface: '#1e1a14',
  accent: '#d4a843',
  accentDim: '#8a6f2d',
  text: '#f4efe4',
  textMuted: '#8a8580',
  textDim: '#5a5550',
  border: '#2a2520',
  borderStrong: '#3a3530',
  win: '#6dbe7a',
  loss: '#d96565',
  push: '#888888',
} as const;

export const Fonts = {
  display: 'Fraunces_400Regular',
  displayItalic: 'Fraunces_400Regular_Italic',
  body: 'InterTight_400Regular',
  bodySemiBold: 'InterTight_600SemiBold',
  bodyBold: 'InterTight_700Bold',
  mono: 'JetBrainsMono_400Regular',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
} as const;

export const SportColors: Record<string, string> = {
  NBA: '#d4a843',
  NFL: '#d4a843',
  MLB: '#d4a843',
  NHL: '#d4a843',
};
