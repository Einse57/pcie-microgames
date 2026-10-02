import { useMemo, useState, type CSSProperties } from 'react';
import { GameShell } from '../components/GameShell';
import { randomFail } from '../data/failStrings';

interface DeviceNeed {
  id: string;
  name: string;
  lanes: number;
  color: string;
}

interface Scenario {
  devices: DeviceNeed[];
}

const COLORS = ['#5eead4', '#a78bfa', '#fbbf24', '#38bdf8', '#f472b6'];

const SCENARIOS: Omit<Scenario, 'devices'> & { devices: Omit<DeviceNeed, 'id' | 'color'>[] }[] = [
  {
    devices: [
      { name: 'GPU', lanes: 8 },
      { name: 'NVMe', lanes: 4 },
      { name: 'NIC', lanes: 4 },
    ],
  },
  {
    devices: [
      { name: 'Accel A', lanes: 8 },
      { name: 'Accel B', lanes: 8 },
    ],
  },
  {
    devices: [
      { name: 'NVMe 0', lanes: 4 },
      { name: 'NVMe 1', lanes: 4 },
      { name: 'NVMe 2', lanes: 4 },
      { name: 'NVMe 3', lanes: 4 },
    ],
  },
  {
    devices: [
      { name: 'SmartNIC', lanes: 8 },
      { name: 'Boot', lanes: 4 },
    ],
  },
];

function pickScenario(): Scenario {
  const raw = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
  return {
    devices: raw.devices.map((d, i) => ({
      ...d,
      id: `${d.name}-${i}`,
      color: COLORS[i % COLORS.length],
    })),
  };
}

/** Lane ownership: device id or null */
type LaneMap = (string | null)[];

function canPlace(map: LaneMap, start: number, width: number, deviceId: string): boolean {
  if (start < 0 || start + width > 16) return false;
  for (let i = start; i < start + width; i++) {
    if (map[i] != null && map[i] !== deviceId) return false;
  }
  return true;
}

function place(map: LaneMap, start: number, width: number, deviceId: string): LaneMap {
  const next = [...map];
  // clear previous placement of this device
  for (let i = 0; i < 16; i++) if (next[i] === deviceId) next[i] = null;
  for (let i = start; i < start + width; i++) next[i] = deviceId;
  return next;
}

function clearDevice(map: LaneMap, deviceId: string): LaneMap {
  return map.map((v) => (v === deviceId ? null : v));
}

function allCovered(map: LaneMap, devices: DeviceNeed[]): boolean {
  return devices.every((d) => {
    const lanes = map.map((v, i) => (v === d.id ? i : -1)).filter((i) => i >= 0);
    if (lanes.length !== d.lanes) return false;
    // must be contiguous
    const min = Math.min(...lanes);
    const max = Math.max(...lanes);
    return max - min + 1 === d.lanes && lanes.length === d.lanes;
  });
}

interface Props {
  sessionTime: number;
  onComplete: (won: boolean, timeSeconds: number, failReason?: string) => void;
  onAbort: () => void;
}

export function Bifurcation({ sessionTime, onComplete, onAbort }: Props) {
  const scenario = useMemo(() => pickScenario(), []);
  const [map, setMap] = useState<LaneMap>(() => Array(16).fill(null));
  const [active, setActive] = useState<string | null>(scenario.devices[0]?.id ?? null);

  const used = map.filter(Boolean).length;
  const covered = allCovered(map, scenario.devices);
  const activeDev = scenario.devices.find((d) => d.id === active) ?? null;

  return (
    <GameShell id="bifurcation" sessionTime={sessionTime} onComplete={onComplete} onAbort={onAbort}>
      {({ win, mistake, locked }) => (
        <div className="mg bifurcation">
          <p className="prompt">
            Split the <strong>×16</strong> — place each device on contiguous lanes.
          </p>

          <div className="bifur-devices" role="group" aria-label="Devices">
            {scenario.devices.map((d) => {
              const placed = map.some((v) => v === d.id);
              return (
                <button
                  key={d.id}
                  type="button"
                  className={`bifur-dev${active === d.id ? ' active' : ''}${placed ? ' placed' : ''}`}
                  style={{ '--dev-color': d.color } as CSSProperties}
                  disabled={locked}
                  onClick={() => setActive(d.id)}
                >
                  <strong>{d.name}</strong>
                  <span className="dev-need-ticks" aria-hidden>
                    {Array.from({ length: d.lanes }, (_, i) => (
                      <i key={i} />
                    ))}
                  </span>
                  <small>×{d.lanes}</small>
                </button>
              );
            })}
          </div>

          <div className="root-bus" aria-label="×16 root port lanes">
            <div className="root-bus-head">
              <span className="packet-chip">ROOT ×16</span>
              <small>
                {used}/16 used
                {activeDev ? ` · tap start for ${activeDev.name} (×${activeDev.lanes})` : ''}
              </small>
            </div>
            <div className="lane-carve" role="group">
              {Array.from({ length: 16 }, (_, i) => {
                const owner = map[i];
                const dev = scenario.devices.find((d) => d.id === owner);
                const preview =
                  activeDev &&
                  canPlace(map, i, activeDev.lanes, activeDev.id) &&
                  !map.slice(i, i + activeDev.lanes).every((v) => v === activeDev.id);
                return (
                  <button
                    key={i}
                    type="button"
                    className={`carve-tick${owner ? ' owned' : ''}${preview ? ' preview' : ''}`}
                    style={
                      owner && dev
                        ? ({ background: dev.color, borderColor: dev.color } as CSSProperties)
                        : activeDev && preview
                          ? ({ '--dev-color': activeDev.color } as CSSProperties)
                          : undefined
                    }
                    disabled={locked || !activeDev}
                    title={`Lane ${i}`}
                    onClick={() => {
                      if (!activeDev || locked) return;
                      // tap owned by same device → clear
                      if (owner === activeDev.id) {
                        setMap((m) => clearDevice(m, activeDev.id));
                        return;
                      }
                      if (!canPlace(map, i, activeDev.lanes, activeDev.id)) {
                        mistake(randomFail('bifurcation'));
                        return;
                      }
                      setMap((m) => place(m, i, activeDev.lanes, activeDev.id));
                    }}
                  >
                    {i}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bifur-actions">
            <button
              type="button"
              className="ghost-btn"
              disabled={locked || used === 0}
              onClick={() => setMap(Array(16).fill(null))}
            >
              Clear
            </button>
            <button
              type="button"
              className="primary-btn train-btn"
              disabled={locked}
              onClick={() => {
                if (!covered) {
                  mistake(randomFail('bifurcation'));
                  return;
                }
                win();
              }}
            >
              Apply split →
            </button>
          </div>
          <p className={`bar-status${covered ? ' good' : used > 0 ? ' bad' : ''}`}>
            {covered
              ? 'All devices covered — ready'
              : used > 0
                ? 'Place every device on a free contiguous block'
                : 'Select a device, then tap a start lane'}
          </p>
        </div>
      )}
    </GameShell>
  );
}
