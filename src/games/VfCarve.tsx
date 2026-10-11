import { useState } from 'react';
import { GameShell } from '../components/GameShell';
import { randomFail } from '../data/failStrings';

/** Hard cap the PF advertises in its SR-IOV capability */
const TOTAL_VFS = 8;
const VM_NAMES = ['VM-A', 'VM-B', 'VM-C', 'VM-D'];

type Phase = 'spawn' | 'wire';
/** 0 = PF0, 1..n = VF1..VFn */
type FnId = number;
/** 'host' or a VM index */
type Target = 'host' | number;

interface Props {
  sessionTime: number;
  onComplete: (won: boolean, timeSeconds: number, failReason?: string) => void;
  onAbort: () => void;
}

function fnLabel(fn: FnId): string {
  return fn === 0 ? 'PF0' : `VF${fn}`;
}

/** Routing ID shown under each function (First VF Offset = 1, VF Stride = 1) */
function fnBdf(fn: FnId): string {
  return `03:00.${fn}`;
}

export function VfCarve({ sessionTime, onComplete, onAbort }: Props) {
  const [vmCount] = useState(() => 2 + Math.floor(Math.random() * 3));
  const [phase, setPhase] = useState<Phase>('spawn');
  const [numVfs, setNumVfs] = useState(0);
  const [selected, setSelected] = useState<FnId | null>(null);
  /** function -> where it is assigned */
  const [owner, setOwner] = useState<Record<number, Target>>({});

  const vms = VM_NAMES.slice(0, vmCount);
  const fns: FnId[] = [0, ...Array.from({ length: numVfs }, (_, i) => i + 1)];
  const vmHas = (vm: number) => Object.entries(owner).find(([, t]) => t === vm)?.[0];
  const hostHas = Object.entries(owner).filter(([, t]) => t === 'host').map(([f]) => Number(f));

  return (
    <GameShell id="sriov-vf" sessionTime={sessionTime} onComplete={onComplete} onAbort={onAbort}>
      {({ win, mistake, locked }) => {
        const assign = (target: Target) => {
          if (locked || selected == null) return;
          const fn = selected;
          if (fn === 0 && target !== 'host') {
            mistake('The PF owns the SR-IOV controls — keep PF0 with the host / hypervisor.');
            return;
          }
          if (fn !== 0 && target === 'host') {
            mistake('Host already drives the PF. Hand VFs to the guests.');
            return;
          }
          if (typeof target === 'number' && vmHas(target) != null) {
            mistake(`${vms[target]} already has a VF — one per VM.`);
            return;
          }
          const next = { ...owner, [fn]: target };
          setOwner(next);
          setSelected(null);
          const pfDone = next[0] === 'host';
          const allVms = vms.every((_, i) => Object.values(next).includes(i));
          if (pfDone && allVms) win();
        };

        return (
          <div className="mg sriov-vf">
            <p className="prompt">
              {phase === 'spawn' ? (
                <>
                  <strong>{vmCount} VMs</strong> each need their own NIC. Dial <em>NumVFs</em>, then enable SR-IOV.
                </>
              ) : (
                <>Tap a function, then tap who gets it. PF stays with the host; one VF per VM.</>
              )}
            </p>

            <span className="unit-key">
              25 Gb/s Ethernet port (≈3.1 GB/s) · PCIe Gen4 ×8 = 16 GT/s per lane (≈16 GB/s link)
            </span>

            <div className="sriov-card" aria-label="SR-IOV NIC">
              <div className="sriov-card-head">
                <strong>NIC</strong>
                <small>1 physical port · TotalVFs {TOTAL_VFS}</small>
              </div>
              <div className="sriov-fns" role="group" aria-label="PCIe functions">
                {fns.map((fn) => {
                  const t = owner[fn];
                  const placed = t != null;
                  return (
                    <button
                      key={fn}
                      type="button"
                      className={`sriov-fn${fn === 0 ? ' pf' : ' vf'}${selected === fn ? ' selected' : ''}${placed ? ' placed' : ''}`}
                      disabled={locked || phase !== 'wire' || placed}
                      onClick={() => setSelected(fn)}
                      aria-pressed={selected === fn}
                    >
                      <strong>{fnLabel(fn)}</strong>
                      <small>{fnBdf(fn)}</small>
                      {placed && <small className="sriov-dest">→ {t === 'host' ? 'Host' : vms[t]}</small>}
                    </button>
                  );
                })}
                {phase === 'spawn' &&
                  Array.from({ length: TOTAL_VFS - numVfs }, (_, i) => (
                    <span key={`ghost-${i}`} className="sriov-fn ghost" aria-hidden>
                      <small>VF{numVfs + i + 1}</small>
                    </span>
                  ))}
              </div>
              <div className="sriov-port" aria-hidden>
                <span className="sriov-port-jack" />
                <small>shared 25 Gb/s port — every VF rides it</small>
              </div>
            </div>

            {phase === 'spawn' && (
              <div className="sriov-dial" role="group" aria-label="NumVFs">
                <button
                  type="button"
                  className="ghost-btn"
                  disabled={locked}
                  onClick={() => setNumVfs((n) => Math.max(0, n - 1))}
                  aria-label="Fewer VFs"
                >
                  −
                </button>
                <div className="sriov-dial-read">
                  <strong>{numVfs}</strong>
                  <small>NumVFs</small>
                </div>
                <button
                  type="button"
                  className="ghost-btn"
                  disabled={locked}
                  onClick={() => {
                    if (numVfs >= TOTAL_VFS) {
                      mistake(`TotalVFs is ${TOTAL_VFS} — the PF cannot spawn more.`);
                      return;
                    }
                    setNumVfs((n) => n + 1);
                  }}
                  aria-label="More VFs"
                >
                  +
                </button>
                <button
                  type="button"
                  className="primary-btn"
                  disabled={locked}
                  onClick={() => {
                    if (numVfs !== vmCount) {
                      mistake(randomFail('sriov-vf'));
                      return;
                    }
                    setPhase('wire');
                  }}
                >
                  Enable VFs →
                </button>
              </div>
            )}

            <div className="sriov-targets" role="group" aria-label="Host and VMs">
              <button
                type="button"
                className={`sriov-target host${hostHas.length ? ' filled' : ''}`}
                disabled={locked || phase !== 'wire'}
                onClick={() => assign('host')}
              >
                <strong>Host / hypervisor</strong>
                <small>{hostHas.length ? hostHas.map(fnLabel).join(', ') : 'PF driver'}</small>
              </button>
              {vms.map((name, i) => {
                const has = vmHas(i);
                return (
                  <button
                    key={name}
                    type="button"
                    className={`sriov-target vm${has != null ? ' filled' : ''}`}
                    disabled={locked || phase !== 'wire'}
                    onClick={() => assign(i)}
                  >
                    <strong>{name}</strong>
                    <small>{has != null ? `${fnLabel(Number(has))} passthrough` : 'needs a NIC'}</small>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }}
    </GameShell>
  );
}
