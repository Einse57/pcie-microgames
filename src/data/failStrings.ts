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
  'lane-widths': [
    'Wrong link width — check the form-factor or silk.',
    'M.2 NVMe is typically ×4, not ×16.',
    'PEG / graphics slots are usually ×16.',
    'A single-lane NIC is ×1 — do not oversize without need.',
    'Open-ended ×8 silk means the board routes eight lanes.',
  ],
  generations: [
    'Per-lane BW doubles each generation from Gen3 onward (rule of thumb).',
    'Gen4 ≈ 2 GB/s per lane; Gen5 ≈ 4 GB/s per lane.',
    'Gen3 is the ~1 GB/s-per-lane baseline most curricula use.',
    'Gen1/Gen2 are slower context — not the Gen4/5 ballpark.',
    'Match Gen to GT/s and the approximate GB/s per lane.',
  ],
  'throughput-calc': [
    'Aggregate = per-lane × lanes. Re-check Gen and width.',
    'Gen4 ×8 ≈ 16 GB/s (2 × 8), not Gen3 math.',
    'Off by a generation — BW roughly doubles each step Gen3→5.',
    'Lane count wrong: ×16 is 4× an ×4 at the same Gen.',
    'Watch the meter — Gen × lanes must hit the target exactly.',
  ],
  bifurcation: [
    'Oversubscribed: child widths sum past the ×16 parent.',
    'That split leaves a device without enough lanes.',
    '×8+×8 uses all 16 — you cannot add another ×4.',
    'Pick a bifurcation whose parts cover every device need.',
    'Lane budget exceeded — reduce a child or change the pattern.',
  ],
  'tradeoff-boss': [
    'Under target — that combo does not meet the bandwidth need.',
    'Constraint violation — board Gen or slot width blocks that pick.',
    'Works, but more overkill than the leanest valid option.',
    'Prefer meeting the target with the smallest aggregate headroom.',
    'Re-read power / Gen / slot constraints before selecting.',
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
  'lane-widths': [
    'Width matched to device / silk.',
    'Lane count looks right for that slot.',
    'Form-factor and link width agree.',
  ],
  generations: [
    'Generation ↔ per-lane BW locked in.',
    'Gen ladder check passed.',
    'GT/s and approximate GB/s aligned.',
  ],
  'throughput-calc': [
    'Aggregate bandwidth correct.',
    'Gen × lanes math checks out.',
    'Throughput estimate within tolerance.',
  ],
  bifurcation: [
    'Bifurcation legal — lanes fully accounted.',
    '×16 split covers every device without overspend.',
    'Root-port lane budget balanced.',
  ],
  'tradeoff-boss': [
    'Leanest valid Gen × width under constraints.',
    'Target met with minimal overkill.',
    'Tradeoff call looks solid.',
  ],
};

export function randomWin(id: MicrogameId): string {
  const list = WIN_STRINGS[id];
  return list[Math.floor(Math.random() * list.length)];
}
