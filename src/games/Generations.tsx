import { useMemo, useState } from 'react';
import { GameShell } from '../components/GameShell';
import { randomFail } from '../data/failStrings';
import { formatGBps, GEN_GTPS, GEN_LABEL, PER_LANE_GBPS } from '../data/pcieBandwidth';

type QKind = 'bw-to-gen' | 'gen-to-bw' | 'gtps';

interface Question {
  kind: QKind;
  prompt: string;
  /** Correct generation id */
  answer: number;
  /** Choice values are always generation ids; labels depend on kind */
  choices: number[];
}

function buildQuestions(): Question[] {
  const gens = [1, 2, 3, 4, 5];
  const focus = [3, 4, 5];
  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

  const q1Gen = pick(focus);
  const q1: Question = {
    kind: 'bw-to-gen',
    prompt: `Which generation delivers about ${formatGBps(PER_LANE_GBPS[q1Gen])} per lane (one direction)?`,
    answer: q1Gen,
    choices: [...focus].sort(() => Math.random() - 0.5),
  };

  const q2Gen = pick(gens);
  const distractors = gens
    .filter((g) => g !== q2Gen)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const q2: Question = {
    kind: 'gen-to-bw',
    prompt: `Approximate per-lane payload bandwidth for ${GEN_LABEL[q2Gen]}?`,
    answer: q2Gen,
    choices: [q2Gen, ...distractors].sort(() => Math.random() - 0.5),
  };

  const q3Gen = pick(focus);
  const q3: Question = {
    kind: 'gtps',
    prompt: `Which generation runs at ${GEN_GTPS[q3Gen]}?`,
    answer: q3Gen,
    choices: [...focus].sort(() => Math.random() - 0.5),
  };

  const q4: Question = {
    kind: 'bw-to-gen',
    prompt: 'Which Gen is the usual “≈ 1 GB/s per lane” teaching baseline?',
    answer: 3,
    choices: [3, 4, 5].sort(() => Math.random() - 0.5),
  };

  return [q1, q2, q3, q4];
}

function choiceLabel(q: Question, gen: number): { strong: string; small: string } {
  if (q.kind === 'gen-to-bw') {
    return { strong: formatGBps(PER_LANE_GBPS[gen]), small: 'per lane' };
  }
  if (q.kind === 'gtps') {
    return { strong: GEN_LABEL[gen], small: 'select Gen' };
  }
  return { strong: GEN_LABEL[gen], small: GEN_GTPS[gen] };
}

interface Props {
  sessionTime: number;
  onComplete: (won: boolean, timeSeconds: number, failReason?: string) => void;
  onAbort: () => void;
}

export function Generations({ sessionTime, onComplete, onAbort }: Props) {
  const questions = useMemo(() => buildQuestions(), []);
  const [index, setIndex] = useState(0);
  const current = questions[index];

  return (
    <GameShell id="generations" sessionTime={sessionTime} onComplete={onComplete} onAbort={onAbort}>
      {({ win, mistake, locked }) => (
        <div className="mg generations">
          <p className="prompt">
            Generations vs per-lane bandwidth. ({index + 1}/{questions.length})
          </p>
          <div className="scenario-card">
            <span className="packet-chip">GEN DRILL</span>
            <h2>{current.prompt}</h2>
          </div>
          <div className="gen-answer-grid">
            {current.choices.map((g) => {
              const label = choiceLabel(current, g);
              return (
                <button
                  key={`${current.kind}-${index}-${g}`}
                  type="button"
                  className="gen-btn"
                  disabled={locked}
                  onClick={() => {
                    if (locked) return;
                    if (g !== current.answer) {
                      mistake(randomFail('generations'));
                      return;
                    }
                    if (index + 1 >= questions.length) win();
                    else setIndex((i) => i + 1);
                  }}
                >
                  <strong>{label.strong}</strong>
                  <small>{label.small}</small>
                </button>
              );
            })}
          </div>
          <p className="ref-footnote">
            Context: Gen1 ≈ 0.25 · Gen2 ≈ 0.5 · Gen3 ≈ 1 · Gen4 ≈ 2 · Gen5 ≈ 4 GB/s per lane.
          </p>
        </div>
      )}
    </GameShell>
  );
}
