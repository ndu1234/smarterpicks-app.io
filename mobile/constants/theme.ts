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

// Proportional nesting: outer(16) → inner(8) → innermost(4) — 2:1 ratio at each level
export const Radius = {
  sm: 4,   // innermost elements: badges, tags
  md: 8,   // inner elements: buttons inside cards
  lg: 12,  // mid-level containers
  xl: 16,  // outer cards and screens
} as const;

// Semantic type scale — use these tokens, never hardcode font sizes
export const TypeScale = {
  // Display — hero numbers, taglines
  display2xl: 38,
  displayXl: 28,
  displayLg: 22,

  // Body — readable content
  bodyLg: 16,
  bodyMd: 14,
  bodySm: 13,
  bodyXs: 12,

  // Label — UI labels, badges, metadata
  labelLg: 11,
  labelMd: 10,
  labelSm: 9,
} as const;

// Tracking (letterSpacing) — tighten headings & numbers, loosen labels
export const Tracking = {
  tight:   -0.5,  // display numbers, odds, scores
  tighter: -0.8,  // large hero display numbers
  normal:   0,    // body copy
  wide:     0.5,  // small labels
  wider:    1.2,  // uppercase button labels
  widest:   1.8,  // mono tags like "NBA", "LIVE"
} as const;

// Card elevation shadow — creates physical depth without harsh borders
export const Elevation = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4, // Android
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

export const SportColors: Record<string, string> = {
  NBA: '#C9082A',
  NFL: '#013369',
  MLB: '#041E42',
  NHL: '#2d2d2d',
};
