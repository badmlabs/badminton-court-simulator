import { TeamPositions, CourtDimensions, PlayerPosition } from '../types/game';

// Default marker centers as fractions of the court lines rect (design spec):
// P1 25/30 · P2 75/30 · P3 25/84 · P4 75/84 · Shuttle 54/59.
// ponytail: marker positions are the view's top-left, so offset by half the
// default marker size (players 46, shuttle 40) since sizes aren't known here.
const PLAYER_HALF = 23;
const SHUTTLE_HALF = 20;

function rectOf(dims: CourtDimensions) {
  return dims.linesRect ?? { x: 0, y: 0, width: dims.width, height: dims.height };
}

function at(dims: CourtDimensions, fx: number, fy: number, half: number): PlayerPosition {
  const rect = rectOf(dims);
  return {
    x: rect.x + rect.width * fx - half,
    y: rect.y + rect.height * fy - half,
  };
}

export function getInitialPositions(isDoublesMode: boolean, courtDimensions: CourtDimensions): TeamPositions {
  if (isDoublesMode) {
    return {
      team1: [
        at(courtDimensions, 0.25, 0.3, PLAYER_HALF), // P1
        at(courtDimensions, 0.75, 0.3, PLAYER_HALF), // P2
      ],
      team2: [
        at(courtDimensions, 0.25, 0.84, PLAYER_HALF), // P3
        at(courtDimensions, 0.75, 0.84, PLAYER_HALF), // P4
      ],
    };
  }
  return {
    team1: [at(courtDimensions, 0.5, 0.3, PLAYER_HALF)],
    team2: [at(courtDimensions, 0.5, 0.84, PLAYER_HALF)],
  };
}

export function getInitialShuttle(courtDimensions: CourtDimensions): PlayerPosition {
  return at(courtDimensions, 0.54, 0.59, SHUTTLE_HALF);
}
