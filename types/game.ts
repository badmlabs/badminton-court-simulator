export interface PlayerPosition {
  x: number;
  y: number;
}

export interface TeamPositions {
  team1: PlayerPosition[];
  team2: PlayerPosition[];
}

export interface CourtDimensions {
  width: number;
  height: number;
  /** Rect the painted court lines occupy on screen (court fills the screen). */
  linesRect?: { x: number; y: number; width: number; height: number };
}
