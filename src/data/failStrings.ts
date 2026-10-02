import type { MicrogameId } from '../types';

const FAILS: Record<MicrogameId, string[]> = {
  'link-training': [
    'LTSSM stuck in Recovery — renegotiate Gen and realign lanes.',
    'Gen mismatch: downstream advertised a different speed.',
    'Lane deskew failed. Align all four lanes before training.',
    'Training timed out. Keep Gen and lanes consistent, then retry.',
    'Equalization failed. Recheck speed selection and lane state.',
  ],
  'packet-sort': [
    'That was a DLLP, not a TLP — Data Link layer.',
    'Ordered Sets belong on the Physical layer, not Transaction.',
    'ACK is a DLLP, not a Memory Write TLP.',
    'SKP is an Ordered Set — Physical layer bin.',
    'Flow-control credit updates are DLLPs.',
  ],
  'bar-claim': [
    'BAR overlap: two devices cannot share the same MMIO range.',
    'That lands on the VGA hole — shift the window.',
    'Window too wide or out of bounds for the map.',
    'Unaligned / conflicting BAR — pick a free span.',
    'Region already claimed. Choose an empty range.',
  ],
};

export function randomFail(id: MicrogameId): string {
  const list = FAILS[id];
  return list[Math.floor(Math.random() * list.length)];
}

export const WIN_STRINGS: Record<MicrogameId, string[]> = {
  'link-training': [
    'Link Up — L0 achieved.',
    'Gen locked and lanes aligned.',
    'Training complete. Deskew looks clean.',
  ],
  'packet-sort': [
    'Layers sorted: Transaction / Data Link / Physical.',
    'Packet taxonomy correct.',
    'TLP / DLLP / Ordered Set triage complete.',
  ],
  'bar-claim': [
    'BAR claimed — MMIO window is clean.',
    'No overlaps. Enumeration can proceed.',
    'Address map looks tidy.',
  ],
};

export function randomWin(id: MicrogameId): string {
  const list = WIN_STRINGS[id];
  return list[Math.floor(Math.random() * list.length)];
}
