import { useMemo, useState } from 'react';
import { GameShell } from '../components/GameShell';
import { randomFail } from '../data/failStrings';

interface DeviceNeed {
  name: string;
  lanes: number;
}

interface Scenario {
  devices: DeviceNeed[];
  options: number[][];
}

function sum(xs: number[]) {
  return xs.reduce((a, b) => a + b, 0);
}

/** Each device needs its own child link with width ≥ need. */
function covers(pattern: number[], needs: number[]): boolean {
  if (sum(pattern) > 16) return false;
  if (needs.length > pattern.length) return false;
  const pool = [...pattern].sort((a, b) => b - a);
  const sortedN = [...needs].sort((a, b) => b - a);
  for (const n of sortedN) {
    const idx = pool.findIndex((p) => p >= n);
    if (idx < 0) return false;
    pool.splice(idx, 1);
  }
  return true;
}

function fmtPattern(p: number[]) {
  return p.map((x) => `×${x}`).join(' + ');
}

const SCENARIOS: Scenario[] = [
  {
    devices: [
      { name: 'GPU', lanes: 8 },
      { name: 'NVMe', lanes: 4 },
      { name: 'NIC', lanes: 4 },
    ],
    options: [
      [8, 4, 4],
      [8, 8],
      [16],
      [4, 4, 4, 4],
      [8, 8, 4],
    ],
  },
  {
    devices: [
      { name: 'Accel A', lanes: 8 },
      { name: 'Accel B', lanes: 8 },
    ],
    options: [
      [8, 8],
      [16],
      [8, 4, 4],
      [4, 4, 4, 4],
      [8, 8, 4],
    ],
  },
  {
    devices: [
      { name: 'NVMe 0', lanes: 4 },
      { name: 'NVMe 1', lanes: 4 },
      { name: 'NVMe 2', lanes: 4 },
      { name: 'NVMe 3', lanes: 4 },
    ],
    options: [
      [4, 4, 4, 4],
      [8, 4, 4],
      [8, 8],
      [16],
      [8, 8, 4],
    ],
  },
  {
    devices: [
      { name: 'SmartNIC', lanes: 8 },
      { name: 'Boot NVMe', lanes: 4 },
    ],
    options: [
      [8, 4],
      [8, 4, 4],
      [8, 8],
      [4, 4, 4, 4],
      [8, 8, 8],
    ],
  },
];

function pickScenario(): Scenario {
  return SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
}

interface Props {
  sessionTime: number;
  onComplete: (won: boolean, timeSeconds: number, failReason?: string) => void;
  onAbort: () => void;
}

export function Bifurcation({ sessionTime, onComplete, onAbort }: Props) {
  const scenario = useMemo(() => pickScenario(), []);
  const needs = scenario.devices.map((d) => d.lanes);
  const [selected, setSelected] = useState<number[] | null>(null);

  const selectedSum = selected ? sum(selected) : 0;
  const over = selected != null && selectedSum > 16;
  const ok = selected != null && covers(selected, needs);

  return (
    <GameShell id="bifurcation" sessionTime={sessionTime} onComplete={onComplete} onAbort={onAbort}>
      {({ win, mistake, locked }) => (
        <div className="mg bifurcation">
          <p className="prompt">
            Bifurcate an <strong>×16</strong> root so every device gets its own child link with
            enough lanes — without oversubscribing.
          </p>

          <div className="bifur-layout">
            <div className="root-port">
              <span className="packet-chip">ROOT PORT</span>
              <strong>×16</strong>
              <div className="lane-budget" aria-hidden>
                {Array.from({ length: 16 }, (_, i) => (
                  <span
                    key={i}
                    className={`lane-tick${selected && i < selectedSum ? (over ? ' bad' : ' used') : ''}`}
                  />
                ))}
              </div>
              <small>
                Used {selectedSum}/16
                {over ? ' — oversubscribed' : ''}
              </small>
            </div>

            <ul className="device-needs">
              {scenario.devices.map((d) => (
                <li key={d.name}>
                  <strong>{d.name}</strong>
                  <span>needs ×{d.lanes}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="choice-grid bifur-options">
            {scenario.options.map((p) => {
              const key = fmtPattern(p);
              const active = selected && fmtPattern(selected) === key;
              return (
                <button
                  key={key}
                  type="button"
                  className={`width-btn${active ? ' selected' : ''}`}
                  disabled={locked}
                  onClick={() => setSelected(p)}
                >
                  <strong>{key}</strong>
                  <small>sum {sum(p)}</small>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="primary-btn train-btn"
            disabled={locked || selected == null}
            onClick={() => {
              if (!selected) return;
              if (sum(selected) > 16 || !covers(selected, needs)) {
                mistake(randomFail('bifurcation'));
                return;
              }
              win();
            }}
          >
            Apply bifurcation
          </button>
          <p className={`bar-status${selected && !ok ? ' bad' : selected && ok ? ' good' : ''}`}>
            {!selected
              ? 'Choose a split pattern'
              : over
                ? 'Lane sum exceeds ×16'
                : !covers(selected, needs)
                  ? 'Pattern cannot cover every device with its own link'
                  : 'Legal split — ready to apply'}
          </p>
        </div>
      )}
    </GameShell>
  );
}
