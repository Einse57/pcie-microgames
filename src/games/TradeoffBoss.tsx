import { useMemo, useState } from 'react';
import { GameShell } from '../components/GameShell';
import { randomFail } from '../data/failStrings';
import {
  aggregateGBps,
  formatGBps,
  GEN_GTPS,
  GEN_LABEL,
  LANE_WIDTHS,
  UNIT_KEY,
} from '../data/pcieBandwidth';

interface Combo {
  gen: number;
  lanes: number;
}

interface Scenario {
  targetGBps: number;
  /** Icon chips shown as locks/caps */
  chips: { icon: string; label: string }[];
  allow: (c: Combo) => boolean;
  maxGen: number;
  maxLanes: number;
}

function overkill(c: Combo, target: number) {
  return aggregateGBps(c.gen, c.lanes) - target;
}

function leanestValid(
  pool: Combo[],
  target: number,
  allow: (c: Combo) => boolean,
): Combo | null {
  const valid = pool
    .filter((c) => allow(c) && aggregateGBps(c.gen, c.lanes) >= target)
    .sort((a, b) => {
      const oa = overkill(a, target);
      const ob = overkill(b, target);
      if (oa !== ob) return oa - ob;
      if (a.lanes !== b.lanes) return a.lanes - b.lanes;
      return a.gen - b.gen;
    });
  return valid[0] ?? null;
}

const SCENARIOS: Scenario[] = [
  {
    targetGBps: 8,
    chips: [
      { icon: '🔒', label: 'Gen4 max' },
      { icon: '⚖️', label: 'Leanest' },
    ],
    allow: (c) => c.gen <= 4,
    maxGen: 4,
    maxLanes: 16,
  },
  {
    targetGBps: 16,
    chips: [
      { icon: '🔌', label: '×8 slot' },
      { icon: '⚡', label: 'Gen5 OK' },
    ],
    allow: (c) => c.lanes <= 8,
    maxGen: 5,
    maxLanes: 8,
  },
  {
    targetGBps: 4,
    chips: [
      { icon: '🔒', label: 'Gen3 only' },
      { icon: '🔋', label: 'Fewer lanes' },
    ],
    allow: (c) => c.gen === 3,
    maxGen: 3,
    maxLanes: 16,
  },
  {
    targetGBps: 32,
    chips: [
      { icon: '🔌', label: '×16 OK' },
      { icon: '🔒', label: 'Gen4 max' },
    ],
    allow: (c) => c.gen <= 4,
    maxGen: 4,
    maxLanes: 16,
  },
  {
    targetGBps: 2,
    chips: [
      { icon: '🔌', label: '×4 M.2' },
      { icon: '🔒', label: 'Gen4 board' },
    ],
    allow: (c) => c.lanes <= 4 && c.gen <= 4,
    maxGen: 4,
    maxLanes: 4,
  },
];

function pickScenario(): Scenario {
  return SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
}

function comboKey(c: Combo) {
  return `${c.gen}x${c.lanes}`;
}

interface Props {
  sessionTime: number;
  onComplete: (won: boolean, timeSeconds: number, failReason?: string) => void;
  onAbort: () => void;
}

