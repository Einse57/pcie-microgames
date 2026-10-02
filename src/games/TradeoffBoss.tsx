import { useMemo, useState } from 'react';
import { GameShell } from '../components/GameShell';
import { randomFail } from '../data/failStrings';
import { aggregateGBps, formatGBps, GEN_LABEL } from '../data/pcieBandwidth';

interface Combo {
  gen: number;
  lanes: number;
}

interface Scenario {
  title: string;
  targetGBps: number;
  /** Human-readable constraints */
  constraints: string[];
  /** Filter which combos are allowed */
  allow: (c: Combo) => boolean;
  options: Combo[];
}

function overkill(c: Combo, target: number) {
  return aggregateGBps(c.gen, c.lanes) - target;
}

function leanestValid(options: Combo[], target: number, allow: (c: Combo) => boolean): Combo {
  const valid = options
    .filter((c) => allow(c) && aggregateGBps(c.gen, c.lanes) >= target)
    .sort((a, b) => {
      const oa = overkill(a, target);
      const ob = overkill(b, target);
      if (oa !== ob) return oa - ob;
      // tie-break: fewer lanes, then lower gen
      if (a.lanes !== b.lanes) return a.lanes - b.lanes;
      return a.gen - b.gen;
    });
  return valid[0];
}

const SCENARIOS: Scenario[] = [
  {
    title: 'Need ≥ 8 GB/s unidirectional',
    targetGBps: 8,
    constraints: ['Board is Gen4-only (no Gen5 PHY)', 'Prefer least overkill'],
    allow: (c) => c.gen <= 4,
    options: [
      { gen: 3, lanes: 4 },
      { gen: 3, lanes: 8 },
      { gen: 4, lanes: 4 },
      { gen: 4, lanes: 8 },
      { gen: 5, lanes: 4 },
    ],
  },
  {
    title: 'Need ≥ 16 GB/s unidirectional',
    targetGBps: 16,
    constraints: ['Mechanical slot is ×8 max', 'Gen5 capable'],
    allow: (c) => c.lanes <= 8,
    options: [
      { gen: 3, lanes: 8 },
      { gen: 4, lanes: 8 },
      { gen: 5, lanes: 4 },
      { gen: 5, lanes: 8 },
      { gen: 4, lanes: 16 },
    ],
  },
  {
    title: 'Need ≥ 4 GB/s unidirectional',
    targetGBps: 4,
    constraints: ['Only Gen3 silicon available', 'Power budget favors fewer lanes'],
    allow: (c) => c.gen === 3,
    options: [
      { gen: 3, lanes: 1 },
      { gen: 3, lanes: 4 },
      { gen: 3, lanes: 8 },
      { gen: 4, lanes: 4 },
      { gen: 5, lanes: 1 },
    ],
  },
  {
    title: 'Need ≥ 32 GB/s unidirectional',
    targetGBps: 32,
    constraints: ['×16 slot available', 'Platform qualified through Gen4 only'],
    allow: (c) => c.gen <= 4,
    options: [
      { gen: 4, lanes: 8 },
      { gen: 4, lanes: 16 },
      { gen: 5, lanes: 8 },
      { gen: 5, lanes: 16 },
      { gen: 3, lanes: 16 },
    ],
  },
  {
    title: 'Need ≥ 2 GB/s unidirectional',
    targetGBps: 2,
    constraints: ['M.2 socket is ×4', 'Gen4 board'],
    allow: (c) => c.lanes <= 4 && c.gen <= 4,
    options: [
      { gen: 3, lanes: 1 },
      { gen: 3, lanes: 4 },
      { gen: 4, lanes: 1 },
      { gen: 4, lanes: 4 },
      { gen: 5, lanes: 4 },
    ],
  },
];

function pickScenario(): Scenario {
  return SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
}

function comboKey(c: Combo) {
  return `${c.gen}x${c.lanes}`;
}

function comboLabel(c: Combo) {
  return `${GEN_LABEL[c.gen]} ×${c.lanes}`;
}

interface Props {
  sessionTime: number;
  onComplete: (won: boolean, timeSeconds: number, failReason?: string) => void;
  onAbort: () => void;
}

export function TradeoffBoss({ sessionTime, onComplete, onAbort }: Props) {
  const scenario = useMemo(() => pickScenario(), []);
  const best = useMemo(
    () => leanestValid(scenario.options, scenario.targetGBps, scenario.allow),
    [scenario],
  );

  const [picked, setPicked] = useState<Combo | null>(null);

  return (
    <GameShell
      id="tradeoff-boss"
      sessionTime={sessionTime}
      onComplete={onComplete}
      onAbort={onAbort}
    >
      {({ win, mistake, locked }) => (
        <div className="mg tradeoff-boss">
          <p className="prompt">
            Meet the bandwidth target under constraints — choose the leanest valid Gen × width.
          </p>

          <div className="scenario-card boss-card">
            <span className="packet-chip">TRADEOFF</span>
            <h2>{scenario.title}</h2>
            <ul className="constraint-list">
              {scenario.constraints.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <p className="scenario-detail">
              Target: <strong>≥ {formatGBps(scenario.targetGBps)}</strong> (taught approx.)
            </p>
          </div>

          <div className="choice-grid">
            {scenario.options.map((c) => {
              const ag = aggregateGBps(c.gen, c.lanes);
              const active = picked && comboKey(picked) === comboKey(c);
              return (
                <button
                  key={comboKey(c)}
                  type="button"
                  className={`width-btn${active ? ' selected' : ''}`}
                  disabled={locked}
                  onClick={() => setPicked(c)}
                >
                  <strong>{comboLabel(c)}</strong>
                  <small>≈ {formatGBps(ag)}</small>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="primary-btn train-btn"
            disabled={locked || picked == null}
            onClick={() => {
              if (!picked) return;
              const ag = aggregateGBps(picked.gen, picked.lanes);
              if (!scenario.allow(picked)) {
                mistake('Constraint violation — board Gen or slot width blocks that pick.');
                return;
              }
              if (ag < scenario.targetGBps) {
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
            Commit selection
          </button>
        </div>
      )}
    </GameShell>
  );
}
