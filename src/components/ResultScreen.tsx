import { getMeta } from '../data/microgames';
import type { RoundResult } from '../types';

interface ResultScreenProps {
  results: RoundResult[];
  score: number;
  onHub: () => void;
  onReplay: () => void;
}

export function ResultScreen({ results, score, onHub, onReplay }: ResultScreenProps) {
  const wins = results.filter((r) => r.won).length;
  return (
    <div className="result-screen">
      <p className="eyebrow">Campaign complete</p>
      <h1>
        {wins}/{results.length} clear
      </h1>
      <p className="lede">Session score: <strong>{score}</strong></p>
      <ul className="result-list">
        {results.map((r) => (
          <li key={r.id} className={r.won ? 'win' : 'lose'}>
            <strong>{getMeta(r.id).title}</strong>
            <span>{r.won ? 'CLEAR' : r.failReason ?? 'FAIL'}</span>
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
