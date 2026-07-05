import { useCallback, useState, useEffect } from 'react';
import { TeamPositions, CourtDimensions, PlayerPosition } from '../types/game';
import { CourtStep, NormalizedStep } from '../types/drill';
import { getInitialPositions, getInitialShuttle } from '../utils/courtPositions';
import { denormalizeSteps } from '../utils/stepSharing';

interface GhostPosition {
  team1: PlayerPosition[];
  team2: PlayerPosition[];
  shuttle: PlayerPosition;
}

interface PositionState {
  players: TeamPositions;
  shuttle: PlayerPosition;
  ghostPositions: GhostPosition;
  lastStationaryPositions?: {
    team1: PlayerPosition[];
    team2: PlayerPosition[];
    shuttle: PlayerPosition;
  };
}

const hasMoved = (a: PlayerPosition, b: PlayerPosition) => a.x !== b.x || a.y !== b.y;

function statesDiffer(a: PositionState, b: PositionState): boolean {
  return (
    hasMoved(a.shuttle, b.shuttle) ||
    (['team1', 'team2'] as const).some((team) =>
      a.players[team].some((pos, i) => hasMoved(pos, b.players[team][i]))
    )
  );
}

export function useCourtPositions(courtDimensions: CourtDimensions) {
  const [isDoubles, setIsDoubles] = useState(true);
  const [showPlayerTrails, setShowPlayerTrails] = useState(true);
  const [showShuttleTrail, setShowShuttleTrail] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [positionHistory, setPositionHistory] = useState<PositionState[]>([]);
  // Every drag accumulates here as the pending step; nothing commits until
  // Next banks it (the old Together mode, now always on).
  const [tempPosition, setTempPosition] = useState<PositionState | null>(null);
  // Playback: a loaded drill starts locked — walk/play the steps; Fork exits
  // to editing at the current step.
  const [isPlayback, setIsPlayback] = useState(false);
  // Initialize state with ghost markers at the same positions as players and shuttle
  useEffect(() => {
    const initialPlayers = getInitialPositions(isDoubles, courtDimensions);
    const initialShuttle = getInitialShuttle(courtDimensions);
    const initialState = {
      players: initialPlayers,
      shuttle: initialShuttle,
      ghostPositions: {
        team1: [...initialPlayers.team1],
        team2: [...initialPlayers.team2],
        shuttle: initialShuttle,
      },
    };
    setPositionHistory([initialState]);
  }, []);

  const updatePosition = useCallback((
    newState: Pick<PositionState, 'players' | 'shuttle'>,
    base: PositionState,
    committed: PositionState,
    team?: 'team1' | 'team2',
    index?: number,
    isShuttle: boolean = false,
    isStart: boolean = false
  ) => {
    if (isStart) {
      // Refresh only the dragged piece's ghost, seeding it from the committed
      // state so re-dragging a piece mid-step keeps its step-start ghost.
      const ghostPositions = {
        team1: [...base.ghostPositions.team1],
        team2: [...base.ghostPositions.team2],
        shuttle: base.ghostPositions.shuttle,
      };

      if (team && typeof index === 'number') {
        ghostPositions[team][index] = committed.players[team][index];
      } else if (isShuttle) {
        ghostPositions.shuttle = committed.shuttle;
      }

      setTempPosition({
        ...newState,
        ghostPositions,
      });
    } else {
      // During drag, maintain existing ghost positions
      setTempPosition(prevTemp => ({
        ...newState,
        ghostPositions: prevTemp?.ghostPositions || base.ghostPositions,
      }));
    }
  }, []);

  const updatePlayerPosition = useCallback((
    team: 'team1' | 'team2',
    index: number,
    newPosition: PlayerPosition,
    isStart: boolean = false
  ) => {
    const committed = positionHistory[currentIndex];
    // Base on the in-progress temp state so moving a second piece doesn't
    // clobber the first piece's uncommitted move in the pending step.
    const base = tempPosition ?? committed;
    const newPlayers = {
      ...base.players,
      [team]: base.players[team].map((pos, i) =>
        i === index ? newPosition : pos
      ),
    };

    updatePosition({
      players: newPlayers,
      shuttle: base.shuttle
    }, base, committed, team, index, false, isStart);
  }, [currentIndex, positionHistory, tempPosition, updatePosition]);

  const updateShuttlePosition = useCallback((
    newPosition: PlayerPosition,
    isStart: boolean = false
  ) => {
    const committed = positionHistory[currentIndex];
    const base = tempPosition ?? committed;
    updatePosition({
      players: base.players,
      shuttle: newPosition
    }, base, committed, undefined, undefined, true, isStart);
  }, [currentIndex, positionHistory, tempPosition, updatePosition]);

  // Pieces with uncommitted moves right now (drives the armed Next button).
  const hasPending =
    !!tempPosition &&
    !!positionHistory[currentIndex] &&
    statesDiffer(tempPosition, positionHistory[currentIndex]);

  // Bank the pending moves as ONE history step (the amber Next in Redo's slot).
  const bankStep = useCallback(() => {
    if (!tempPosition) return;
    // Skip no-op commits: a tap without a drag must not add a history step.
    if (statesDiffer(tempPosition, positionHistory[currentIndex])) {
      setPositionHistory(prev => [...prev.slice(0, currentIndex + 1), tempPosition]);
      setCurrentIndex(prev => prev + 1);
    }
    setTempPosition(null);
  }, [currentIndex, positionHistory, tempPosition]);

  const handlePositionChangeComplete = useCallback(() => {
    // Moves stay pending until Next banks them; only a no-op temp (tap
    // without a drag) is dropped so it can't shadow undo/redo rendering.
    if (tempPosition && !statesDiffer(tempPosition, positionHistory[currentIndex])) {
      setTempPosition(null);
    }
  }, [currentIndex, positionHistory, tempPosition]);

  // Reset ghost markers when resetting positions
  const resetPositions = useCallback(() => {
    const initialPlayers = getInitialPositions(isDoubles, courtDimensions);
    const initialShuttle = getInitialShuttle(courtDimensions);
    const initialState = {
      players: initialPlayers,
      shuttle: initialShuttle,
      ghostPositions: {
        team1: [...initialPlayers.team1],
        team2: [...initialPlayers.team2],
        shuttle: initialShuttle,
      },
    };
    setPositionHistory([initialState]);
    setCurrentIndex(0);
    setTempPosition(null);
    setIsPlayback(false);
  }, [isDoubles, courtDimensions]);

  // Collapse the stack to a single step holding the current positions — for
  // setting up a starting formation, then recording steps from it.
  const clearSteps = useCallback(() => {
    const current = positionHistory[currentIndex];
    if (!current) return;
    setPositionHistory([{
      players: current.players,
      shuttle: current.shuttle,
      ghostPositions: {
        team1: [...current.players.team1],
        team2: [...current.players.team2],
        shuttle: current.shuttle,
      },
    }]);
    setCurrentIndex(0);
    setTempPosition(null);
  }, [currentIndex, positionHistory]);

  // Fork: unlock a loaded drill for editing at the current step. The next
  // committed drag naturally truncates the steps ahead.
  const exitPlayback = useCallback(() => {
    setIsPlayback(false);
  }, []);

  // Jump back to the first step (autoplay loop restart).
  const goToStart = useCallback(() => {
    setCurrentIndex(0);
  }, []);

  const toggleGameMode = useCallback((value: boolean) => {
    setIsDoubles(value);
    const initialPlayers = getInitialPositions(value, courtDimensions);
    const initialShuttle = getInitialShuttle(courtDimensions);
    const initialState = {
      players: initialPlayers,
      shuttle: initialShuttle,
      ghostPositions: {
        team1: [...initialPlayers.team1],
        team2: [...initialPlayers.team2],
        shuttle: initialShuttle,
      },
    };
    setPositionHistory([initialState]);
    setCurrentIndex(0);
    setTempPosition(null);
    setIsPlayback(false);
  }, [courtDimensions]);

  // With moves pending, Undo discards them (markers glide back); only then
  // does it start walking committed history.
  const undo = useCallback(() => {
    if (hasPending) {
      setTempPosition(null);
      return;
    }
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  }, [currentIndex, hasPending]);

  const redo = useCallback(() => {
    if (hasPending) return; // the slot is Next while moves are pending
    if (currentIndex < positionHistory.length - 1) setCurrentIndex(prev => prev + 1);
  }, [currentIndex, hasPending, positionHistory.length]);

  // Jump straight to a history step (3D playback wraps around with this).
  const goToStep = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, positionHistory.length - 1)));
  }, [positionHistory.length]);

  const togglePlayerTrails = useCallback(() => {
    setShowPlayerTrails(prev => !prev);
  }, []);

  const toggleShuttleTrail = useCallback(() => {
    setShowShuttleTrail(prev => !prev);
  }, []);

  const getStepsSnapshot = useCallback((): CourtStep[] => {
    return positionHistory.slice(0, currentIndex + 1).map((state) => ({
      players: state.players,
      shuttle: state.shuttle,
      ghostPositions: state.ghostPositions,
    }));
  }, [currentIndex, positionHistory]);

  const loadSteps = useCallback((
    steps: CourtStep[],
    nextIsDoubles: boolean = isDoubles
  ) => {
    if (!steps.length) return;

    if (nextIsDoubles !== isDoubles) {
      setIsDoubles(nextIsDoubles);
    }

    setPositionHistory(steps);
    setCurrentIndex(0);
    setTempPosition(null);
    setIsPlayback(true);
  }, [isDoubles]);

  const loadNormalizedSteps = useCallback((
    steps: NormalizedStep[],
    nextIsDoubles: boolean = isDoubles
  ) => {
    const courtSteps = denormalizeSteps(steps, courtDimensions);
    loadSteps(courtSteps, nextIsDoubles);
  }, [courtDimensions, isDoubles, loadSteps]);

  return {
    isDoubles,
    playerPositions: tempPosition?.players || positionHistory[currentIndex]?.players || getInitialPositions(isDoubles, courtDimensions),
    shuttlePosition: tempPosition?.shuttle || positionHistory[currentIndex]?.shuttle || getInitialShuttle(courtDimensions),
    updatePlayerPosition,
    updateShuttlePosition,
    handlePositionChangeComplete,
    hasPending,
    bankStep,
    isPlayback,
    exitPlayback,
    goToStart,
    toggleGameMode,
    resetPositions,
    clearSteps,
    undo,
    redo,
    goToStep,
    canUndo: hasPending || currentIndex > 0,
    canRedo: currentIndex < positionHistory.length - 1,
    lastStationaryPlayers: positionHistory[currentIndex]?.lastStationaryPositions?.team1 && {
      team1: positionHistory[currentIndex].lastStationaryPositions.team1,
      team2: positionHistory[currentIndex].lastStationaryPositions.team2,
    },
    lastStationaryShuttle: positionHistory[currentIndex]?.lastStationaryPositions?.shuttle,
    ghostPositions: tempPosition?.ghostPositions || positionHistory[currentIndex]?.ghostPositions,
    showPlayerTrails,
    showShuttleTrail,
    togglePlayerTrails,
    toggleShuttleTrail,
    getStepsSnapshot,
    loadSteps,
    loadNormalizedSteps,
    stepCount: currentIndex + 1,
    totalSteps: positionHistory.length,
  };
} 