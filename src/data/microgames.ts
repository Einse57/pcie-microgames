import type { ChapterId, ChapterMeta, MicrogameId, MicrogameMeta } from '../types';

export const CHAPTERS: ChapterMeta[] = [
  {
    id: 'fundamentals',
    title: '1 · Fundamentals',
    blurb: 'Links, packets, and BARs — how a device comes up on the bus.',
    order: 0,
  },
  {
    id: 'bandwidth',
    title: '2 · Bandwidth',
    blurb: 'Widths, Gen ladder, and pipe-fill throughput puzzles.',
    order: 1,
  },
  {
    id: 'topology',
    title: '3 · Topology / Bifurcation',
    blurb: 'Carve an ×16 root into device lane blocks.',
    order: 2,
  },
  {
    id: 'tradeoffs',
    title: '4 · Tradeoffs',
    blurb: 'Build a link under Gen/slot locks with least overkill.',
    order: 3,
  },
  {
    id: 'fabric',
    title: '5 · Fabric / Ops',
    blurb: 'Root ports, switches, DMA paths, and P2P vs host bounce.',
    order: 4,
  },
];

export const MICROGAMES: MicrogameMeta[] = [
  {
    id: 'link-training',
    title: 'Link Training',
    tagline: 'Negotiate Gen speed and align lanes before LTSSM stalls.',
    concept: 'Link training / Gen negotiation',
    tip: 'Both ends must agree on Gen; all active lanes must deskew before L0.',
    seconds: 8,
    chapter: 'fundamentals',
    hubSlot: { label: 'CPU \u2194 Chipset', x: 18, y: 28 },
  },
  {
    id: 'packet-sort',
    title: 'Packet Sort',
    tagline: 'Classify TLP, DLLP, and Ordered Set traffic by layer.',
    concept: 'TLP vs DLLP vs Ordered Set',
    tip: 'TLP = Transaction, DLLP = Data Link, Ordered Sets = Physical.',
    seconds: 10,
    chapter: 'fundamentals',
    hubSlot: { label: 'Root Port', x: 52, y: 22 },
  },
  {
    id: 'bar-claim',
    title: 'BAR Claim',
    tagline: 'Place an MMIO window with no address overlaps.',
    concept: 'Base Address Registers',
    tip: 'BARs claim MMIO ranges; two devices cannot share the same window.',
    seconds: 8,
    chapter: 'fundamentals',
    hubSlot: { label: 'Endpoint', x: 72, y: 58 },
  },
  {
    id: 'lane-widths',
    title: 'Lane Widths',
    tagline: 'Snap the right width silhouette into the slot.',
    concept: 'Link width (lane count)',
    tip: 'Form-factor cues: M.2 NVMe \u2248 \u00d74, PEG GPU \u2248 \u00d716, simple NIC \u2248 \u00d71.',
    seconds: 12,
    chapter: 'bandwidth',
    hubSlot: { label: 'Slot silk', x: 28, y: 72 },
  },
  {
    id: 'generations',
    title: 'Generations',
    tagline: 'Climb the speed ladder \u2014 tap the Gen that hits the target.',
    concept: 'PCIe generation vs GT/s',
    tip: 'GT/s = link rate; bar height \u2248 payload GB/s per lane (Gen3\u22481, Gen4\u22482, Gen5\u22484).',
    seconds: 12,
    chapter: 'bandwidth',
    hubSlot: { label: 'PHY speed', x: 48, y: 68 },
  },
  {
    id: 'throughput-calc',
    title: 'Throughput Calc',
    tagline: 'Fill the capacity meter with Gen \u00d7 width.',
    concept: 'Aggregate link bandwidth',
    tip: 'Pipe shows \u2248 aggregate payload GB/s; Gen tiles show GT/s link rate.',
    seconds: 14,
    chapter: 'bandwidth',
    hubSlot: { label: 'BW math', x: 68, y: 40 },
  },
  {
    id: 'bifurcation',
    title: 'Bifurcation',
    tagline: 'Carve an \u00d716 root into contiguous device blocks.',
    concept: 'Root-port bifurcation',
    tip: 'Place each device on free contiguous lanes \u2014 sum stays \u2264 \u00d716.',
    seconds: 14,
    chapter: 'topology',
    hubSlot: { label: '\u00d716 root', x: 38, y: 82 },
  },
  {
    id: 'tradeoff-boss',
    title: 'Tradeoff Boss',
    tagline: 'Assemble Gen + width under locks \u2014 leanest that clears the meter.',
    concept: 'Gen vs lane-count tradeoffs',
    tip: 'Meter is \u2248 payload GB/s; Gen picks are link rate (GT/s). Leanest valid wins.',
    seconds: 16,
    chapter: 'tradeoffs',
    hubSlot: { label: 'SA desk', x: 82, y: 30 },
  },
  {
    id: 'root-vs-switch',
    title: 'Root or Switch?',
    tagline: 'Tap Root Port, Switch DS, or Endpoint on the fabric diagram.',
    concept: 'Root Complex vs switch vs endpoint',
    tip: 'Root Complex owns root ports; a switch fans out more links; endpoints are leaves.',
    seconds: 12,
    chapter: 'fabric',
    hubSlot: { label: 'Fabric', x: 14, y: 48 },
  },
  {
    id: 'dma-path',
    title: 'DMA Path',
    tagline: 'Wire Endpoint \u2192 Root \u2192 Memory for a device DMA write.',
    concept: 'Device DMA vs CPU copy',
    tip: 'Device DMA masters TLPs toward host memory via the root complex \u2014 not a CPU memcpy loop.',
    seconds: 12,
    chapter: 'fabric',
    hubSlot: { label: 'DMA', x: 58, y: 78 },
  },
  {
    id: 'p2p-route',
    title: 'P2P or Bounce?',
    tagline: 'Direct via switch, or bounce through host memory.',
    concept: 'Peer-to-peer vs host bounce',
    tip: 'Same-switch P2P can go direct; separate root ports without a P2P path bounce via host memory.',
    seconds: 12,
    chapter: 'fabric',
    hubSlot: { label: 'P2P', x: 86, y: 62 },
  },
];

/** Full campaign order: Fundamentals \u2192 Bandwidth \u2192 Topology \u2192 Tradeoffs \u2192 Fabric */
export const CAMPAIGN_ORDER: MicrogameId[] = [
  'link-training',
  'packet-sort',
  'bar-claim',
  'lane-widths',
  'generations',
  'throughput-calc',
  'bifurcation',
  'tradeoff-boss',
  'root-vs-switch',
  'dma-path',
  'p2p-route',
];

export function getMeta(id: MicrogameId): MicrogameMeta {
  return MICROGAMES.find((m) => m.id === id)!;
}

export function gamesInChapter(chapter: ChapterId): MicrogameMeta[] {
  return MICROGAMES.filter((m) => m.chapter === chapter);
}

export function getChapter(id: ChapterId): ChapterMeta {
  return CHAPTERS.find((c) => c.id === id)!;
}
