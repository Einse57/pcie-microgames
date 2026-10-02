import type { MicrogameId } from '../types';

const FAILS: Record<MicrogameId, string[]> = {
  'link-training': [
    'LTSSM stuck in Recovery \u2014 renegotiate Gen and realign lanes.',
    'Gen mismatch: downstream advertised a different speed.',
    'Lane deskew failed. Align all four lanes before training.',
    'Training timed out. Keep Gen and lanes consistent, then retry.',
    'Equalization failed. Recheck speed selection and lane state.',
  ],
  'packet-sort': [
    'That was a DLLP, not a TLP \u2014 Data Link layer.',
    'Ordered Sets belong on the Physical layer, not Transaction.',
    'ACK is a DLLP, not a Memory Write TLP.',
    'SKP is an Ordered Set \u2014 Physical layer bin.',
    'Flow-control credit updates are DLLPs.',
  ],
  'bar-claim': [
    'BAR overlap: two devices cannot share the same MMIO range.',
    'That lands on the VGA hole \u2014 shift the window.',
    'Window too wide or out of bounds for the map.',
    'Unaligned / conflicting BAR \u2014 pick a free span.',
    'Region already claimed. Choose an empty range.',
  ],
  'lane-widths': [
    'Wrong link width \u2014 check the form-factor or silk.',
    'M.2 NVMe is typically \u00d74, not \u00d716.',
    'PEG / graphics slots are usually \u00d716.',
    'A single-lane NIC is \u00d71 \u2014 do not oversize without need.',
    'Open-ended \u00d78 silk means the board routes eight lanes.',
  ],
  generations: [
    'Per-lane BW doubles each generation from Gen3 onward (rule of thumb).',
    'Gen4 \u2248 2 GB/s per lane; Gen5 \u2248 4 GB/s per lane.',
    'Gen3 is the ~1 GB/s-per-lane baseline most curricula use.',
    'Gen1/Gen2 are slower context \u2014 not the Gen4/5 ballpark.',
    'Match Gen to GT/s and the approximate GB/s per lane.',
  ],
  'throughput-calc': [
    'Aggregate = per-lane \u00d7 lanes. Re-check Gen and width.',
    'Gen4 \u00d78 \u2248 16 GB/s (2 \u00d7 8), not Gen3 math.',
    'Off by a generation \u2014 BW roughly doubles each step Gen3\u21925.',
    'Lane count wrong: \u00d716 is 4\u00d7 an \u00d74 at the same Gen.',
    'Watch the meter \u2014 Gen \u00d7 lanes must hit the target exactly.',
  ],
  bifurcation: [
    'Oversubscribed: child widths sum past the \u00d716 parent.',
    'That split leaves a device without enough lanes.',
    '\u00d78+\u00d78 uses all 16 \u2014 you cannot add another \u00d74.',
    'Pick a bifurcation whose parts cover every device need.',
    'Lane budget exceeded \u2014 reduce a child or change the pattern.',
  ],
  'tradeoff-boss': [
    'Under target \u2014 that combo does not meet the bandwidth need.',
    'Constraint violation \u2014 board Gen or slot width blocks that pick.',
    'Works, but more overkill than the leanest valid option.',
    'Prefer meeting the target with the smallest aggregate headroom.',
    'Re-read power / Gen / slot constraints before selecting.',
  ],
  'root-vs-switch': [
    'That port sits on the Root Complex \u2014 Root Port, not Switch DS.',
    'Switch downstream ports hang under a switch chip, not the RC.',
    'Endpoints are leaf devices \u2014 GPU, NIC, NVMe \u2014 not ports.',
    'Root Complex owns root ports; switches fan the tree out.',
    'Re-check where the highlight sits on the fabric diagram.',
  ],
  'dma-path': [
    'DMA data rides EP \u2192 Root \u2192 Memory \u2014 not a CPU memcpy loop.',
    'CPU may program descriptors; the payload still DMAs via the RC.',
    'No ACS/P2P path \u2014 do not send peer-to-peer for this host write.',
    'Pick the root-complex path into system memory.',
    'Device is the DMA master toward host DRAM.',
  ],
  'p2p-route': [
    'Same switch with P2P on \u2014 take the direct switch path.',
    'Separate root ports without P2P \u2014 bounce through host memory.',
    'No ACS/P2P fabric between those endpoints \u2014 host bounce required.',
    'Direct P2P needs a supported peer path (often same switch).',
    'Re-read whether the endpoints share a switch or only root ports.',
  ],
};

export function randomFail(id: MicrogameId): string {
  const list = FAILS[id];
  return list[Math.floor(Math.random() * list.length)];
}

export const WIN_STRINGS: Record<MicrogameId, string[]> = {
  'link-training': [
    'Link Up \u2014 L0 achieved.',
    'Gen locked and lanes aligned.',
    'Training complete. Deskew looks clean.',
  ],
  'packet-sort': [
    'Layers sorted: Transaction / Data Link / Physical.',
    'Packet taxonomy correct.',
    'TLP / DLLP / Ordered Set triage complete.',
  ],
  'bar-claim': [
    'BAR claimed \u2014 MMIO window is clean.',
    'No overlaps. Enumeration can proceed.',
    'Address map looks tidy.',
  ],
  'lane-widths': [
    'Width matched to device / silk.',
    'Lane count looks right for that slot.',
    'Form-factor and link width agree.',
  ],
  generations: [
    'Generation \u2194 per-lane BW locked in.',
    'Gen ladder check passed.',
    'GT/s and approximate GB/s aligned.',
  ],
  'throughput-calc': [
    'Aggregate bandwidth correct.',
    'Gen \u00d7 lanes math checks out.',
    'Throughput estimate within tolerance.',
  ],
  bifurcation: [
    'Bifurcation legal \u2014 lanes fully accounted.',
    '\u00d716 split covers every device without overspend.',
    'Root-port lane budget balanced.',
  ],
  'tradeoff-boss': [
    'Leanest valid Gen \u00d7 width under constraints.',
    'Target met with minimal overkill.',
    'Tradeoff call looks solid.',
  ],
  'root-vs-switch': [
    'Fabric roles sorted: Root / Switch / Endpoint.',
    'Port vs leaf triage complete.',
    'Topology labels look right.',
  ],
  'dma-path': [
    'DMA path locked: EP \u2192 Root \u2192 Memory.',
    'Payload rides the root complex \u2014 no software copy.',
    'Host memory write path correct.',
  ],
  'p2p-route': [
    'Route chosen: P2P or host bounce as appropriate.',
    'Peer path vs bounce call looks solid.',
    'Fabric routing decision correct.',
  ],
};

export function randomWin(id: MicrogameId): string {
  const list = WIN_STRINGS[id];
  return list[Math.floor(Math.random() * list.length)];
}
