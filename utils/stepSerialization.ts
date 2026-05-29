import { CourtDimensions, PlayerPosition, TeamPositions } from '../types/game';
import {
  DrillStep,
  EncodeDrillResult,
  NormalizedPoint,
  NormalizedStep,
  ShareableDrillPayload,
} from '../types/steps';
import { decodeBase64Url, encodeBase64Url } from './base64url';

export const DRILL_PAYLOAD_VERSION = 1 as const;
export const MAX_URL_LENGTH = 2048;
export const MAX_TITLE_LENGTH = 40;
export const APP_SCHEME = 'badminton-court-simulator';
export const IMPORT_HOST = 'import';
export const QUERY_PARAM = 'd';

const COORD_PRECISION = 3;

function roundCoord(value: number): number {
  const factor = 10 ** COORD_PRECISION;
  return Math.round(value * factor) / factor;
}

function normalizePoint(
  point: PlayerPosition,
  dimensions: CourtDimensions
): NormalizedPoint {
  return [
    roundCoord(point.x / dimensions.width),
    roundCoord(point.y / dimensions.height),
  ];
}

function denormalizePoint(
  point: NormalizedPoint,
  dimensions: CourtDimensions
): PlayerPosition {
  return {
    x: point[0] * dimensions.width,
    y: point[1] * dimensions.height,
  };
}

export function normalizeStep(
  step: DrillStep,
  dimensions: CourtDimensions
): NormalizedStep {
  return [
    step.players.team1.map((p) => normalizePoint(p, dimensions)),
    step.players.team2.map((p) => normalizePoint(p, dimensions)),
    normalizePoint(step.shuttle, dimensions),
  ];
}

export function denormalizeStep(
  step: NormalizedStep,
  dimensions: CourtDimensions
): DrillStep {
  return {
    players: {
      team1: step[0].map((p) => denormalizePoint(p, dimensions)),
      team2: step[1].map((p) => denormalizePoint(p, dimensions)),
    },
    shuttle: denormalizePoint(step[2], dimensions),
  };
}

export function buildSharePayload(
  steps: DrillStep[],
  isDoubles: boolean,
  dimensions: CourtDimensions,
  title?: string
): ShareableDrillPayload {
  const trimmedTitle = title?.trim().slice(0, MAX_TITLE_LENGTH);
  return {
    v: DRILL_PAYLOAD_VERSION,
    d: isDoubles ? 1 : 0,
    ...(trimmedTitle ? { t: trimmedTitle } : {}),
    s: steps.map((step) => normalizeStep(step, dimensions)),
  };
}

export function serializePayload(payload: ShareableDrillPayload): string {
  return encodeBase64Url(JSON.stringify(payload));
}

export function deserializePayload(encoded: string): ShareableDrillPayload {
  const raw = decodeBase64Url(encoded);
  const parsed = JSON.parse(raw) as ShareableDrillPayload;
  if (parsed.v !== DRILL_PAYLOAD_VERSION || !Array.isArray(parsed.s) || parsed.s.length === 0) {
    throw new Error('Invalid drill payload');
  }
  if (parsed.d !== 0 && parsed.d !== 1) {
    throw new Error('Invalid drill mode');
  }
  return parsed;
}

export function buildImportUrl(encodedPayload: string): string {
  return `${APP_SCHEME}://${IMPORT_HOST}?${QUERY_PARAM}=${encodedPayload}`;
}

/** Largest k (latest steps) whose import URL fits within MAX_URL_LENGTH. */
export function maxShareableStepCount(
  normalizedSteps: NormalizedStep[],
  isDoubles: boolean,
  title?: string
): number {
  if (normalizedSteps.length === 0) return 0;

  let low = 1;
  let high = normalizedSteps.length;
  let best = 0;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const subset = normalizedSteps.slice(-mid);
    const payload: ShareableDrillPayload = {
      v: DRILL_PAYLOAD_VERSION,
      d: isDoubles ? 1 : 0,
      ...(title?.trim() ? { t: title.trim().slice(0, MAX_TITLE_LENGTH) } : {}),
      s: subset,
    };
    const url = buildImportUrl(serializePayload(payload));
    if (url.length <= MAX_URL_LENGTH) {
      best = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return best;
}

export function encodeDrillForShare(
  steps: DrillStep[],
  isDoubles: boolean,
  dimensions: CourtDimensions,
  title?: string
): EncodeDrillResult {
  if (steps.length === 0) {
    throw new Error('No steps to share');
  }

  const normalized = steps.map((step) => normalizeStep(step, dimensions));
  const shareableCount = maxShareableStepCount(normalized, isDoubles, title);

  if (shareableCount === 0) {
    throw new Error('Drill is too large to share as a link');
  }

  const sharedNormalized = normalized.slice(-shareableCount);
  const payload = buildSharePayload(
    sharedNormalized.map((step) => denormalizeStep(step, dimensions)),
    isDoubles,
    dimensions,
    title
  );
  const encoded = serializePayload(payload);
  const url = buildImportUrl(encoded);

  return {
    url,
    totalSteps: steps.length,
    sharedSteps: shareableCount,
    truncated: shareableCount < steps.length,
  };
}

export function decodeDrillPayload(encoded: string): ShareableDrillPayload {
  return deserializePayload(encoded);
}

export function payloadToDrillSteps(
  payload: ShareableDrillPayload,
  dimensions: CourtDimensions
): DrillStep[] {
  return payload.s.map((step) => denormalizeStep(step, dimensions));
}

export function decodeDrillFromEncoded(
  encoded: string,
  dimensions: CourtDimensions
): { steps: DrillStep[]; isDoubles: boolean; title?: string } {
  const payload = decodeDrillPayload(encoded);
  return {
    steps: payloadToDrillSteps(payload, dimensions),
    isDoubles: payload.d === 1,
    title: payload.t,
  };
}

export function extractEncodedPayloadFromUrl(url: string): string | null {
  if (!url.includes(IMPORT_HOST)) return null;
  const match = url.match(new RegExp(`[?&]${QUERY_PARAM}=([^&#]+)`));
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}
