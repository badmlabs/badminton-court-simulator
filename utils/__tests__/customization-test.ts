import {
  CIRCLE_LOOKS,
  COURT_THEMES,
  courtThemeById,
  isMascot,
  MASCOTS,
  SHUTTLE_STYLES,
  shuttleStyleById,
} from '../../constants/customization';
import { getHueFromColor, hueToHex } from '../color';

describe('customization catalog', () => {
  it('matches the designed free/Pro split', () => {
    // Free: 4 circle looks + Fox & Koala; Pro: 6 action-pose mascots.
    expect(CIRCLE_LOOKS).toHaveLength(4);
    expect(MASCOTS.filter((m) => !m.pro).map((m) => m.id)).toEqual(['fox', 'koala']);
    expect(MASCOTS.filter((m) => m.pro)).toHaveLength(6);
    // Every Pro mascot advertises its action pose on the tile.
    MASCOTS.filter((m) => m.pro).forEach((m) => expect(m.pose).toBeTruthy());

    // Shuttle: 2 free · 4 Pro. Court: 2 free · 6 Pro.
    expect(SHUTTLE_STYLES.filter((s) => !s.pro)).toHaveLength(2);
    expect(SHUTTLE_STYLES.filter((s) => s.pro)).toHaveLength(4);
    expect(COURT_THEMES.filter((t) => !t.pro)).toHaveLength(2);
    expect(COURT_THEMES.filter((t) => t.pro)).toHaveLength(6);
  });

  it('keeps ids unique across looks', () => {
    const ids = [...CIRCLE_LOOKS.map((l) => l.id), ...MASCOTS.map((m) => m.id)];
    expect(new Set(ids).size).toBe(ids.length);
    expect(isMascot('panda')).toBe(true);
    expect(isMascot('classic')).toBe(false);
  });

  it('resolves ids and falls back to the free default', () => {
    expect(shuttleStyleById('night').trail).toBeDefined();
    expect(shuttleStyleById('classic').pro).toBe(false);
    expect(courtThemeById('winter').deco).toBe('snow');
    // Unknown id (e.g. stale persisted value) falls back safely.
    expect(courtThemeById('gone' as never).id).toBe('green');
    expect(shuttleStyleById('gone' as never).id).toBe('classic');
  });
});

describe('hue math', () => {
  it('round-trips primary hues', () => {
    expect(hueToHex(0)).toBe('#ff0000');
    expect(hueToHex(120)).toBe('#00ff00');
    expect(hueToHex(240)).toBe('#0000ff');
    expect(Math.round(getHueFromColor('#00ff00'))).toBe(120);
    expect(Math.round(getHueFromColor(hueToHex(37)))).toBe(37);
  });

  it('reports 0 for white/black/invalid instead of blowing up', () => {
    expect(getHueFromColor('#ffffff')).toBe(0);
    expect(getHueFromColor('#000000')).toBe(0);
    expect(getHueFromColor('not-a-color')).toBe(0);
  });
});
