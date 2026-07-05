import React, { useState, useEffect } from 'react';
import { Animated, Easing, StyleSheet, GestureResponderEvent, Text, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { isMascot, LookId } from '../constants/customization';
import { MascotView, MASCOT_ASPECT } from './mascots';
import {
  markerContentColor,
  markerRingColor,
  palette,
  sora,
} from '../constants/theme';

interface PlayerMarkerProps {
  position: { x: number; y: number };
  color: string;
  size?: number;
  /** Full-body mascot looks mirror for left-handed players. */
  isLeftHanded?: boolean;
  icon?: string;
  iconType?: 'icon' | 'text' | 'photo';
  /** Selected look; mascot looks render the full-body figure. */
  look?: LookId;
  /** Number shown on a mascot's chest chip ("1"…"4"). */
  label?: string;
  /** Ring/glyph overrides for shuttle styles; default derives from color. */
  ringColor?: string;
  contentColor?: string;
  /** Amber ring: this piece is part of the armed Together step. */
  linked?: boolean;
  /** Duration of the glide between steps (ms); user-tunable in Customize. */
  glideMs?: number;
  /** Playback: the piece ignores touches entirely. */
  locked?: boolean;
  onPositionChange?: (newPosition: { x: number; y: number }) => void;
  onPositionStart?: (newPosition: { x: number; y: number }) => void;
  onPositionChangeComplete?: () => void;
  initialSize?: number;
}

export function PlayerMarker({
  position,
  color,
  size,
  isLeftHanded = false,
  icon = 'account',
  iconType = 'icon',
  look = 'classic',
  label,
  ringColor,
  contentColor,
  linked = false,
  glideMs = 260,
  locked = false,
  onPositionChange,
  onPositionStart,
  onPositionChangeComplete,
  initialSize = 30
}: PlayerMarkerProps) {
  const [touchOffset, setTouchOffset] = useState({ x: 0, y: 0 });
  const [isLifted, setIsLifted] = useState(false);
  const markerSize = size ?? initialSize;
  const translate = React.useRef(new Animated.ValueXY({ x: position.x, y: position.y })).current;

  // While the finger is down the marker must track it 1:1; any other position
  // change (undo/redo/reset/drill load/Together cancel) glides so the eye can
  // follow where each piece went.
  const { x: targetX, y: targetY } = position;
  useEffect(() => {
    if (isLifted) {
      translate.stopAnimation();
      translate.setValue({ x: targetX, y: targetY });
    } else {
      Animated.timing(translate, {
        toValue: { x: targetX, y: targetY },
        duration: glideMs,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [glideMs, isLifted, targetX, targetY, translate]);

  const mascot = isMascot(look) ? look : null;
  const glyphColor = contentColor ?? markerContentColor(color);

  // The touch/positioning box stays size x size for every look, so drill
  // coordinates, trails and 3D pins are look-agnostic; the taller mascot
  // figure is drawn centered on that box and overflows it visually.
  const mascotHeight = markerSize * MASCOT_ASPECT;

  return (
    <Animated.View
      style={[
        styles.marker,
        mascot
          ? styles.mascotBox
          : {
              backgroundColor: color,
              borderColor: linked ? palette.accent : ringColor ?? markerRingColor(color),
              borderWidth: linked ? 3 : 2.5,
              shadowOpacity: isLifted ? 0.6 : 0.35,
              shadowRadius: isLifted ? 10 : 5,
              elevation: isLifted ? 10 : 4,
            },
        mascot && linked && styles.mascotLinked,
        {
          width: markerSize,
          height: markerSize,
          borderRadius: markerSize / 2,
          transform: [
            ...translate.getTranslateTransform(),
            { scale: isLifted ? 1.12 : 1 },
          ],
        },
      ]}
      onStartShouldSetResponder={() => !locked}
      onMoveShouldSetResponder={() => !locked}
      onResponderGrant={(event: GestureResponderEvent) => {
        const touch = event.nativeEvent;
        setTouchOffset({
          x: touch.pageX - position.x,
          y: touch.pageY - position.y,
        });
        onPositionStart?.(position);
        setIsLifted(true);
      }}
      onResponderMove={(event: GestureResponderEvent) => {
        const touch = event.nativeEvent;
        onPositionChange?.({
          x: touch.pageX - touchOffset.x,
          y: touch.pageY - touchOffset.y,
        });
      }}
      onResponderRelease={() => {
        onPositionChangeComplete?.();
        setIsLifted(false);
      }}
    >
      {!mascot && (
        <>
          {iconType === 'icon' && (
            <MaterialCommunityIcons
              name={icon as any}
              size={markerSize * 0.48}
              color={glyphColor}
            />
          )}
          {iconType === 'text' && (
            <Text style={[
              styles.textIcon,
              {
                fontSize: markerSize * 0.4,
                color: glyphColor,
              }
            ]}>
              {icon}
            </Text>
          )}
          {iconType === 'photo' && (
            <Image
              source={{ uri: icon }}
              style={[
                styles.photoIcon,
                {
                  width: markerSize * 0.8,
                  height: markerSize * 0.8,
                  borderRadius: markerSize * 0.4,
                }
              ]}
            />
          )}
        </>
      )}
      {mascot != null && (
        // The taller figure is drawn centered on the round touch box.
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: (markerSize - mascotHeight) / 2,
            left: 0,
            width: markerSize,
            height: mascotHeight,
          }}
        >
          <MascotView
            mascot={mascot}
            band={color}
            label={label}
            width={markerSize}
            flipped={isLeftHanded}
          />
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  marker: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascotBox: {
    backgroundColor: 'transparent',
  },
  mascotLinked: {
    borderWidth: 3,
    borderColor: palette.accent,
  },
  textIcon: {
    ...sora('700'),
    textAlign: 'center',
  },
  photoIcon: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});