export function TradeoffBoss({ sessionTime, onComplete, onAbort }: Props) {
  const scenario = useMemo(() => pickScenario(), []);
  const gens = [1, 2, 3, 4, 5].filter((g) => g <= Math.max(scenario.maxGen + 1, 5));
  const widths = LANE_WIDTHS.filter((w) => w <= Math.max(scenario.maxLanes, 16));

  const pool = useMemo(
    () =>
      [1, 2, 3, 4, 5].flatMap((gen) =>
        LANE_WIDTHS.map((lanes) => ({ gen, lanes })),
      ),
    [],
  );

  const best = useMemo(
    () => leanestValid(pool, scenario.targetGBps, scenario.allow),
    [scenario, pool],
  );

  const [gen, setGen] = useState<number | null>(null);
  const [lanes, setLanes] = useState<number | null>(null);

  const fill = gen != null && lanes != null ? aggregateGBps(gen, lanes) : 0;
  const maxMeter = Math.max(scenario.targetGBps * 1.5, 64);
  const fillPct = Math.min(100, (fill / maxMeter) * 100);
  const targetPct = Math.min(100, (scenario.targetGBps / maxMeter) * 100);
  const meets = fill >= scenario.targetGBps - 0.01;
  const allowed = gen != null && lanes != null && scenario.allow({ gen, lanes });
  const genBlocked = (g: number) => !widths.some((w) => scenario.allow({ gen: g, lanes: w }));
  const laneBlocked = (w: number) =>
    gen != null ? !scenario.allow({ gen, lanes: w }) : w > scenario.maxLanes;

  return (
    <GameShell
      id="tradeoff-boss"
      sessionTime={sessionTime}
      onComplete={onComplete}
      onAbort={onAbort}
    >
      {({ win, mistake, locked }) => (
        <div className="mg tradeoff-boss">
          <p className="unit-key" title="Units">
            {UNIT_KEY}
          </p>
          <p className="prompt">
            Build a link ≥ <strong>{formatGBps(scenario.targetGBps)}</strong> payload — leanest valid.
          </p>

          <div className="constraint-chips" aria-label="Constraints">
            {scenario.chips.map((c) => (
              <span key={c.label} className="lock-chip">
                <span aria-hidden>{c.icon}</span> {c.label}
              </span>
            ))}
          </div>

          <div className="pipe-meter boss-meter" aria-label="Bandwidth vs target">
            <div className="pipe-track">
              <div
                className={`pipe-fill${meets && allowed ? ' ok' : fill > 0 && (!meets || !allowed) ? ' under' : ''}`}
                style={{ width: `${fillPct}%` }}
              />
              <div className="pipe-target-mark" style={{ left: `${targetPct}%` }} />
            </div>
            <div className="pipe-labels">
              <span>{fill > 0 ? formatGBps(fill) : '— assemble Gen × width'}</span>
              <span className="pipe-target-label">🎯 ≥ {formatGBps(scenario.targetGBps)} payload</span>
            </div>
          </div>

          <div className="pipe-pickers">
            <div className="picker-col" role="group" aria-label="Generation">
              <span className="picker-label">Gen (link rate)</span>
              <div className="picker-row gen-rungs">
                {gens.map((g) => {
                  const blocked = genBlocked(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      className={`tile-btn rung${gen === g ? ' selected' : ''}${blocked ? ' locked' : ''}`}
                      disabled={locked}
                      onClick={() => {
                        if (blocked) {
                          mistake('Constraint violation — board Gen or slot width blocks that pick.');
                          return;
                        }
                        setGen(g);
                      }}
                    >
                      {blocked && <span className="lock-badge" aria-hidden>🔒</span>}
                      <strong>{GEN_LABEL[g]}</strong>
                      <small>{GEN_GTPS[g]}</small>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="picker-col" role="group" aria-label="Lane width">
              <span className="picker-label">Width</span>
              <div className="lane-bar-picker">
                {widths.map((w) => {
                  const blocked = laneBlocked(w) || w > scenario.maxLanes;
                  return (
                    <button
                      key={w}
                      type="button"
                      className={`lane-pick${lanes === w ? ' selected' : ''}${blocked ? ' locked' : ''}`}
                      disabled={locked}
                      onClick={() => {
                        if (w > scenario.maxLanes || (gen != null && !scenario.allow({ gen, lanes: w }))) {
                          mistake('Constraint violation — board Gen or slot width blocks that pick.');
                          return;
                        }
                        setLanes(w);
                      }}
                    >
                      <span className="lane-pick-ticks" aria-hidden>
                        {Array.from({ length: 16 }, (_, i) => (
                          <i key={i} className={i < w ? 'on' : ''} />
                        ))}
                      </span>
                      <strong>×{w}</strong>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="primary-btn train-btn"
            disabled={locked || gen == null || lanes == null}
            onClick={() => {
              if (gen == null || lanes == null || !best) return;
              const picked = { gen, lanes };
              if (!scenario.allow(picked)) {
                mistake('Constraint violation — board Gen or slot width blocks that pick.');
                return;
              }
              if (aggregateGBps(gen, lanes) < scenario.targetGBps) {
                mistake('Under target — that combo does not meet the bandwidth need.');
                return;
              }
              if (comboKey(picked) !== comboKey(best)) {
                mistake(randomFail('tradeoff-boss'));
                return;
              }
              win();
            }}
          >
            Commit link →
          </button>
        </div>
      )}
    </GameShell>
  );
}
