import React from 'react';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Line,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { CourtTheme, courtThemeById } from '../constants/customization';

export interface LinesRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CourtSvgProps {
  width: number;
  height: number;
  /** Rect the painted court lines are stretched into; the mat fills the whole screen. */
  linesRect: LinesRect;
  theme?: CourtTheme;
}

// Real BWF proportions, 1 unit = 1 cm, full doubles court 610 x 1340.
// Shared with the 3D projection (utils/court3d.ts).
export const COURT_W = 610;
export const COURT_H = 1340;
export const SINGLES_X = [46, 564];
export const LONG_SERVICE_Y = [76, 1264];
export const SHORT_SERVICE_Y = [472, 868];
export const CENTER_X = 305;
export const NET_Y = 670;
export const LINE_UNITS = 4; // real 40mm painted lines
export const NET_OVERHANG_UNITS = 20; // posts sit past the doubles sidelines

// Deterministic scatter (fractions of the screen) for snow / stars.
const SCATTER: [number, number, number, number][] = [
  [0.10, 0.17, 3.2, 0.85], [0.24, 0.26, 2.2, 0.6], [0.45, 0.19, 2.6, 0.7],
  [0.71, 0.16, 3.4, 0.8], [0.87, 0.29, 2.2, 0.6], [0.16, 0.41, 2.8, 0.7],
  [0.59, 0.38, 2.0, 0.5], [0.82, 0.46, 3.0, 0.75], [0.35, 0.52, 2.4, 0.6],
  [0.10, 0.62, 3.2, 0.8], [0.55, 0.64, 2.0, 0.5], [0.89, 0.69, 2.6, 0.65],
  [0.30, 0.73, 3.0, 0.7], [0.70, 0.76, 2.2, 0.55], [0.49, 0.11, 2.0, 0.5],
  [0.82, 0.08, 2.6, 0.6],
];

function ThemeDeco({ theme, width, height }: { theme: CourtTheme; width: number; height: number }) {
  switch (theme.deco) {
    case 'stars':
      return (
        <>
          {SCATTER.map(([x, y, r, o], i) => (
            <Circle key={i} cx={x * width} cy={y * height} r={r * 0.55} fill="#FFFFFF" opacity={o * 0.8} />
          ))}
        </>
      );
    case 'snow':
      return (
        <>
          {SCATTER.map(([x, y, r, o], i) => (
            <Circle key={i} cx={x * width} cy={y * height} r={r} fill="#FFFFFF" opacity={o} />
          ))}
        </>
      );
    case 'sun':
      return (
        <>
          <Circle cx={width * 0.14} cy={height * 0.07} r={width * 0.22} fill="url(#sunGlow)" />
          <Circle cx={width * 0.14} cy={height * 0.07} r={width * 0.09} fill="#FFEBC2" opacity={0.85} />
        </>
      );
    case 'stripes': {
      const band = height / 9;
      return (
        <>
          {[0, 2, 4, 6, 8].map((i) => (
            <Rect key={i} x={0} y={i * band} width={width} height={band} fill="#FFFFFF" opacity={0.06} />
          ))}
        </>
      );
    }
    case 'planks': {
      const gap = width / 6;
      return (
        <>
          {[1, 2, 3, 4, 5].map((i) => (
            <Line key={i} x1={i * gap} y1={0} x2={i * gap} y2={height} stroke="rgba(60,30,5,0.28)" strokeWidth={1.4} />
          ))}
        </>
      );
    }
    case 'speckles':
      return (
        <>
          {SCATTER.slice(0, 10).map(([x, y, r], i) => (
            <Circle key={i} cx={x * width} cy={y * height} r={r * 0.5} fill="rgba(120,80,20,0.25)" />
          ))}
        </>
      );
    default:
      return null;
  }
}

/**
 * Full-bleed themed court: mat gradient edge-to-edge, painted lines stretched
 * into `linesRect`, dashed net with posts, plus per-theme decorations.
 */
function CourtSvgComponent({ width, height, linesRect, theme = courtThemeById('green') }: CourtSvgProps) {
  const sx = linesRect.width / COURT_W;
  const sy = linesRect.height / COURT_H;
  const X = (u: number) => linesRect.x + u * sx;
  const Y = (u: number) => linesRect.y + u * sy;

  const lineWidth = Math.max(1.5, LINE_UNITS * sx);
  const line = { stroke: theme.line, strokeWidth: lineWidth };
  // Cheap glow: the same lines re-drawn wider and translucent underneath.
  const halo = theme.glow ? { stroke: theme.glow, strokeWidth: lineWidth * 3.4 } : null;

  const netY = Y(NET_Y);
  const netOverhang = NET_OVERHANG_UNITS * sx;

  const paintLines = (stroke: { stroke: string; strokeWidth: number }) => (
    <>
      <Rect
        x={X(0)}
        y={Y(0)}
        width={linesRect.width}
        height={linesRect.height}
        fill="none"
        {...stroke}
      />
      {SINGLES_X.map((x) => (
        <Line key={`s${x}`} x1={X(x)} y1={Y(0)} x2={X(x)} y2={Y(COURT_H)} {...stroke} />
      ))}
      {LONG_SERVICE_Y.map((y) => (
        <Line key={`l${y}`} x1={X(0)} y1={Y(y)} x2={X(COURT_W)} y2={Y(y)} {...stroke} />
      ))}
      {SHORT_SERVICE_Y.map((y) => (
        <Line key={`ss${y}`} x1={X(0)} y1={Y(y)} x2={X(COURT_W)} y2={Y(y)} {...stroke} />
      ))}
      <Line x1={X(CENTER_X)} y1={Y(0)} x2={X(CENTER_X)} y2={Y(SHORT_SERVICE_Y[0])} {...stroke} />
      <Line x1={X(CENTER_X)} y1={Y(SHORT_SERVICE_Y[1])} x2={X(CENTER_X)} y2={Y(COURT_H)} {...stroke} />
    </>
  );

  return (
    <Svg width={width} height={height}>
      <Defs>
        {/* 178deg court gradient approximated as vertical */}
        <LinearGradient id="courtGradient" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={theme.top} />
          <Stop offset="0.55" stopColor={theme.mid ?? theme.top} />
          <Stop offset="1" stopColor={theme.bottom} />
        </LinearGradient>
        <RadialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFEBC2" stopOpacity={0.5} />
          <Stop offset="100%" stopColor="#FFEBC2" stopOpacity={0} />
        </RadialGradient>
      </Defs>

      <Rect x={0} y={0} width={width} height={height} fill="url(#courtGradient)" />

      <ThemeDeco theme={theme} width={width} height={height} />

      {halo && paintLines(halo)}
      {paintLines(line)}

      {/* Net: dashed line past both sidelines, filled post at each end */}
      <Line
        x1={X(0) - netOverhang}
        y1={netY}
        x2={X(COURT_W) + netOverhang}
        y2={netY}
        stroke={theme.net}
        strokeWidth={3}
        strokeDasharray="1 9"
        strokeLinecap="round"
      />
      <Circle cx={X(0) - netOverhang} cy={netY} r={5} fill={theme.net} />
      <Circle cx={X(COURT_W) + netOverhang} cy={netY} r={5} fill={theme.net} />
    </Svg>
  );
}

export const CourtSvg = React.memo(CourtSvgComponent);
