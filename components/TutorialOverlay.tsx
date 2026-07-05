import React from 'react';
import { DimensionValue, Pressable, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { palette, sora } from '../constants/theme';

/**
 * Building blocks for the first-run tutorial ("chalk coach-marks" design):
 * a dimming scrim, Caveat chalk text, hand-drawn SVG arrows, amber dashed
 * rings around the one live control, progress dots and the Skip pill.
 * They render inside BadmintonCourt for the court pages and inside the
 * DrillHub/Settings modals for the sheet pages (RN modals sit above any
 * overlay drawn in the base screen).
 */

export const TUTORIAL_STEP_COUNT = 6;
export const TUTORIAL_SCRIM = 'rgba(2, 12, 8, 0.58)';

export function caveat(weight: '600' | '700') {
  return {
    fontFamily: weight === '700' ? 'Caveat_700Bold' : 'Caveat_600SemiBold',
  } as const;
}

const chalkShadow = {
  textShadowColor: 'rgba(0, 0, 0, 0.6)',
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 10,
} as const;

/** One line of chalk handwriting; nest <AmberWord> for highlighted words. */
export function Chalk({
  size,
  weight = '700',
  dim = false,
  style,
  children,
}: {
  size: number;
  weight?: '600' | '700';
  dim?: boolean;
  style?: TextStyle;
  children: React.ReactNode;
}) {
  return (
    <Text
      style={[
        caveat(weight),
        chalkShadow,
        {
          fontSize: size,
          lineHeight: Math.round(size * 1.15),
          color: dim ? 'rgba(255, 255, 255, 0.92)' : '#FFFFFF',
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function AmberWord({ children }: { children: React.ReactNode }) {
  return <Text style={{ color: palette.accent }}>{children}</Text>;
}

/** Wavy amber underline flourish under a chalk headline. */
export function AmberSquiggle({ width = 118 }: { width?: number }) {
  const waves = Math.max(2, Math.round(width / 24));
  let d = 'M4 6';
  for (let i = 0; i < waves; i++) d += ' q12 -7 24 0';
  return (
    <Svg width={width} height={10} viewBox={`0 0 ${4 + waves * 24 + 4} 10`} style={{ marginTop: 3 }}>
      <Path d={d} stroke={palette.accent} strokeWidth={2.5} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/**
 * Hand-drawn chalk arrow: a curved body plus a two-stroke head, positioned
 * absolutely by the caller. Path data comes straight from the design mocks.
 */
export function ChalkArrow({
  box,
  viewBox,
  d,
  head,
  dotted = false,
  strokeWidth = 3,
}: {
  box: {
    left?: DimensionValue;
    top?: DimensionValue;
    right?: DimensionValue;
    bottom?: DimensionValue;
    width: number;
    height: number;
  };
  viewBox: string;
  d: string;
  head: string;
  /** Dotted body reads as a travel path rather than a pointer. */
  dotted?: boolean;
  strokeWidth?: number;
}) {
  return (
    <View pointerEvents="none" style={[styles.arrowBox, box]}>
      <Svg width={box.width} height={box.height} viewBox={viewBox}>
        <Path
          d={d}
          stroke="rgba(255, 255, 255, 0.9)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={dotted ? '0.5 8.5' : undefined}
          fill="none"
        />
        <Path
          d={head}
          stroke="rgba(255, 255, 255, 0.9)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}

/**
 * Amber dashed ring marking the ONE live control. Wrap the control in a
 * relatively-positioned View and drop this in; it never eats touches.
 */
export function TutorialRing({
  inset = -7,
  radius = 999,
  rotate = '-8deg',
}: {
  inset?: number;
  radius?: number;
  rotate?: string;
}) {
  return (
    <>
      {/* soft halo (Android can't glow-shadow, so fake it with a wide ring) */}
      <View
        pointerEvents="none"
        style={[
          styles.ringHalo,
          { top: inset - 5, bottom: inset - 5, left: inset - 5, right: inset - 5, borderRadius: radius },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.ring,
          {
            top: inset,
            bottom: inset,
            left: inset,
            right: inset,
            borderRadius: radius,
            transform: [{ rotate }],
          },
        ]}
      />
    </>
  );
}

/** Dashed drop-target hint circle (step 1's "anywhere over here"). */
export function GhostTarget({ size = 46, style }: { size?: number; style?: ViewStyle }) {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.ghostTarget,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    />
  );
}

/** Amber progress dots; current dot enlarged, all amber + "done!" when done. */
export function TutorialDots({ current, done = false }: { current: number; done?: boolean }) {
  return (
    <View pointerEvents="none" style={styles.dotsPill}>
      {Array.from({ length: TUTORIAL_STEP_COUNT }, (_, i) => {
        const reached = done || i < current;
        if (!done && i === current) {
          return (
            <View key={i} style={styles.dotHalo}>
              <View style={[styles.dot, styles.dotDone, { width: 7, height: 7 }]} />
            </View>
          );
        }
        return <View key={i} style={[styles.dot, reached && styles.dotDone]} />;
      })}
      {done && <Text style={[caveat('700'), styles.doneText]}>done!</Text>}
    </View>
  );
}

export function SkipPill({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.skipPill} accessibilityLabel="Skip tour">
      <Text style={styles.skipText}>Skip tour</Text>
      <MaterialCommunityIcons name="close" size={11} color="rgba(255, 255, 255, 0.6)" />
    </Pressable>
  );
}

/**
 * The four court pages of the tour (move, bank, drills, customize). The two
 * sheet pages live inside DrillHubPanel/SettingsPanel — RN modals render
 * above anything drawn here. Rings around dock/header buttons are wrapped
 * around the real buttons in BadmintonCourt so they track layout; everything
 * else is art-positioned from the design mock against the measured court.
 */
export function CourtTutorial({
  step,
  screenW,
  headerTop,
  dockTop,
  linesRect,
  p1,
  onSkip,
}: {
  step: number;
  screenW: number;
  headerTop: number;
  dockTop: number;
  linesRect: { x: number; y: number; width: number; height: number };
  p1: { x: number; y: number; size: number };
  onSkip: () => void;
}) {
  const chromeTop = headerTop + 44 + 14;
  const lx = (f: number) => linesRect.x + linesRect.width * f;
  const ly = (f: number) => linesRect.y + linesRect.height * f;

  return (
    <>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.scrim]} />
      <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, styles.chrome]}>
        {step === 0 && (
          <>
            <GhostTarget style={{ left: lx(0.52) - 23, top: ly(0.5) - 23 }} />
            <ChalkArrow
              box={{ left: lx(0.12), top: ly(0.1), width: 120, height: 120 }}
              viewBox="0 0 120 120"
              d="M16 6 C 52 18, 28 60, 70 84 S 94 98, 99 102"
              head="M99 102 l-13 -2.5 M99 102 l-3.5 -12.5"
              dotted
            />
            <View
              pointerEvents="none"
              style={{ position: 'absolute', left: lx(0.4), top: ly(0.13), width: 216, transform: [{ rotate: '-2deg' }] }}
            >
              <Chalk size={28}>
                grab <AmberWord>Player 1</AmberWord>
              </Chalk>
              <Chalk size={20} weight="600" dim>
                drag him anywhere — he doesn&apos;t bite
              </Chalk>
              <AmberSquiggle width={118} />
            </View>
            {/* live ring riding on Player 1 (tracks the drag) */}
            <View
              pointerEvents="none"
              style={{ position: 'absolute', left: p1.x, top: p1.y, width: p1.size, height: p1.size }}
            >
              <TutorialRing inset={-9} />
            </View>
          </>
        )}

        {step === 1 && (
          <>
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: screenW / 2 - 161,
                top: ly(0.58),
                width: 322,
                alignItems: 'center',
                transform: [{ rotate: '-1.5deg' }],
              }}
            >
              <Chalk size={26} style={{ textAlign: 'center' }}>move a few pieces —</Chalk>
              <Chalk size={19} weight="600" dim style={{ textAlign: 'center' }}>
                they travel as <AmberWord>one step</AmberWord>. just one? solo run.
              </Chalk>
              <Chalk size={25} style={{ textAlign: 'center', marginTop: 12 }}>
                tap <AmberWord>Next</AmberWord> to bank it
              </Chalk>
            </View>
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: screenW * 0.54,
                top: dockTop - 74,
                width: 170,
                transform: [{ rotate: '-2deg' }],
              }}
            >
              <Chalk size={15.5} weight="600" dim style={{ textAlign: 'right' }}>
                (that&apos;s Redo&apos;s slot — it moonlights)
              </Chalk>
            </View>
            <ChalkArrow
              box={{ left: screenW * 0.27, top: dockTop - 158, width: 90, height: 170 }}
              viewBox="0 0 90 170"
              d="M64 10 C 30 50, 74 110, 48 150"
              head="M48 150 l-3.5 -13 M48 150 l12 -5"
            />
          </>
        )}

        {step === 2 && (
          <>
            <View
              pointerEvents="none"
              style={{ position: 'absolute', left: 22, top: headerTop + 84, width: 190, transform: [{ rotate: '-3deg' }] }}
            >
              <Chalk size={17} weight="600" dim>
                see? <AmberWord>Step 2</AmberWord> already
              </Chalk>
            </View>
            <ChalkArrow
              box={{ left: 34, top: headerTop + 34, width: 40, height: 46 }}
              viewBox="0 0 40 46"
              d="M10 44 C 2 30, 8 16, 20 6"
              head="M20 6 l-11.5 1.5 M20 6 l1 11.5"
              strokeWidth={2.5}
            />
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: screenW / 2 - 140,
                top: ly(0.72),
                width: 280,
                alignItems: 'center',
                transform: [{ rotate: '-1deg' }],
              }}
            >
              <Chalk size={25} style={{ textAlign: 'center' }}>your steps need a home —</Chalk>
              <Chalk size={24} style={{ textAlign: 'center', marginTop: 4 }}>
                tap <AmberWord>Drills</AmberWord>
              </Chalk>
            </View>
            <ChalkArrow
              box={{ left: screenW - 140, top: dockTop - 128, width: 90, height: 140 }}
              viewBox="0 0 90 140"
              d="M16 12 C 52 40, 36 84, 70 122"
              head="M70 122 l-12 -4.5 M70 122 l1 -13"
            />
          </>
        )}

        {step === 5 && (
          <>
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: screenW / 2 - 125,
                top: headerTop + 180,
                width: 250,
                transform: [{ rotate: '-2deg' }],
              }}
            >
              <Chalk size={27}>last stop —</Chalk>
              <Chalk size={22} weight="600" dim>
                make the markers <AmberWord>yours</AmberWord>
              </Chalk>
              <AmberSquiggle width={100} />
            </View>
            <ChalkArrow
              box={{ left: screenW - 102, top: headerTop + 38, width: 90, height: 150 }}
              viewBox="0 0 90 150"
              d="M28 142 C 66 112, 40 56, 62 18"
              head="M62 18 l-13 1 M62 18 l3.5 13"
            />
          </>
        )}

        <View pointerEvents="none" style={[styles.dotsHost, { top: chromeTop }]}>
          <TutorialDots current={step} />
        </View>
        <View style={[styles.skipHost, { top: chromeTop }]}>
          <SkipPill onPress={onSkip} />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  scrim: {
    backgroundColor: TUTORIAL_SCRIM,
    zIndex: 30,
    elevation: 30,
  },
  chrome: {
    zIndex: 50,
    elevation: 50,
  },
  dotsHost: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  skipHost: {
    position: 'absolute',
    right: 16,
  },
  arrowBox: {
    position: 'absolute',
  },
  ring: {
    position: 'absolute',
    borderWidth: 2.5,
    borderStyle: 'dashed',
    borderColor: palette.accent,
  },
  ringHalo: {
    position: 'absolute',
    borderWidth: 5,
    borderColor: 'rgba(255, 201, 77, 0.14)',
  },
  ghostTarget: {
    position: 'absolute',
    borderWidth: 2.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  dotsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 30,
    paddingHorizontal: 13,
    borderRadius: 999,
    backgroundColor: 'rgba(6, 26, 18, 0.62)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
  },
  dotDone: {
    backgroundColor: palette.accent,
  },
  // Current dot: 7px amber core inside a 3px translucent halo ring.
  dotHalo: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 3,
    borderColor: 'rgba(255, 201, 77, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: {
    fontSize: 15,
    color: palette.accent,
    marginLeft: 4,
  },
  skipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(6, 26, 18, 0.62)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  skipText: {
    ...sora('600'),
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
  },
});
