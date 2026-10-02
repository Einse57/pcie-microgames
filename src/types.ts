export type Screen =
  | 'hub'
  | 'campaign'
  | 'link-training'
  | 'packet-sort'
  | 'bar-claim'
  | 'result';

export type MicrogameId = 'link-training' | 'packet-sort' | 'bar-claim';

export type GameOutcome = 'win' | 'lose' | null;

export interface MicrogameMeta {
  id: MicrogameId;
  title: string;
  tagline: string;
  concept: string;
  /** Soft reference duration (seconds) for the timer bar — not a fail limit */
  seconds: number;
  hubSlot: { label: string; x: number; y: number };
}

export interface RoundResult {
  id: MicrogameId;
  won: boolean;
  /** Elapsed time in seconds for this microgame (includes mistake penalties) */
  timeSeconds: number;
  failReason?: string;
}

/** Format seconds for UI (e.g. 12.4s, 1:05.2) */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '—';
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  return `${m}:${s.toFixed(1).padStart(4, '0')}`;
}
