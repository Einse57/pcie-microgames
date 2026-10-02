import { CHAPTERS, gamesInChapter, MICROGAMES } from '../data/microgames';
import { chapterUnlocked, gameUnlocked } from '../data/progress';
import type { ChapterId, MicrogameId } from '../types';
import { formatTime } from '../types';
import { Motherboard } from './Motherboard';

interface HubProps {
  sessionTime: number;
  bestTime: number | null;
  cleared: Set<MicrogameId>;
  onPlay: (id: MicrogameId) => void;
  onCampaign: () => void;
}

export function Hub({ sessionTime, bestTime, cleared, onPlay, onCampaign }: HubProps) {
  const clearedCount = MICROGAMES.filter((g) => cleared.has(g.id)).length;

  const focusChapter = (chapter: ChapterId) => {
    const el = document.getElementById(`chapter-${chapter}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    el?.classList.add('chapter-flash');
    window.setTimeout(() => el?.classList.remove('chapter-flash'), 900);
  };

  return (
    <div className="hub">
      <header className="hub-hero">
        <h1>PCIe Microgames</h1>
        <div className="hub-actions">
          <button type="button" className="primary-btn" onClick={onCampaign}>
            ▶ Play full campaign ({MICROGAMES.length} games)
          </button>
          <div className="score-row">
            <span>Session time {formatTime(sessionTime)}</span>
            <span>Best campaign {bestTime == null ? '—' : formatTime(bestTime)}</span>
            <span>
              Cleared {clearedCount}/{MICROGAMES.length}
            </span>
          </div>
        </div>
      </header>

      <section className="curriculum" aria-label="Learning path">
        {CHAPTERS.map((ch) => {
          const unlocked = chapterUnlocked(ch.id, cleared);
          const games = gamesInChapter(ch.id);
          const done = games.every((g) => cleared.has(g.id));
          return (
            <div
              key={ch.id}
              id={`chapter-${ch.id}`}
              className={`chapter-card${unlocked ? '' : ' locked'}${done ? ' complete' : ''}`}
            >
              <header className="chapter-head">
                <h2>{ch.title}</h2>
                <span className="chapter-state">
                  {!unlocked ? 'Locked' : done ? 'Complete' : 'Open'}
                </span>
              </header>
              <p className="chapter-blurb">
                {unlocked
                  ? ch.blurb
                  : 'Clear every drill in the previous chapter to unlock.'}
              </p>
              <div className="chapter-games">
                {games.map((g) => {
                  const open = gameUnlocked(g.id, cleared);
                  const clearedGame = cleared.has(g.id);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      className={`chapter-game${clearedGame ? ' cleared' : ''}`}
                      disabled={!open}
                      onClick={() => onPlay(g.id)}
                      title={open ? g.tagline : 'Complete the previous chapter first'}
                    >
                      <strong>{g.title}</strong>
                      <small>{g.concept}</small>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      <Motherboard cleared={cleared} onPlay={onPlay} onFocusChapter={focusChapter} />

      <footer className="hub-foot">
        <span>Vite + React + TS · time-based scoring · Vercel</span>
        <span>Fundamentals → Bandwidth → Bifurcation → Tradeoffs → Fabric → Drivers</span>
      </footer>
    </div>
  );
}
