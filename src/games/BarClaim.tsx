import { useMemo, useState } from 'react';
import { GameShell } from '../components/GameShell';
import { randomFail } from '../data/failStrings';

/** Address map in "units" 0–15 for simple grid placement */
interface Region {
  start: number;
  size: number;
  label: string;
  owned?: boolean;
}

function overlaps(a: Region, b: Region): boolean {
  return a.start < b.start + b.size && b.start < a.start + a.size;
}

interface Props {
  score: number;
  onComplete: (won: boolean, failReason?: string) => void;
  onAbort: () => void;
}

export function BarClaim({ score, onComplete, onAbort }: Props) {
  const occupied = useMemo<Region[]>(
    () => [
      { start: 0, size: 2, label: 'VGA' },
      { start: 5, size: 3, label: 'NIC BAR0' },
      { start: 11, size: 2, label: 'NVMe' },
    ],
    [],
  );
  const windowSize = 3;
  const [start, setStart] = useState(3);

  const candidate: Region = { start, size: windowSize, label: 'YOU', owned: true };
  const clash = occupied.some((r) => overlaps(candidate, r));
  const inBounds = start + windowSize <= 16;

  return (
    <GameShell id="bar-claim" score={score} onComplete={onComplete} onAbort={onAbort}>
      {({ win, lose, locked }) => (
        <div className="mg bar-claim">
          <p className="prompt">
            Place your <strong>{windowSize}-unit</strong> MMIO BAR without overlapping existing windows.
          </p>

          <div className="addr-map" role="img" aria-label="Address map">
            {Array.from({ length: 16 }, (_, i) => {
              const occ = occupied.find((r) => i >= r.start && i < r.start + r.size);
              const mine = i >= start && i < start + windowSize;
              let cls = 'cell';
              if (occ) cls += ' occupied';
              if (mine) cls += clash || !inBounds ? ' conflict' : ' mine';
              return (
                <button
                  key={i}
                  type="button"
                  className={cls}
                  disabled={locked}
                  onClick={() => setStart(i)}
                  title={`0x${(i * 0x1000).toString(16)}`}
                >
                  {occ?.label && i === occ.start ? occ.label : mine && i === start ? 'YOU' : ''}
                </button>
              );
            })}
          </div>

          <div className="bar-controls">
            <button
              type="button"
              className="ghost-btn"
              disabled={locked || start <= 0}
              onClick={() => setStart((s) => Math.max(0, s - 1))}
            >
              ◀ Shift
            </button>
            <button
              type="button"
              className="ghost-btn"
              disabled={locked || start >= 16 - windowSize}
              onClick={() => setStart((s) => Math.min(16 - windowSize, s + 1))}
            >
              Shift ▶
            </button>
            <button
              type="button"
              className="primary-btn"
              disabled={locked}
              onClick={() => {
                if (!clash && inBounds) win();
                else lose(randomFail('bar-claim'));
              }}
            >
              Claim BAR
            </button>
          </div>
          <p className={`bar-status${clash || !inBounds ? ' bad' : ' good'}`}>
            {clash || !inBounds ? 'Overlap / OOB — enumeration will cry' : 'Clean window — claim it!'}
          </p>
        </div>
      )}
    </GameShell>
  );
}
