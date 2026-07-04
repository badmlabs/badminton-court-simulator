import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PlayerPosition } from '../types/game';

interface PositionTrailProps {
  currentPosition: PlayerPosition;
  ghostPosition: PlayerPosition;
  /** Size of the marker the trail belongs to; positions are its top-left. */
  markerSize?: number;
}

// Match Point trails: thin dashed white path + ghost ring at the prior spot.
const TRAIL_WHITE = 'rgba(255, 255, 255, 0.6)';

export function PositionTrail({ currentPosition, ghostPosition, markerSize = 46 }: PositionTrailProps) {
  const half = markerSize / 2;
  // Calculate the angle and length of the line
  const dx = currentPosition.x - ghostPosition.x;
  const dy = currentPosition.y - ghostPosition.y;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const length = Math.sqrt(dx * dx + dy * dy);

  // Create dots for the trail, fading toward the ghost (older) end
  const DOT_SIZE = 5;
  const DOT_SPACING = 12;
  const numberOfDots = Math.floor(length / DOT_SPACING);
  const dots = Array.from({ length: numberOfDots }, (_, i) => (
    <View
      key={i}
      style={[
        styles.dot,
        {
          left: ghostPosition.x + half - DOT_SIZE / 2 + (i * DOT_SPACING * Math.cos(angle * Math.PI / 180)),
          top: ghostPosition.y + half - DOT_SIZE / 2 + (i * DOT_SPACING * Math.sin(angle * Math.PI / 180)),
          width: DOT_SIZE,
          height: DOT_SIZE,
          opacity: 0.25 + 0.6 * ((i + 1) / Math.max(numberOfDots, 1)),
        },
      ]}
    />
  ));

  return (
    <>
      {dots}
      <View
        style={[
          styles.ghostMarker,
          {
            left: ghostPosition.x + half - 10,
            top: ghostPosition.y + half - 10,
          },
        ]}
      >
        <View style={styles.ghostCore} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  ghostMarker: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: TRAIL_WHITE,
    backgroundColor: 'transparent',
    opacity: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostCore: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: TRAIL_WHITE,
  },
});
