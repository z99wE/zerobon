import type { HourlyAtmosphericForecast } from '../../types';

export const PBL_CHART = {
  width: 800,
  height: 180,
  paddingX: 40,
  paddingY: 24,
  maxPbl: 1400,
} as const;

export interface PblPoint {
  x: number;
  y: number;
  item: HourlyAtmosphericForecast;
}

export interface PblCurve {
  points: PblPoint[];
  pathData: string;
  areaData: string;
  activePoint: PblPoint;
}

/** Builds the smoothed PBL altitude curve and its filled area for the radar chart. */
export function buildPblCurve(
  forecast: readonly HourlyAtmosphericForecast[],
  selectedHour: HourlyAtmosphericForecast
): PblCurve {
  const { width, height, paddingX, paddingY, maxPbl } = PBL_CHART;
  const points: PblPoint[] = forecast.map((item, index) => {
    const x = paddingX + (index / (forecast.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - (item.pblHeightMeters / maxPbl) * (height - 2 * paddingY);
    return { x, y, item };
  });

  const pathData = points.reduce((acc, curr, index) => {
    if (index === 0) return `M ${curr.x} ${curr.y}`;
    const prev = points[index - 1]!;
    const midX = prev.x + (curr.x - prev.x) / 2;
    return `${acc} C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`;
  }, '');

  const first = points[0]!;
  const last = points[points.length - 1]!;
  const areaData = `${pathData} L ${last.x} ${height - paddingY} L ${first.x} ${height - paddingY} Z`;
  const activePoint = points.find((point) => point.item.hour === selectedHour.hour) ?? points[4] ?? first;

  return { points, pathData, areaData, activePoint };
}
