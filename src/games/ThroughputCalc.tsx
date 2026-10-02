import { useMemo, useState } from 'react';
import { GameShell } from '../components/GameShell';
import { randomFail } from '../data/failStrings';
import {
  aggregateGBps,
  formatGBps,
  GEN_LABEL,
  REFERENCE_CARD_LINES,
} from '../data/pcieBandwidth';

interface Problem {
  gen: number;
  lanes: number;
  answer: number;
  choices: number[];
}

function uniqueChoices(correct: number, pool: number[]): number[] {
  const set = new Set<number>([correct]);
  for (const p of pool.sort(() => Math.random() - 0.5)) {
    if (set.size >= 4) break;
    if (Math.abs(p - correct) > 0.01) set.add(p);
  }
  while (set.size < 4) {
    set.add(correct * (set.size % 2 === 0 ? 2 : 0.5));
  }
  return [...set].sort((a, b) => a - b);
}

function buildProblems(n: number): Problem[] {
  const combos: { gen: number; lanes: number }[] = [
    { gen: 3, lanes: 4 },
    { gen: 3, lanes: 8 },
    { gen: 3, lanes: 16 },
    { gen: 4, lanes: 4 },
    { gen: 4, lanes: 8 },
    { gen: 4, lanes: 16 },
    { gen: 5, lanes: 4 },
    { gen: 5, lanes: 8 },
    { gen: 5, lanes: 16 },
    { gen: 2, lanes: 8 },
  ];
  const picked = [...combos].sort(() => Math.random() - 0.5).slice(0, n);
  const allAnswers = combos.map((c) => aggregateGBps(c.gen, c.lanes));

  return picked.map((c) => {
    const answer = aggregateGBps(c.gen, c.lanes);
    return {
      ...c,
      answer,
      choices: uniqueChoices(answer, allAnswers),
    };
  });
}

interface Props {
  sessionTime: number;
  onComplete: (won: boolean, timeSeconds: number, failReason?: string) => void;
  onAbort: () => void;
}

export function ThroughputCalc({ sessionTime, onComplete, onAbort }: Props) {
  const problems = useMemo(() => buildProblems(4), []);
  const [index, setIndex] = useState(0);
  const [peek, setPeek] = useState(false);
  const current = problems[index];

  return (
    <GameShell
      id="throughput-calc"
      sessionTime={sessionTime}
      onComplete={onComplete}
      onAbort={onAbort}
    >
      {({ win, mistake, locked }) => (
        <div className="mg throughput-calc">
          <p className="prompt">
            Approximate unidirectional aggregate BW. ({index + 1}/{problems.length})
          </p>
          <div className="scenario-card">
            <span className="packet-chip">GEN × LANES</span>
            <h2>
              {GEN_LABEL[current.gen]} ×{current.lanes}
            </h2>
            <p className="scenario-detail">Select the closest taught approximate aggregate.</p>
          </div>

          <div className="ref-peek">
            <button
              type="button"
              className="ghost-btn peek-btn"
              disabled={locked}
              onClick={() => setPeek((p) => !p)}
            >
              {peek ? 'Hide reference card' : 'Peek reference card'}
            </button>
            {peek && (
              <aside className="ref-card" aria-label="Bandwidth reference">
                {REFERENCE_CARD_LINES.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </aside>
            )}
          </div>

          <div className="choice-grid">
            {current.choices.map((c) => (
              <button
                key={c}
                type="button"
                className="width-btn"
                disabled={locked}
                onClick={() => {
                  if (locked) return;
                  const ok = Math.abs(c - current.answer) < 0.01;
                  if (!ok) {
                    mistake(randomFail('throughput-calc'));
                    return;
                  }
                  if (index + 1 >= problems.length) win();
                  else setIndex((i) => i + 1);
                }}
              >
                <strong>{formatGBps(c)}</strong>
                <small>aggregate</small>
              </button>
            ))}
          </div>
        </div>
      )}
    </GameShell>
  );
}
