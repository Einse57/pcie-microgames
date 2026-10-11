import { useState } from 'react';
import { GameShell } from '../components/GameShell';

type Owner = 'host' | 'vma' | 'vmb';
type Phase = 'map' | 'unmap' | 'flush' | 'resume';

interface Frame {
  pa: string;
  owner: Owner;
}

const OWNER_LABEL: Record<Owner, string> = {
  host: 'Host kernel',
  vma: 'VM-A RAM',
  vmb: 'VM-B RAM',
};

const IOVAS = ['0x1000', '0x2000', '0x3000'];

function makeFrames(): Frame[] {
  const owners: Owner[] = ['host', 'host', 'vma', 'vma', 'vma', 'vma', 'vmb', 'vmb'];
  const mixed = [...owners].sort(() => Math.random() - 0.5);
  return mixed.map((owner, i) => ({ owner, pa: `0x${(0x40 + i * 4).toString(16)}000` }));
}

interface Props {
  sessionTime: number;
  onComplete: (won: boolean, timeSeconds: number, failReason?: string) => void;
  onAbort: () => void;
}

export function IovaMap({ sessionTime, onComplete, onAbort }: Props) {
  const [frames] = useState(makeFrames);
  const [freed] = useState(() => IOVAS[Math.floor(Math.random() * IOVAS.length)]);
  const [phase, setPhase] = useState<Phase>('map');
  const [selected, setSelected] = useState<string | null>(null);
  /** IOMMU page table: IOVA -> frame index */
  const [table, setTable] = useState<Record<string, number>>({});
  /** Device-side Address Translation Cache (ATS) */
  const [atc, setAtc] = useState<string[]>([]);

  const frameUser = (fi: number) => Object.entries(table).find(([, f]) => f === fi)?.[0];

  return (
    <GameShell id="iova-map" sessionTime={sessionTime} onComplete={onComplete} onAbort={onAbort}>
      {({ win, mistake, locked }) => {
        const tapFrame = (fi: number) => {
          if (locked || phase !== 'map' || selected == null) return;
          const f = frames[fi];
          if (f.owner !== 'vma') {
            mistake(
              f.owner === 'host'
                ? 'That frame is host kernel memory — a guest’s device must never DMA there.'
                : 'That frame belongs to VM-B — keep VM-A’s device inside VM-A’s RAM.',
            );
            return;
          }
          if (frameUser(fi) != null) {
            mistake('Frame already mapped — pick a free VM-A page.');
            return;
          }
          const next = { ...table, [selected]: fi };
          setTable(next);
          setSelected(null);
          if (IOVAS.every((v) => next[v] != null)) {
            setAtc([...IOVAS]);
            setPhase('unmap');
          }
        };
        const tapIova = (v: string) => {
          if (locked) return;
          if (phase === 'map') {
            if (table[v] == null) setSelected(v);
            return;
          }
          if (phase === 'unmap') {
            if (v !== freed) {
              mistake(`VM-A freed IOVA ${freed} — leave ${v} mapped.`);
              return;
            }
            const next = { ...table };
            delete next[v];
            setTable(next);
            setPhase('flush');
          }
        };
        const tapAtc = (v: string) => {
          if (locked || phase !== 'flush') return;
          if (v !== freed) {
            mistake(`${v} is still valid — only invalidate the stale entry.`);
            return;
          }
          setAtc(atc.filter((x) => x !== v));
          setPhase('resume');
        };
        const resume = () => {
          if (locked) return;
          if (phase === 'flush') {
            mistake(`Stale ATC entry: the device would still DMA into IOVA ${freed}'s old page. Invalidate first.`);
            return;
          }
          if (phase === 'resume') win();
        };

        const instruction =
          phase === 'map'
            ? 'Tap an IOVA, then a VM-A page, to build the IOMMU mapping for the NIC owned by VM-A.'
            : phase === 'unmap'
              ? `VM-A freed the buffer at IOVA ${freed}. Tap it to unmap.`
              : phase === 'flush'
                ? 'Unmapped in the IOMMU — but the device cached that translation (ATS). Clear the stale ATC entry.'
                : 'Translation caches agree. Resume DMA.';

        return (
          <div className="mg iova-map">
            <p className="prompt">{instruction}</p>

            <div className="iova-layout">
              <div className="iova-dev" aria-label="Device side">
                <div className="iova-dev-head">
                  <strong>NIC → VM-A</strong>
                  <small>DMA uses IOVAs, not physical addresses</small>
                </div>
                <div className="iova-list" role="group" aria-label="IOVA buffers">
                  {IOVAS.map((v) => {
                    const fi = table[v];
                    return (
                      <button
                        key={v}
                        type="button"
                        className={`iova-chip${selected === v ? ' selected' : ''}${fi != null ? ' mapped' : ''}${phase === 'unmap' && v === freed ? ' freeing' : ''}`}
                        disabled={locked || (phase === 'map' && fi != null) || phase === 'flush' || phase === 'resume'}
                        onClick={() => tapIova(v)}
                      >
                        <strong>IOVA {v}</strong>
                        <small>{fi != null ? `→ PA ${frames[fi].pa}` : phase === 'map' ? 'unmapped' : 'unmapped ✓'}</small>
                      </button>
                    );
                  })}
                </div>
                <div className={`iova-atc${phase === 'flush' ? ' stale' : ''}`} aria-label="Address Translation Cache">
                  <small className="iova-atc-label">Device ATC (ATS cache)</small>
                  <div className="iova-atc-row">
                    {atc.length === 0 && <small className="iova-atc-empty">empty — ATS fills it as the device translates</small>}
                    {atc.map((v) => (
                      <button
                        key={v}
                        type="button"
                        className={`iova-atc-entry${phase !== 'map' && table[v] == null ? ' bad' : ''}`}
                        disabled={locked || phase !== 'flush'}
                        onClick={() => tapAtc(v)}
                        title={phase === 'flush' ? 'Send ATS invalidate for this entry' : undefined}
                      >
                        {v}
                        {phase !== 'map' && table[v] == null ? ' · stale' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="iova-iommu" aria-hidden>
                <strong>IOMMU</strong>
                <small>IOVA → PA</small>
              </div>

              <div className="iova-frames" role="group" aria-label="Physical memory frames">
                {frames.map((f, fi) => {
                  const user = frameUser(fi);
                  return (
                    <button
                      key={f.pa}
                      type="button"
                      className={`iova-frame own-${f.owner}${user ? ' used' : ''}`}
                      disabled={locked || phase !== 'map'}
                      onClick={() => tapFrame(fi)}
                    >
                      <strong>PA {f.pa}</strong>
                      <small>{OWNER_LABEL[f.owner]}</small>
                      {user && <small className="iova-frame-user">← {user}</small>}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              className="primary-btn train-btn"
              disabled={locked || (phase !== 'flush' && phase !== 'resume')}
              onClick={resume}
            >
              Resume DMA →
            </button>
          </div>
        );
      }}
    </GameShell>
  );
}
