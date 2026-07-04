import { MD3DarkTheme, type MD3Theme } from 'react-native-paper';

/**
 * Central design tokens for the app — "Match Point" theme: full-bleed green
 * court with floating deep-green glass chrome, amber primary, coral
 * destructive. All components pull colors, fonts, spacing and radii from here.
 */
export const palette = {
  // Court surface (full-screen gradient) and lines
  courtTop: '#1E8F62',
  courtMid: '#15754E',
  courtBottom: '#0F5E40',
  bg: '#15754E',
  courtLine: 'rgba(255, 255, 255, 0.8)',

  // Glass surfaces. ponytail: no backdrop blur on RN Android without a new
  // dependency (expo-blur), so opacities are bumped slightly over the design
  // spec to keep sheets/dialogs readable; add expo-blur if real frost matters.
  glassPill: 'rgba(6, 26, 18, 0.42)',
  glassPillBorder: 'rgba(255, 255, 255, 0.21)',
  surface: 'rgba(8, 26, 18, 0.90)',
  surfaceBorder: 'rgba(255, 255, 255, 0.18)',
  surfaceRaised: 'rgba(16, 40, 29, 0.98)',
  surfaceSunken: 'rgba(0, 0, 0, 0.25)',
  dialog: 'rgba(10, 30, 21, 0.96)',
  dialogBorder: 'rgba(255, 255, 255, 0.16)',
  card: 'rgba(255, 255, 255, 0.07)',
  cardBorder: 'rgba(255, 255, 255, 0.09)',

  // Strokes
  hairline: 'rgba(255, 255, 255, 0.10)',
  hairlineStrong: 'rgba(255, 255, 255, 0.22)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.65)',
  textMuted: 'rgba(255, 255, 255, 0.50)',

  // Primary / active (amber) + destructive (coral)
  accent: '#FFC94D',
  accentSoft: 'rgba(255, 201, 77, 0.16)',
  onAccent: '#231604',
  danger: '#FF9B85',
  dangerAccent: '#FF7455',
  dangerSoft: 'rgba(255, 116, 85, 0.13)',
  dangerBorder: 'rgba(255, 116, 85, 0.42)',

  // Scrims
  overlay: 'rgba(2, 12, 8, 0.35)',
  overlayStrong: 'rgba(2, 12, 8, 0.62)',

  // Shuttle marker glyph on its white chip
  shuttleGlyph: '#123B29',
} as const;

/** Sora is the only family; pick the file per weight (Android can't
 *  synthesize weights from a single-weight font file). */
export const fonts = {
  regular: 'Sora_400Regular',
  semiBold: 'Sora_600SemiBold',
  bold: 'Sora_700Bold',
} as const;

export function sora(weight: '400' | '600' | '700') {
  return {
    fontFamily:
      weight === '700' ? fonts.bold : weight === '600' ? fonts.semiBold : fonts.regular,
  } as const;
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 18,
  xxl: 28,
} as const;

export const radii = {
  sm: 12,
  md: 16, // cards & buttons
  lg: 24, // dialog
  xl: 26, // sheet top corners
  dock: 28,
  pill: 999,
} as const;

export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  floating: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  amberGlow: {
    shadowColor: '#FFC94D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

/** Marker color choices shown in customization UIs. */
export const markerColors = [
  { name: 'Coral', value: '#ff7455' },
  { name: 'Blue', value: '#3e8dff' },
  { name: 'Amber', value: '#ffc94d' },
  { name: 'Mint', value: '#4ade80' },
  { name: 'Violet', value: '#c084fc' },
  { name: 'Cyan', value: '#22d3ee' },
  { name: 'White', value: '#ffffff' },
  { name: 'Orange', value: '#fb923c' },
  { name: 'Pink', value: '#f472b6' },
] as const;

/** Returns a readable foreground color for content drawn on a marker. */
export function markerContentColor(markerColor: string): string {
  return markerColor.toLowerCase() === '#ffffff' ? palette.shuttleGlyph : '#FFFFFF';
}

/** Returns the ring color drawn around a marker so it stays visible. */
export function markerRingColor(markerColor: string): string {
  return markerColor.toLowerCase() === '#ffffff'
    ? 'rgba(18, 59, 41, 0.25)'
    : 'rgba(255, 255, 255, 0.95)';
}

/** React Native Paper theme wired to the app palette. */
export const paperTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: palette.accent,
    onPrimary: palette.onAccent,
    primaryContainer: palette.accentSoft,
    onPrimaryContainer: palette.accent,
    background: palette.bg,
    onBackground: palette.textPrimary,
    surface: palette.surfaceRaised,
    onSurface: palette.textPrimary,
    surfaceVariant: palette.surfaceRaised,
    onSurfaceVariant: palette.textSecondary,
    outline: palette.hairlineStrong,
    outlineVariant: palette.hairline,
    error: palette.dangerAccent,
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level0: 'transparent',
      level1: palette.surfaceRaised,
      level2: palette.surfaceRaised,
      level3: palette.surfaceRaised,
      level4: palette.surfaceRaised,
      level5: palette.surfaceRaised,
    },
  },
};
