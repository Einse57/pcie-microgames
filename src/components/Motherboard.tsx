import type { ChapterId, MicrogameId } from '../types';
import { CHAPTERS, gamesInChapter } from '../data/microgames';
import { chapterUnlocked } from '../data/progress';

export interface ChapterAnchor {
  chapter: ChapterId;
  label: string;
  x: number;
  y: number;
  hint: string;
}

export const CHAPTER_ANCHORS: ChapterAnchor[] = [
  { chapter: 'fundamentals', label: 'Fundamentals', x: 22, y: 28, hint: 'CPU link' },
  { chapter: 'bandwidth', label: 'Bandwidth', x: 42, y: 82, hint: '\u00d716 slot' },
  { chapter: 'topology', label: 'Topology', x: 58, y: 52, hint: 'bifur lanes' },
  { chapter: 'tradeoffs', label: 'Tradeoffs', x: 86, y: 24, hint: 'SA desk' },
  { chapter: 'fabric', label: 'Fabric', x: 18, y: 58, hint: 'switch' },
  { chapter: 'drivers', label: 'Drivers', x: 78, y: 42, hint: 'IRQ / AER' },
  { chapter: 'attach', label: 'Attach', x: 48, y: 18, hint: 'CXL / DMI / NVMe' },
];

interface MotherboardProps {
  cleared: Set<MicrogameId>;
  onPlay: (id: MicrogameId) => void;
  onFocusChapter?: (chapter: ChapterId) => void;
}

function firstPlayable(chapter: ChapterId, cleared: Set<MicrogameId>): MicrogameId | null {
  const games = gamesInChapter(chapter);
  const next = games.find((g) => !cleared.has(g.id));
  return (next ?? games[0])?.id ?? null;
}

export function Motherboard({ cleared, onPlay, onFocusChapter }: MotherboardProps) {
  return (
    <section className="motherboard" aria-label="Motherboard diagram">
      <div className="mb-pcb">
        <div className="mb-svg-fallback" style={{ padding: '1.5rem', color: 'var(--muted)' }}>
          <p style={{ margin: '0 0 0.75rem', letterSpacing: '0.12em', fontSize: '0.75rem' }}>PLATFORM MAP</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
            {CHAPTER_ANCHORS.map((a) => {
              const unlocked = chapterUnlocked(a.chapter, cleared);
              const games = gamesInChapter(a.chapter);
              const done = games.every((g) => cleared.has(g.id));
              const ch = CHAPTERS.find((c) => c.id === a.chapter)!;
              const playId = firstPlayable(a.chapter, cleared);
              return (
                <button
                  key={a.chapter}
                  type="button"
                  className={`mb-anchor${unlocked ? '' : ' locked'}${done ? ' cleared' : ''}`}
                  style={{ position: 'relative', transform: 'none', left: 'auto', top: 'auto' }}
                  disabled={!unlocked || !playId}
                  title={unlocked ? `${ch.title} \u2014 ${a.hint}` : 'Clear the previous chapter first'}
                  onClick={() => {
                    if (!unlocked || !playId) return;
                    onFocusChapter?.(a.chapter);
                    onPlay(playId);
                  }}
                >
                  <span className="mb-anchor-dot" />
                  <span className="mb-anchor-label">
                    <strong>{a.label}</strong>
                    <small>{unlocked ? (done ? 'Complete' : a.hint) : 'Locked'}</small>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <p className="mb-caption">Platform map \u2014 chapter markers jump to the first open drill. Use the cards above to browse every game.</p>
    </section>
  );
}
