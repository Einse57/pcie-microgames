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
    hubSlot: { label: 'CPU ↔ Chipset', x: 18, y: 28 },
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
    tip: 'Form-factor cues: M.2 NVMe ≈ ×4, PEG GPU ≈ ×16, simple NIC ≈ ×1.',
    seconds: 12,
    chapter: 'bandwidth',
    hubSlot: { label: 'Slot silk', x: 28, y: 72 },
  },
  {
    id: 'generations',
    title: 'Generations',
    tagline: 'Climb the speed ladder — tap the Gen that hits the target.',
    concept: 'PCIe generation vs GT/s',
    tip: 'Bar heights: Gen3 ≈ 1, Gen4 ≈ 2, Gen5 ≈ 4 GB/s per lane.',
    seconds: 12,
    chapter: 'bandwidth',
    hubSlot: { label: 'PHY speed', x: 48, y: 68 },
  },
  {
    id: 'throughput-calc',
    title: 'Throughput Calc',
    tagline: 'Fill the capacity meter with Gen × width.',
    concept: 'Aggregate link bandwidth',
    tip: 'Watch the pipe fill: aggregate ≈ per-lane × lanes.',
    seconds: 14,
    chapter: 'bandwidth',
    hubSlot: { label: 'BW math', x: 68, y: 40 },
  },
  {
    id: 'bifurcation',
    title: 'Bifurcation',
    tagline: 'Carve an ×16 root into contiguous device blocks.',
    concept: 'Root-port bifurcation',
    tip: 'Place each device on free contiguous lanes — sum stays ≤ ×16.',
    seconds: 14,
    chapter: 'topology',
    hubSlot: { label: '×16 root', x: 38, y: 82 },
  },
  {
    id: 'tradeoff-boss',
    title: 'Tradeoff Boss',
    tagline: 'Assemble Gen + width under locks — leanest that clears the meter.',
    concept: 'Gen vs lane-count tradeoffs',
    tip: 'Respect lock chips; meet the meter with the least overkill.',
    seconds: 16,
    chapter: 'tradeoffs',
    hubSlot: { label: 'SA desk', x: 82, y: 30 },
  },
];

/** Full campaign order: Fundamentals → Bandwidth → Topology → Tradeoffs */
export const CAMPAIGN_ORDER: MicrogameId[] = [
  'link-training',
  'packet-sort',
  'bar-claim',
  'lane-widths',
  'generations',
  'throughput-calc',
  'bifurcation',
  'tradeoff-boss',
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
