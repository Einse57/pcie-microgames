import type { ChapterId, MicrogameId } from '../types';
import { CHAPTERS, gamesInChapter, getMeta } from './microgames';

const CLEARED_KEY = 'pcie-microgames-cleared';

export function loadCleared(): Set<MicrogameId> {
  try {
    const raw = localStorage.getItem(CLEARED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(arr as MicrogameId[]);
  } catch {
    return new Set();
  }
}

export function markCleared(id: MicrogameId): Set<MicrogameId> {
  const next = loadCleared();
  next.add(id);
  localStorage.setItem(CLEARED_KEY, JSON.stringify([...next]));
  return next;
}

export function chapterUnlocked(chapter: ChapterId, cleared: Set<MicrogameId>): boolean {
  const meta = CHAPTERS.find((c) => c.id === chapter)!;
  if (meta.order === 0) return true;
  const prev = CHAPTERS.find((c) => c.order === meta.order - 1)!;
  return gamesInChapter(prev.id).every((g) => cleared.has(g.id));
}

export function gameUnlocked(id: MicrogameId, cleared: Set<MicrogameId>): boolean {
  return chapterUnlocked(getMeta(id).chapter, cleared);
}
