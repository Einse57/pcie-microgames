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
    blurb: 'Lane widths, generations, and aggregate throughput.',
    order: 1,
  },
  {
    id: 'topology',
    title: '3 · Topology / Bifurcation',
    blurb: 'Split an ×16 root without oversubscribing lanes.',
    order: 2,
  },
  {
    id: 'tradeoffs',
    title: '4 · Tradeoffs',
    blurb: 'Meet a bandwidth target with the least overkill under constraints.',
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
    tagline: 'Match ×1 / ×4 / ×8 / ×16 to the device need or slot silk.',
    concept: 'Link width (lane count)',
    tip: 'Silk and form-factor often imply width: M.2 NVMe is typically ×4; PEG is ×16.',
    seconds: 12,
    chapter: 'bandwidth',
    hubSlot: { label: 'Slot silk', x: 28, y: 72 },
  },
  {
    id: 'generations',
    title: 'Generations',
    tagline: 'Relate Gen3/4/5 (and Gen1–2) to per-lane bandwidth.',
    concept: 'PCIe generation vs GT/s',
    tip: 'Rule of thumb: Gen3 ≈ 1, Gen4 ≈ 2, Gen5 ≈ 4 GB/s per lane (one direction).',
    seconds: 12,
    chapter: 'bandwidth',
    hubSlot: { label: 'PHY speed', x: 48, y: 68 },
  },
  {
    id: 'throughput-calc',
    title: 'Throughput Calc',
    tagline: 'Estimate aggregate BW from Gen × lane count.',
    concept: 'Aggregate link bandwidth',
    tip: 'Aggregate ≈ per-lane BW × lanes. Peek the reference card if needed.',
    seconds: 14,
    chapter: 'bandwidth',
    hubSlot: { label: 'BW math', x: 68, y: 40 },
  },
  {
    id: 'bifurcation',
    title: 'Bifurcation',
    tagline: 'Split an ×16 root into legal ×8 / ×4 layouts.',
    concept: 'Root-port bifurcation',
    tip: 'Child widths must sum to ≤ parent lanes — never oversubscribe the ×16.',
    seconds: 14,
    chapter: 'topology',
    hubSlot: { label: '×16 root', x: 38, y: 82 },
  },
  {
    id: 'tradeoff-boss',
    title: 'Tradeoff Boss',
    tagline: 'Hit a BW target under constraints with least overkill.',
    concept: 'Gen vs lane-count tradeoffs',
    tip: 'Meet the target; prefer the smallest aggregate that satisfies constraints.',
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
