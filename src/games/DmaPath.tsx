import { useMemo, useState } from 'react';
import { GameShell } from '../components/GameShell';
import { randomFail } from '../data/failStrings';

type PathId = 'dma-via-rc' | 'cpu-memcpy' | 'p2p-no-acs';

interface Scenario {
  title: string;
  from: string;
  answer: PathId;
}

const PATHS: { id: PathId; label: string; detail: string }[] = [
  { id: 'dma-via-rc', label: 'DMA via Root', detail: 'EP → RP → Memory' },
  { id: 'cpu-memcpy', label: 'CPU memcpy', detail: 'CPU copies every byte' },
  { id: 'p2p-no-acs', label: 'Peer hop', detail: 'EP → peer GPU (no ACS)' },
];

const POOL: Scenario[] = [
  { title: 'NVMe write to host DRAM', from: 'NVMe', answer: 'dma-via-rc' },
  { title: 'NIC RX buffer into system memory', from: 'NIC', answer: 'dma-via-rc' },
  { title: 'GPU uploads framebuffer to host', from: 'GPU', answer: 'dma-via-rc' },
  { title: 'HBA posts completion queue to DRAM', from: 'HBA', answer: 'dma-via-rc' },
];

function pickRounds(n: number): Scenario[] {
  return [...POOL].sort(() => Math.random() - 0.5).slice(0, n);
}

interface Props {
  sessionTime: number;
  onComplete: (won: boolean, timeSeconds: number, failReason?: string) => void;
  onAbort: () => void;
}

export function DmaPath({ sessionTime, onComplete, onAbort }: Props) {
  const rounds = useMemo(() => pickRounds(4), []);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<PathId | null>(null);
  const current = rounds[index];

  return (
    <GameShell id="dma-path" sessionTime={sessionTime} onComplete={onComplete} onAbort={onAbort}>
      {({ win, mistake, locked }) => (
        <div className="mg dma-path">
          <p className="prompt">
            Wire the DMA path for <strong>{current.title}</strong>. ({index + 1}/{rounds.length})
          </p>

          <div className="dma-stage" aria-label="DMA topology">
            <div className="dma-node mem">
              <strong>Memory</strong>
              <small>DRAM</small>
            </div>
            <div className="dma-node cpu">
              <strong>CPU</strong>
              <small>programs only</small>
            </div>
            <div className="dma-node rc">
              <strong>Root</strong>
              <small>Complex</small>
            </div>
            <div className="dma-node ep">
              <strong>{current.from}</strong>
              <small>Endpoint</small>
            </div>
            <div
              className={`dma-glow${picked ? ` path-${picked}` : ''}`}
              aria-hidden
            />
          </div>

          <div className="path-choices" role="group" aria-label="DMA routes">
            {PATHS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`path-btn${picked === p.id ? ' selected' : ''}`}
                disabled={locked}
                onClick={() => setPicked(p.id)}
              >
                <strong>{p.label}</strong>
                <small>{p.detail}</small>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="primary-btn train-btn"
            disabled={locked || picked == null}
            onClick={() => {
              if (!picked) return;
              if (picked !== current.answer) {
                mistake(randomFail('dma-path'));
                return;
              }
              if (index + 1 >= rounds.length) win();
              else {
                setIndex((i) => i + 1);
                setPicked(null);
              }
            }}
          >
            Commit path →
          </button>
        </div>
      )}
    </GameShell>
  );
}
