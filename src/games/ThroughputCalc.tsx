import { useMemo, useState } from 'react';
import { GameShell } from '../components/GameShell';
import { randomFail } from '../data/failStrings';
import {
  aggregateGBps,
  formatGBps,
  formatGBpsShort,
  GEN_GTPS,
  GEN_LABEL,
  LANE_WIDTHS,
  PER_LANE_GBPS,
  UNIT_KEY,
} from '../data/pcieBandwidth';

interface Problem {
  target: number;
  answerGen: number;
  answerLanes: number;
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
    { gen: 2, lanes: 8 },
  ];
  return [...combos]
    .sort(() => Math.random() - 0.5)
    .slice(0, n)
    .map((c) => ({
      target: aggregateGBps(c.gen, c.lanes),
      answerGen: c.gen,
      answerLanes: c.lanes,
    }));
}

interface Props {
  sessionTime: number;
  onComplete: (won: boolean, timeSeconds: number, failReason?: string) => void;
  onAbort: () => void;
}

export function ThroughputCalc({ sessionTime, onComplete, onAbort }: Props) {
  const problems = useMemo(() => buildProblems(4), []);
  const [index, setIndex] = useState(0);
  const [gen, setGen] = useState<number | null>(null);
  const [lanes, setLanes] = useState<number | null>(null);
  const current = problems[index];

  const fill = gen != null && lanes != null ? aggregateGBps(gen, lanes) : 0;
  const maxMeter = Math.max(current.target * 1.25, 64);
  const fillPct = Math.min(100, (fill / maxMeter) * 100);
  const targetPct = Math.min(100, (current.target / maxMeter) * 100);
  const exact = gen != null && lanes != null && Math.abs(fill - current.target) < 0.01;
  const over = fill > current.target + 0.01;
  const under = fill > 0 && fill < current.target - 0.01;

  const resetPick = () => {
    setGen(null);
    setLanes(null);
  };

  return (
    <GameShell
      id="throughput-calc"
      sessionTime={sessionTime}
      onComplete={onComplete}
      onAbort={onAbort}
    >
      {({ win, mistake, locked }) => (
        <div className="mg throughput-calc">
          <p className="unit-key" title="Units">
            {UNIT_KEY}
          </p>
          <p className="prompt">
            Fill the pipe to <strong>{formatGBps(current.target)}</strong> payload. ({index + 1}/
            {problems.length})
          </p>

          <div className="pipe-meter" aria-label="Approx aggregate payload GB/s">
            <div className="pipe-track">
              <div
                className={`pipe-fill${exact ? ' ok' : over ? ' over' : under ? ' under' : ''}`}
                style={{ width: `${fillPct}%` }}
              />
              <div className="pipe-target-mark" style={{ left: `${targetPct}%` }} title="target" />
            </div>
            <div className="pipe-labels">
              <span>
                {fill > 0 ? formatGBps(fill) : '—'}
                {gen != null && lanes != null ? ` · ${GEN_LABEL[gen]} ×${lanes}` : ''}
              </span>
              <span className="pipe-target-label">
                🎯 {formatGBps(current.target)} aggregate (payload)
              </span>
            </div>
          </div>

          <div className="per-lane-legend" aria-label="Per-lane payload legend">
            {[3, 4, 5].map((g) => (
              <span key={g} className="legend-item">
                <i
                  className={`legend-bar g${g}`}
                  style={{ height: `${(PER_LANE_GBPS[g] / 4) * 18}px` }}
                />
                {GEN_LABEL[g]} ≈ {formatGBpsShort(PER_LANE_GBPS[g])}/L
              </span>
            ))}
          </div>

          <div className="pipe-pickers">
            <div className="picker-col" role="group" aria-label="Generation">
              <span className="picker-label">Gen (link rate)</span>
              <div className="picker-row">
                {[3, 4, 5].map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={`tile-btn${gen === g ? ' selected' : ''}`}
                    disabled={locked}
                    onClick={() => setGen(g)}
                  >
                    <strong>{GEN_LABEL[g]}</strong>
                    <small>{GEN_GTPS[g]}</small>
                  </button>
                ))}
              </div>
            </div>
            <div className="picker-col" role="group" aria-label="Lane width">
              <span className="picker-label">Width</span>
              <div className="picker-row">
                {LANE_WIDTHS.map((w) => (
                  <button
                    key={w}
                    type="button"
                    className={`tile-btn${lanes === w ? ' selected' : ''}`}
                    disabled={locked}
                    onClick={() => setLanes(w)}
                  >
                    <span className="mini-lanes" aria-hidden>
                      {Array.from({ length: Math.min(w, 8) }, (_, i) => (
                        <i key={i} />
                      ))}
                      {w > 8 ? <em>+{w - 8}</em> : null}
                    </span>
                    <strong>×{w}</strong>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="primary-btn train-btn"
            disabled={locked || gen == null || lanes == null}
            onClick={() => {
              if (gen == null || lanes == null) return;
              if (!exact) {
                mistake(randomFail('throughput-calc'));
                return;
              }
              if (index + 1 >= problems.length) win();
              else {
                setIndex((i) => i + 1);
                resetPick();
              }
            }}
          >
            Lock fill →
          </button>
        </div>
      )}
    </GameShell>
  );
}
