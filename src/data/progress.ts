import type { MicrogameId } from '../types';

const KEY = 'pcie-microgames-cleared';

export function loadCleared(): Set<MicrogameId> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as MicrogameId[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

export function markCleared(id: MicrogameId): Set<MicrogameId> {
  const next = loadCleared();
  next.add(id);
  localStorage.setItem(KEY, JSON.stringify([...next]));
  return next;
}
