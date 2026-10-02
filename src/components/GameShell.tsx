import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { MicrogameId } from '../types';
import { formatTime } from '../types';
import { getMeta } from '../data/microgames';
import { randomFail, randomWin } from '../data/failStrings';
import { TimerBar } from './TimerBar';

/** Seconds added to elapsed on each mistake */
export const MISTAKE_PENALTY = 1.5;

interface GameShellProps {
  id: MicrogameId;
  /** Session total time so far (seconds) */
  sessionTime: number;
  onComplete: (won: boolean, timeSeconds: number, failReason?: string) => void;
  onAbort: () => void;
  children: (api: {
    win: () => void;
    /** Wrong answer: +penalty, keep playing — does not end the round */
    mistake: (reason?: string) => void;
    locked: boolean;
  }) => ReactNode;
}

export function GameShell({ id, sessionTime, onComplete, onAbort, children }: GameShellProps) {
  const meta = getMeta(id);
  const [elapsed, setElapsed] = useState(0);
  const [locked, setLocked] = useState(false);
  const [banner, setBanner] = useState<{ kind: 'win' | 'mistake'; text: string } | null>(null);
  const [showTip, setShowTip] = useState(true);
  const done = useRef(false);
  const penaltyRef = useRef(0);
  const startRef = useRef(performance.now());
  const bannerClearRef = useRef<number | null>(null);

  const readElapsed = () =>
    (performance.now() - startRef.current) / 1000 + penaltyRef.current;

  const finish = (won: boolean, reason?: string) => {
    if (done.current) return;
    done.current = true;
    setLocked(true);
    const t = readElapsed();
    setElapsed(t);
    const text = won ? randomWin(id) : reason ?? randomFail(id);
    setBanner({ kind: won ? 'win' : 'mistake', text });
    window.setTimeout(() => onComplete(won, t, won ? undefined : text), 1100);
  };

  useEffect(() => {
    done.current = false;
    penaltyRef.current = 0;
    startRef.current = performance.now();
    setElapsed(0);
    setLocked(false);
    setBanner(null);
    setShowTip(true);

    let raf = 0;
    const tick = () => {
      if (done.current) return;
      setElapsed(readElapsed());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (bannerClearRef.current != null) window.clearTimeout(bannerClearRef.current);
    };
  }, [id]);

  const mistake = (reason?: string) => {
    if (done.current || locked) return;
    penaltyRef.current += MISTAKE_PENALTY;
    setElapsed(readElapsed());
    const text = reason ?? randomFail(id);
    setBanner({ kind: 'mistake', text });
    if (bannerClearRef.current != null) window.clearTimeout(bannerClearRef.current);
    bannerClearRef.current = window.setTimeout(() => {
      if (!done.current) setBanner(null);
    }, 900);
  };

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
        <div className="score-chip" title="Session time (lower is better)">
          TIME {formatTime(sessionTime)}
        </div>
      </header>
      {showTip && (
        <div className="teach-tip" role="note">
          <span className="teach-tip-label">Tip</span>
          <span>{meta.tip}</span>
          <button type="button" className="tip-dismiss" onClick={() => setShowTip(false)} aria-label="Dismiss tip">
            ✕
          </button>
        </div>
      )}
      <TimerBar elapsed={elapsed} par={meta.seconds} />
      <div className="game-stage">
        {children({
          win: () => finish(true),
          mistake,
          locked,
        })}
      </div>
      {banner && (
        <div
          className={`result-banner ${banner.kind === 'win' ? 'win' : 'lose'}`}
          role="status"
        >
          <strong>
            {banner.kind === 'win'
              ? `CLEAR · ${formatTime(elapsed)}`
              : `+${MISTAKE_PENALTY.toFixed(1)}s`}
          </strong>
          <span>{banner.text}</span>
        </div>
      )}
    </div>
  );
}
