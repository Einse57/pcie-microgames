import { useState } from 'react';
import { GameShell } from '../components/GameShell';

type DevId = 'gpu' | 'nic' | 'nvme';

interface Port {
  /** Does this switch downstream port implement the ACS capability? */
  capable: boolean;
  acsOn: boolean;
  dev: DevId | null;
}

interface Setup {
  target: DevId;
  ports: Port[];
}

const DEVS: Record<DevId, { title: string; sub: string }> = {
  gpu: { title: 'GPU', sub: 'fn .0 VGA + .1 audio' },
  nic: { title: 'NIC', sub: '25 Gb/s Ethernet' },
  nvme: { title: 'NVMe', sub: 'Gen4 ×4 SSD' },
};

const GROUP_COLORS = ['g-teal', 'g-violet', 'g-sky', 'g-pink'];

function shuffle<T>(a: T[]): T[] {
  return [...a].sort(() => Math.random() - 0.5);
}

/**
 * Round A: target sits on an ACS-capable port with ACS off → toggle it on.
 * Round B: target sits on a port without ACS → reseat it into the empty ACS-capable slot.
 */
function makeSetups(): Setup[] {
  const order = shuffle<DevId>(['gpu', 'nic', 'nvme']);
  const a: Setup = {
    target: order[0],
    ports: shuffle<Port>([
      { capable: true, acsOn: false, dev: order[0] },
      { capable: false, acsOn: false, dev: order[1] },
      { capable: true, acsOn: false, dev: order[2] },
      { capable: false, acsOn: false, dev: null },
    ]),
  };
  const b: Setup = {
    target: order[1],
    ports: shuffle<Port>([
      { capable: false, acsOn: false, dev: order[1] },
      { capable: false, acsOn: false, dev: order[0] },
      { capable: true, acsOn: false, dev: order[2] },
      { capable: true, acsOn: false, dev: null },
    ]),
  };
  return [a, b];
}

/**
 * Simplified Linux grouping: a device under a downstream port with ACS enabled
 * gets its own IOMMU group; everything under ports without ACS can talk
 * peer-to-peer inside the switch, so it collapses into one shared group.
 * Returns group key per port index (null for empty slots).
 */
function groupsFor(ports: Port[]): (string | null)[] {
  return ports.map((p, i) => (p.dev == null ? null : p.acsOn ? `iso-${i}` : 'shared'));
}

interface Props {
  sessionTime: number;
  onComplete: (won: boolean, timeSeconds: number, failReason?: string) => void;
  onAbort: () => void;
}

export function AcsGroups({ sessionTime, onComplete, onAbort }: Props) {
  const [setups] = useState(makeSetups);
  const [index, setIndex] = useState(0);
  const [ports, setPorts] = useState<Port[]>(() => setups[0].ports);
  const [held, setHeld] = useState<number | null>(null);
  const setup = setups[index];
  const groups = groupsFor(ports);
  const colorOf = (key: string | null) => {
    if (key == null) return '';
    if (key === 'shared') return 'g-amber';
    const isoKeys = [...new Set(groups.filter((g): g is string => g != null && g !== 'shared'))];
    return GROUP_COLORS[isoKeys.indexOf(key) % GROUP_COLORS.length];
  };
  const groupNo = (key: string | null) => {
    if (key == null) return '';
    const keys = [...new Set(groups.filter((g): g is string => g != null))];
    return `Group ${keys.indexOf(key) + 1}`;
  };

  return (
    <GameShell id="acs-groups" sessionTime={sessionTime} onComplete={onComplete} onAbort={onAbort}>
      {({ win, mistake, locked }) => {
        const tapToggle = (i: number) => {
          if (locked) return;
          const p = ports[i];
          if (!p.capable) {
            mistake('That switch port has no ACS capability — reseat the card on a port that does.');
            return;
          }
          setPorts(ports.map((q, j) => (j === i ? { ...q, acsOn: !q.acsOn } : q)));
        };
        const tapSlot = (i: number) => {
          if (locked) return;
          const p = ports[i];
          if (held == null) {
            if (p.dev) setHeld(i);
            return;
          }
          if (held === i) {
            setHeld(null);
            return;
          }
          if (p.dev) {
            setHeld(i);
            return;
          }
          const dev = ports[held].dev;
          setPorts(ports.map((q, j) => (j === i ? { ...q, dev } : j === held ? { ...q, dev: null } : q)));
          setHeld(null);
        };
        const commit = () => {
          if (locked) return;
          const ti = ports.findIndex((p) => p.dev === setup.target);
          const key = groups[ti];
          const mates = ports.filter((p, j) => j !== ti && p.dev && groups[j] === key).map((p) => DEVS[p.dev!].title);
          if (mates.length) {
            mistake(`${DEVS[setup.target].title} shares its IOMMU group with ${mates.join(' + ')} — VFIO must take the whole group.`);
            return;
          }
          if (index + 1 >= setups.length) {
            win();
            return;
          }
          setIndex(index + 1);
          setPorts(setups[index + 1].ports);
          setHeld(null);
        };

        return (
          <div className="mg acs-groups">
            <p className="prompt">
              Pass the <strong>{DEVS[setup.target].title}</strong> through to a VM — it needs an IOMMU group of its own.
              Tap <em>ACS</em> to toggle a port; tap a card, then an empty slot, to reseat it. ({index + 1}/{setups.length})
            </p>

            <div className="acs-tree" aria-label="Root port, switch and downstream ports">
              <div className="acs-node acs-root">
                <strong>Root Port</strong>
                <small>ACS ✓ · IOMMU behind it</small>
              </div>
              <span className="acs-trunk" aria-hidden />
              <div className="acs-node acs-usp">
                <strong>Switch</strong>
                <small>upstream port</small>
              </div>
              <div className="acs-dsps">
                {ports.map((p, i) => {
                  const key = groups[i];
                  const isTarget = p.dev === setup.target;
                  return (
                    <div key={i} className="acs-col">
                      <button
                        type="button"
                        className={`acs-toggle${p.capable ? '' : ' nocap'}${p.acsOn ? ' on' : ''}`}
                        disabled={locked}
                        onClick={() => tapToggle(i)}
                        aria-pressed={p.acsOn}
                        aria-label={`Downstream port ${i} ACS ${p.capable ? (p.acsOn ? 'on' : 'off') : 'not supported'}`}
                      >
                        <small>DSP{i}</small>
                        <strong>{p.capable ? (p.acsOn ? 'ACS on' : 'ACS off') : 'no ACS'}</strong>
                      </button>
                      <span className="acs-drop" aria-hidden />
                      <button
                        type="button"
                        className={`acs-slot${p.dev ? ` dev ${colorOf(key)}` : ' empty'}${held === i ? ' held' : ''}${isTarget ? ' target' : ''}`}
                        disabled={locked}
                        onClick={() => tapSlot(i)}
                      >
                        {p.dev ? (
                          <>
                            <strong>{DEVS[p.dev].title}</strong>
                            <small>{DEVS[p.dev].sub}</small>
                            <span className="acs-group-tag">{groupNo(key)}</span>
                          </>
                        ) : (
                          <small>{held != null ? 'drop here' : 'empty slot'}</small>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="acs-legend" aria-hidden>
              <span className="acs-swatch g-amber" /> shared group (peers can DMA each other inside the switch)
              <span className="acs-swatch g-teal" /> isolated group
            </p>

            <button type="button" className="primary-btn train-btn" disabled={locked} onClick={commit}>
              Assign {DEVS[setup.target].title} to VM →
            </button>
          </div>
        );
      }}
    </GameShell>
  );
}
