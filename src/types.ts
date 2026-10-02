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
  seconds: number;
  hubSlot: { label: string; x: number; y: number };
}

export interface RoundResult {
  id: MicrogameId;
  won: boolean;
  failReason?: string;
}
