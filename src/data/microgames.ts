import type { MicrogameId, MicrogameMeta } from '../types';

export const MICROGAMES: MicrogameMeta[] = [
  {
    id: 'link-training',
    title: 'Link Training',
    tagline: 'Negotiate Gen speed before LTSSM freaks out!',
    concept: 'Link training / Gen negotiation',
    seconds: 5,
    hubSlot: { label: 'CPU ↔ Chipset', x: 18, y: 28 },
  },
  {
    id: 'packet-sort',
    title: 'Packet Sort',
    tagline: 'TLP? DLLP? Ordered Set? SORT IT!',
    concept: 'TLP vs DLLP vs Ordered Set',
    seconds: 5,
    hubSlot: { label: 'Root Port', x: 52, y: 22 },
  },
  {
    id: 'bar-claim',
    title: 'BAR Claim',
    tagline: 'Park your MMIO window — no overlaps!',
    concept: 'Base Address Registers',
    seconds: 5,
    hubSlot: { label: 'Endpoint', x: 72, y: 58 },
  },
];

export const CAMPAIGN_ORDER: MicrogameId[] = [
  'link-training',
  'packet-sort',
  'bar-claim',
];

export function getMeta(id: MicrogameId): MicrogameMeta {
  return MICROGAMES.find((m) => m.id === id)!;
}
