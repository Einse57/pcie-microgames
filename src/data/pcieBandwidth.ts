/** Commonly taught approximate unidirectional payload bandwidth (GB/s per lane). */
export const PER_LANE_GBPS: Record<number, number> = {
  1: 0.25,
  2: 0.5,
  3: 1,
  4: 2,
  5: 4,
};

export const GEN_LABEL: Record<number, string> = {
  1: 'Gen1',
  2: 'Gen2',
  3: 'Gen3',
  4: 'Gen4',
  5: 'Gen5',
};

export const GEN_GTPS: Record<number, string> = {
  1: '2.5 GT/s',
  2: '5.0 GT/s',
  3: '8.0 GT/s',
  4: '16 GT/s',
  5: '32 GT/s',
};

export const LANE_WIDTHS = [1, 4, 8, 16] as const;
export type LaneWidth = (typeof LANE_WIDTHS)[number];

export function aggregateGBps(gen: number, lanes: number): number {
  return (PER_LANE_GBPS[gen] ?? 0) * lanes;
}

/** Format approx payload bandwidth; always includes a unit. */
export function formatGBps(n: number): string {
  if (n < 1) return `≈ ${(n * 1000).toFixed(0)} MB/s`;
  if (Number.isInteger(n)) return `≈ ${n} GB/s`;
  return `≈ ${n.toFixed(2)} GB/s`;
}

/** Compact payload label without leading ≈ (for tight UI chips). */
export function formatGBpsShort(n: number): string {
  if (n < 1) return `${(n * 1000).toFixed(0)} MB/s`;
  if (Number.isInteger(n)) return `${n} GB/s`;
  return `${n.toFixed(2)} GB/s`;
}

/** Always-visible unit key for bandwidth / tradeoff games. */
export const UNIT_KEY = 'GT/s = link rate · GB/s ≈ payload BW';

/** Reference card lines for the throughput drill peek. */
export const REFERENCE_CARD_LINES = [
  'Approx. unidirectional payload (per lane):',
  'Gen3 ≈ 1 GB/s · Gen4 ≈ 2 GB/s · Gen5 ≈ 4 GB/s',
  'Gen1 ≈ 0.25 · Gen2 ≈ 0.5 (context)',
  'Aggregate ≈ per-lane × lane count (×1 / ×4 / ×8 / ×16)',
  UNIT_KEY,
];
