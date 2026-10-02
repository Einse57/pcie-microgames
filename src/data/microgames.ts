import type { MicrogameId, MicrogameMeta } from '../types';

export const MICROGAMES: MicrogameMeta[] = [
  {
    id: 'link-training',
    title: 'Link Training',
    tagline: 'Negotiate Gen speed and align lanes before LTSSM stalls.',
    concept: 'Link training / Gen negotiation',
    seconds: 8,
    hubSlot: { label: 'CPU ↔ Chipset', x: 18, y: 28 },
  },
  {
    id: 'packet-sort',
    title: 'Packet Sort',
    tagline: 'Classify TLP, DLLP, and Ordered Set traffic by layer.',
    concept: 'TLP vs DLLP vs Ordered Set',
    seconds: 10,
    hubSlot: { label: 'Root Port', x: 52, y: 22 },
  },
  {
    id: 'bar-claim',
    title: 'BAR Claim',
    tagline: 'Place an MMIO window with no address overlaps.',
    concept: 'Base Address Registers',
    seconds: 8,
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
