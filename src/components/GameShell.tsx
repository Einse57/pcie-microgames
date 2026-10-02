import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { MicrogameId } from '../types';
import { getMeta } from '../data/microgames';
import { randomFail, randomWin } from '../data/failStrings';
import { TimerBar } from './TimerBar';

interface GameShellProps {
  id: MicrogameId;
  score: number;
  onComplete: (won: boolean, failReason?: string) => void;
  onAbort: () => void;
  children: (api: {
    win: () => void;
    lose: (reason?: string) => void;
    locked: boolean;
  }) => ReactNode;
}

export function GameShell({ id, score, onComplete, onAbort, children }: GameShellProps) {
  const meta = getMeta(id);
  const [remaining, setRemaining] = useState(meta.seconds);
  const [locked, setLocked] = useState(false);
  const [banner, setBanner] = useState<{ kind: 'win' | 'lose'; text: string } | null>(null);
  const done = useRef(false);

  const finish = (won: boolean, reason?: string) => {
    if (done.current) return;
    done.current = true;
    setLocked(true);
    const text = won ? randomWin(id) : reason ?? randomFail(id);
    setBanner({ kind: won ? 'win' : 'lose', text });
    window.setTimeout(() => onComplete(won, won ? undefined : text), 1100);
  };

  useEffect(() => {
    const start = performance.now();
    const total = meta.seconds * 1000;
    let raf = 0;
    const tick = (now: number) => {
      if (done.current) return;
      const left = Math.max(0, total - (now - start));
      setRemaining(left / 1000);
      if (left <= 0) {
        finish(false, randomFail(id));
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [id]);

  return (
    <div className="game-shell">
      <header className="game-header">
        <button type="button" className="ghost-btn" onClick={onAbort}>
          ← Hub
        </button>
        <div className="game-titles">
          <h1>{meta.title}</h1>
          <p>{meta.tagline}</p>
        </div>
        <div className="score-chip">SCORE {score}</div>
      </header>
      <TimerBar seconds={meta.seconds} remaining={remaining} />
      <div className="game-stage">
        {children({
          win: () => finish(true),
          lose: (reason) => finish(false, reason),
          locked,
        })}
      </div>
      {banner && (
        <div className={`result-banner ${banner.kind}`} role="status">
          <strong>{banner.kind === 'win' ? 'CLEAR!' : 'FAIL!'}</strong>
          <span>{banner.text}</span>
        </div>
      )}
    </div>
  );
}
