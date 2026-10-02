import { useMemo, useState } from 'react';
import { GameShell } from '../components/GameShell';
import { randomFail } from '../data/failStrings';
import {
  formatGBps,
  formatGBpsShort,
  GEN_GTPS,
  GEN_LABEL,
  PER_LANE_GBPS,
  UNIT_KEY,
} from '../data/pcieBandwidth';

type RoundKind = 'bw' | 'gtps';

interface Round {
  kind: RoundKind;
  answer: number;
  targetLabel: string;
}

function buildRounds(): Round[] {
  const focus = [3, 4, 5];
  const all = [1, 2, 3, 4, 5];
  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

  const g1 = pick(focus);
  const g2 = pick(all);
  const g3 = pick(focus);
  return shuffle([
    { kind: 'bw', answer: g1, targetLabel: formatGBps(PER_LANE_GBPS[g1]) },
    { kind: 'gtps', answer: g2, targetLabel: GEN_GTPS[g2] },
    { kind: 'bw', answer: g3, targetLabel: formatGBps(PER_LANE_GBPS[g3]) },
    { kind: 'bw', answer: 3, targetLabel: formatGBps(1) },
  ]);
}

interface Props {
  sessionTime: number;
  onComplete: (won: boolean, timeSeconds: number, failReason?: string) => void;
  onAbort: () => void;
}

export function Generations({ sessionTime, onComplete, onAbort }: Props) {
  const rounds = useMemo(() => buildRounds(), []);
  const [index, setIndex] = useState(0);
  const current = rounds[index];
  const gens = [1, 2, 3, 4, 5];

  return (
    <GameShell id="generations" sessionTime={sessionTime} onComplete={onComplete} onAbort={onAbort}>
      {({ win, mistake, locked }) => (
        <div className="mg generations">
          <p className="unit-key" title="Units">
            {UNIT_KEY}
          </p>
          <p className="prompt">
            Tap the Gen rung for{' '}
            <strong>
              {current.kind === 'bw'
                ? `${current.targetLabel} / lane (payload)`
                : current.targetLabel}
            </strong>
            . ({index + 1}/{rounds.length})
          </p>

          <div className="bw-target-meter" aria-live="polite">
            <span className="meter-chip">TARGET</span>
            <div className="meter-glow">
              <strong>{current.targetLabel}</strong>
              <small>
                {current.kind === 'bw' ? '≈ payload / lane' : 'link rate (GT/s)'}
              </small>
            </div>
          </div>

          <div className="speed-ladder" role="group" aria-label="Generation ladder">
            {gens.map((g) => {
              const h = PER_LANE_GBPS[g];
              const barPct = Math.min(100, (h / 4) * 100);
              return (
                <button
                  key={g}
                  type="button"
                  className="ladder-rung"
                  disabled={locked}
                  onClick={() => {
                    if (locked) return;
                    if (g !== current.answer) {
                      mistake(randomFail('generations'));
                      return;
                    }
                    if (index + 1 >= rounds.length) win();
                    else setIndex((i) => i + 1);
                  }}
                >
                  <span className="rung-bar-wrap" aria-hidden>
                    <span className="rung-bar" style={{ height: `${Math.max(12, barPct)}%` }} />
                  </span>
                  <strong>{GEN_LABEL[g]}</strong>
                  <small>{GEN_GTPS[g]}</small>
                  <span className="rung-bw">≈ {formatGBpsShort(h)}/L</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </GameShell>
  );
}
