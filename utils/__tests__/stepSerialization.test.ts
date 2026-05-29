import {
  encodeDrillForShare,
  decodeDrillFromEncoded,
  maxShareableStepCount,
  normalizeStep,
  extractEncodedPayloadFromUrl,
  MAX_URL_LENGTH,
} from '../stepSerialization';
import { DrillStep } from '../../types/steps';

const dimensions = { width: 400, height: 800 };

function makeStep(offset: number): DrillStep {
  return {
    players: {
      team1: [
        { x: 100 + offset, y: 200 },
        { x: 300 + offset, y: 200 },
      ],
      team2: [
        { x: 100 + offset, y: 600 },
        { x: 300 + offset, y: 600 },
      ],
    },
    shuttle: { x: 200 + offset, y: 400 },
  };
}

describe('stepSerialization', () => {
  it('round-trips a drill through encode and decode', () => {
    const steps = [makeStep(0), makeStep(10), makeStep(20)];
    const encoded = encodeDrillForShare(steps, true, dimensions, 'Test drill');
    const urlPayload = extractEncodedPayloadFromUrl(encoded.url);
    expect(urlPayload).toBeTruthy();

    const decoded = decodeDrillFromEncoded(urlPayload!, dimensions);
    expect(decoded.isDoubles).toBe(true);
    expect(decoded.title).toBe('Test drill');
    expect(decoded.steps).toHaveLength(3);
    expect(decoded.steps[2].shuttle.x).toBeCloseTo(220, 0);
  });

  it('truncates to latest k steps when URL would exceed limit', () => {
    const manySteps = Array.from({ length: 80 }, (_, i) => makeStep(i * 2));
    const normalized = manySteps.map((s) => normalizeStep(s, dimensions));
    const k = maxShareableStepCount(normalized, true, 'Long drill name');
    expect(k).toBeGreaterThan(0);
    expect(k).toBeLessThan(80);

    const result = encodeDrillForShare(manySteps, true, dimensions, 'Long drill name');
    expect(result.truncated).toBe(true);
    expect(result.sharedSteps).toBe(k);
    expect(result.url.length).toBeLessThanOrEqual(MAX_URL_LENGTH);
  });

  it('extracts payload from import URLs', () => {
    const steps = [makeStep(0)];
    const { url } = encodeDrillForShare(steps, false, dimensions);
    expect(extractEncodedPayloadFromUrl(url)).toBeTruthy();
    expect(
      extractEncodedPayloadFromUrl(
        'badminton-court-simulator://import?d=abc'
      )
    ).toBe('abc');
  });
});
