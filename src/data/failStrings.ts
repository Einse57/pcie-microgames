import type { MicrogameId } from '../types';

const FAILS: Record<MicrogameId, string[]> = {
  'link-training': [
    'Your LTSSM got stuck in Recovery — again.',
    'Gen mismatch! Downstream thinks Gen1, you yelled Gen5.',
    'Lane deskew failed. Those lanes are not best friends.',
    'Training sets timed out. The link ghosted you.',
    'Equalization flopped. Your eye diagram just blinked.',
  ],
  'packet-sort': [
    'That was a DLLP, not a TLP. Data Link layer says hi.',
    'Ordered Sets live on the wire — not in Transaction layer!',
    'You filed an ACK as a Memory Write. Chaos ensues.',
    'SKP ordered set escaped into your TLP bin. Naughty.',
    'Credit update is a DLLP. Spec 0xFF is laughing at you.',
  ],
  'bar-claim': [
    'BAR overlap! Two devices, one address — MMIO war.',
    'You parked on the VGA hole. Classic rookie move.',
    'Window too wide — ate the next endpoint for lunch.',
    'Unaligned BAR. Hardware coughs politely, then dies.',
    'That region was already claimed. Enumerate harder.',
  ],
};

export function randomFail(id: MicrogameId): string {
  const list = FAILS[id];
  return list[Math.floor(Math.random() * list.length)];
}

export const WIN_STRINGS: Record<MicrogameId, string[]> = {
  'link-training': [
    'Link Up! L0 achieved. Speed demons rejoice.',
    'Gen locked. LTSSM is finally chill.',
    'Lanes aligned. Deskew angels sing.',
  ],
  'packet-sort': [
    'Layers sorted. Transaction / Data Link / Phy — clean.',
    'Packet taxonomy mastered. Spec lawyers nod.',
    'TLP/DLLP/OS triage complete. Nicely done.',
  ],
  'bar-claim': [
    'BAR claimed. MMIO window looks chef\'s-kiss.',
    'No overlaps. Enumeration gods are pleased.',
    'Address map tidy. Driver writers thank you.',
  ],
};

export function randomWin(id: MicrogameId): string {
  const list = WIN_STRINGS[id];
  return list[Math.floor(Math.random() * list.length)];
}
