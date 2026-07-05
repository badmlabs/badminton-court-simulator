/**
 * Catalog for the Customize overhaul: player looks (circle + full-body
 * mascots), shuttle styles and court themes, with their free/Pro split.
 * Pure data — rendering lives in components/mascots.tsx and CourtSvg.
 */

export type CircleLookId = 'classic' | 'jersey' | 'initials' | 'photo';
export type MascotId =
  | 'panda'
  | 'fox'
  | 'bear'
  | 'tiger'
  | 'frog'
  | 'penguin'
  | 'koala'
  | 'owl';
export type LookId = CircleLookId | MascotId;

export interface MascotMeta {
  id: MascotId;
  name: string;
  /** Action-pose caption shown on Pro tiles ("jump smash" …). */
  pose?: string;
  pro: boolean;
}

export const CIRCLE_LOOKS: { id: CircleLookId; name: string }[] = [
  { id: 'classic', name: 'Classic' },
  { id: 'jersey', name: 'Jersey' },
  { id: 'initials', name: 'Initials' },
  { id: 'photo', name: 'Photo' },
];

export const MASCOTS: MascotMeta[] = [
  { id: 'panda', name: 'Panda', pro: false },
  { id: 'fox', name: 'Fox', pro: false },
  { id: 'bear', name: 'Bear', pose: 'jump smash', pro: true },
  { id: 'tiger', name: 'Tiger', pose: 'sprint', pro: true },
  { id: 'frog', name: 'Frog', pose: 'flying leap', pro: true },
  { id: 'penguin', name: 'Penguin', pose: 'slide save', pro: true },
  { id: 'koala', name: 'Koala', pose: 'gold cape', pro: true },
  { id: 'owl', name: 'Owl', pose: 'night cape', pro: true },
];

const MASCOT_IDS = new Set<string>(MASCOTS.map((m) => m.id));

export function isMascot(look: LookId): look is MascotId {
  return MASCOT_IDS.has(look);
}

export function mascotMeta(id: MascotId): MascotMeta {
  return MASCOTS.find((m) => m.id === id)!;
}

// ─── Shuttle styles ──────────────────────────────────────────────────────

export type ShuttleStyleId =
  | 'classic'
  | 'chalk'
  | 'golden'
  | 'smash'
  | 'frost'
  | 'night';

export interface ShuttleStyle {
  id: ShuttleStyleId;
  name: string;
  pro: boolean;
  /** Marker chip fill; 'transparent' for outline-only styles. */
  bg: string;
  /** Chip ring; defaults to the standard marker ring when omitted. */
  ring?: string;
  /** Shuttle glyph color. */
  glyph: string;
  /** Motion-trail dot colors, oldest → newest; presence means "trail style". */
  trail?: string[];
}

export const SHUTTLE_STYLES: ShuttleStyle[] = [
  { id: 'classic', name: 'Classic', pro: false, bg: '#FFFFFF', glyph: '#123B29' },
  {
    id: 'chalk',
    name: 'Chalk',
    pro: false,
    bg: 'transparent',
    ring: 'rgba(255, 255, 255, 0.85)',
    glyph: '#FFFFFF',
  },
  { id: 'golden', name: 'Golden Bird', pro: true, bg: '#FFC94D', glyph: '#5A3A06' },
  {
    id: 'smash',
    name: 'Smash Trail',
    pro: true,
    bg: '#FFFFFF',
    glyph: '#123B29',
    trail: ['#FF7455', '#FF8A55', '#FFC94D'],
  },
  { id: 'frost', name: 'Frostbite', pro: true, bg: '#D6F1F8', glyph: '#1E6A80' },
  {
    id: 'night',
    name: 'Night Glow',
    pro: true,
    bg: '#101C30',
    ring: 'rgba(159, 232, 255, 0.65)',
    glyph: '#9FE8FF',
    trail: ['#9FE8FF', '#9FE8FF', '#9FE8FF'],
  },
];

export function shuttleStyleById(id: ShuttleStyleId): ShuttleStyle {
  return SHUTTLE_STYLES.find((s) => s.id === id) ?? SHUTTLE_STYLES[0];
}

// ─── Court themes ────────────────────────────────────────────────────────

export type CourtThemeId =
  | 'green'
  | 'blue'
  | 'night'
  | 'winter'
  | 'golden'
  | 'grass'
  | 'gym'
  | 'beach';

export type CourtDeco = 'stars' | 'snow' | 'sun' | 'stripes' | 'planks' | 'speckles';

export interface CourtTheme {
  id: CourtThemeId;
  name: string;
  pro: boolean;
  /** Vertical mat gradient stops. */
  top: string;
  mid?: string;
  bottom: string;
  /** Painted line color. */
  line: string;
  /** Net + posts color (solid, pops over the lines). */
  net: string;
  /** Soft halo drawn behind the lines (Night Match glow). */
  glow?: string;
  deco?: CourtDeco;
}

export const COURT_THEMES: CourtTheme[] = [
  {
    id: 'green',
    name: 'Classic Green',
    pro: false,
    top: '#1E8F62',
    mid: '#15754E',
    bottom: '#0F5E40',
    line: 'rgba(255, 255, 255, 0.8)',
    net: '#FFFFFF',
  },
  {
    id: 'blue',
    name: 'Tournament Blue',
    pro: false,
    top: '#3D7BD9',
    mid: '#2F66C0',
    bottom: '#2251A6',
    line: 'rgba(255, 255, 255, 0.8)',
    net: '#FFFFFF',
  },
  {
    id: 'night',
    name: 'Night Match',
    pro: true,
    top: '#16203C',
    mid: '#0C1328',
    bottom: '#070B1A',
    line: 'rgba(191, 233, 255, 0.92)',
    net: '#BFE9FF',
    glow: 'rgba(120, 200, 255, 0.28)',
    deco: 'stars',
  },
  {
    id: 'winter',
    name: 'Winter Rally',
    pro: true,
    top: '#93C2D1',
    mid: '#6FA6B8',
    bottom: '#527E93',
    line: 'rgba(255, 255, 255, 0.92)',
    net: '#FFFFFF',
    deco: 'snow',
  },
  {
    id: 'golden',
    name: 'Golden Hour',
    pro: true,
    top: '#E8945A',
    mid: '#C97445',
    bottom: '#A65432',
    line: 'rgba(255, 255, 255, 0.85)',
    net: '#FFFFFF',
    deco: 'sun',
  },
  {
    id: 'grass',
    name: 'Backyard Grass',
    pro: true,
    top: '#679E3E',
    mid: '#548833',
    bottom: '#41732A',
    line: 'rgba(255, 255, 255, 0.9)',
    net: '#FFFFFF',
    deco: 'stripes',
  },
  {
    id: 'gym',
    name: 'Retro Gym',
    pro: true,
    top: '#B47C44',
    mid: '#9F6A3A',
    bottom: '#8A5930',
    line: 'rgba(255, 255, 255, 0.9)',
    net: '#FFFFFF',
    deco: 'planks',
  },
  {
    id: 'beach',
    name: 'Beach Rally',
    pro: true,
    top: '#E3BC72',
    mid: '#D3A860',
    bottom: '#C3934E',
    line: 'rgba(255, 255, 255, 0.92)',
    net: '#FFFFFF',
    deco: 'speckles',
  },
];

export function courtThemeById(id: CourtThemeId): CourtTheme {
  return COURT_THEMES.find((t) => t.id === id) ?? COURT_THEMES[0];
}
