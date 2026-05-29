import { PlayerPosition, TeamPositions } from './game';

/** One court snapshot (players + shuttle). */
export interface DrillStep {
  players: TeamPositions;
  shuttle: PlayerPosition;
}

/** Compact normalized step: team1, team2, shuttle as [x,y] tuples in 0–1 space. */
export type NormalizedPoint = [number, number];
export type NormalizedStep = [NormalizedPoint[], NormalizedPoint[], NormalizedPoint];

export interface ShareableDrillPayload {
  v: 1;
  d: 0 | 1;
  t?: string;
  s: NormalizedStep[];
}

export interface EncodeDrillResult {
  url: string;
  totalSteps: number;
  sharedSteps: number;
  truncated: boolean;
}
