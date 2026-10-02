import { getMeta } from '../data/microgames';
import type { RoundResult } from '../types';
import { formatTime } from '../types';

interface ResultScreenProps {
  results: RoundResult[];
  sessionTime: number;
  campaignTotal: number | null;
  bestTime: number | null;
  onHub: () => void;
  onReplay: () => void;
}

export function ResultScreen({
  results,
  sessionTime,
  campaignTotal,
  bestTime,
  onHub,
  onReplay,
}: ResultScreenProps) {
  const clears = results.filter((r) => r.won).length;
  return (
    <div className="result-screen">
      <p className="eyebrow">
        {results.length > 1 ? 'Campaign complete' : 'Drill complete'}
      </p>
      <h1>
        {clears}/{results.length} clear
      </h1>
      <p className="lede">
        {campaignTotal != null ? (
          <>
            Campaign time: <strong>{formatTime(campaignTotal)}</strong>
            <span className="muted-sep"> · </span>
          </>
        ) : null}
        Session time: <strong>{formatTime(sessionTime)}</strong>
        {bestTime != null ? (
          <>
            <span className="muted-sep"> · </span>
            Best time: <strong>{formatTime(bestTime)}</strong>
          </>
        ) : null}
      </p>
      <p className="lede subtle">Lower time is better. Mistakes add +1.5s.</p>
      <ul className="result-list">
        {results.map((r) => (
          <li key={r.id} className={r.won ? 'win' : 'lose'}>
            <strong>{getMeta(r.id).title}</strong>
            <span>
              {r.won
                ? `CLEAR · ${formatTime(r.timeSeconds)}`
                : r.failReason ?? 'FAIL'}
            </span>
          </li>
        ))}
      </ul>
      <div className="hub-actions">
        <button type="button" className="primary-btn" onClick={onReplay}>
          ▶ Run campaign again
        </button>
        <button type="button" className="ghost-btn" onClick={onHub}>
          Back to motherboard
        </button>
      </div>
    </div>
  );
}
