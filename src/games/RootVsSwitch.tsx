import { useMemo, useState } from 'react';
import { GameShell } from '../components/GameShell';
import { randomFail } from '../data/failStrings';

type NodeKind = 'root-port' | 'switch-ds' | 'endpoint';

interface Node {
  id: string;
  kind: NodeKind;
  label: string;
  x: number;
  y: number;
}

interface Round {
  highlightId: string;
  answer: NodeKind;
  prompt: string;
}

const BINS: { kind: NodeKind; title: string; hint: string }[] = [
  { kind: 'root-port', title: 'Root Port', hint: 'on Root Complex' },
  { kind: 'switch-ds', title: 'Switch DS', hint: 'downstream port' },
  { kind: 'endpoint', title: 'Endpoint', hint: 'leaf device' },
];

const DIAGRAM: Node[] = [
  { id: 'rc', kind: 'root-port', label: 'RC', x: 50, y: 12 },
  { id: 'rp0', kind: 'root-port', label: 'RP0', x: 28, y: 32 },
  { id: 'rp1', kind: 'root-port', label: 'RP1', x: 72, y: 32 },
  { id: 'sw', kind: 'switch-ds', label: 'SW', x: 28, y: 54 },
  { id: 'sw-ds0', kind: 'switch-ds', label: 'DS0', x: 12, y: 72 },
  { id: 'sw-ds1', kind: 'switch-ds', label: 'DS1', x: 44, y: 72 },
  { id: 'ep-gpu', kind: 'endpoint', label: 'GPU', x: 12, y: 90 },
  { id: 'ep-nic', kind: 'endpoint', label: 'NIC', x: 44, y: 90 },
  { id: 'ep-nvme', kind: 'endpoint', label: 'NVMe', x: 72, y: 54 },
];

const ROUND_POOL: Round[] = [
  { highlightId: 'rp0', answer: 'root-port', prompt: 'Classify the highlighted port.' },
  { highlightId: 'rp1', answer: 'root-port', prompt: 'Classify the highlighted port.' },
  { highlightId: 'sw-ds0', answer: 'switch-ds', prompt: 'Classify the highlighted port.' },
  { highlightId: 'sw-ds1', answer: 'switch-ds', prompt: 'Classify the highlighted port.' },
  { highlightId: 'ep-gpu', answer: 'endpoint', prompt: 'Classify the highlighted device.' },
  { highlightId: 'ep-nic', answer: 'endpoint', prompt: 'Classify the highlighted device.' },
  { highlightId: 'ep-nvme', answer: 'endpoint', prompt: 'Classify the highlighted device.' },
  { highlightId: 'sw', answer: 'switch-ds', prompt: 'This chip fans out links — classify it.' },
];

function pickRounds(n: number): Round[] {
  return [...ROUND_POOL].sort(() => Math.random() - 0.5).slice(0, n);
}

interface Props {
  sessionTime: number;
  onComplete: (won: boolean, timeSeconds: number, failReason?: string) => void;
  onAbort: () => void;
}

export function RootVsSwitch({ sessionTime, onComplete, onAbort }: Props) {
  const rounds = useMemo(() => pickRounds(4), []);
  const [index, setIndex] = useState(0);
  const current = rounds[index];
  const hi = DIAGRAM.find((n) => n.id === current.highlightId)!;

  return (
    <GameShell id="root-vs-switch" sessionTime={sessionTime} onComplete={onComplete} onAbort={onAbort}>
      {({ win, mistake, locked }) => (
        <div className="mg root-vs-switch">
          <p className="prompt">
            {current.prompt} <strong>{hi.label}</strong> ({index + 1}/{rounds.length})
          </p>

          <div className="topo-diagram" role="img" aria-label="PCIe topology">
            <svg className="topo-lines" viewBox="0 0 100 100" aria-hidden>
              <line x1="50" y1="18" x2="28" y2="28" />
              <line x1="50" y1="18" x2="72" y2="28" />
              <line x1="28" y1="38" x2="28" y2="48" />
              <line x1="72" y1="38" x2="72" y2="48" />
              <line x1="28" y1="60" x2="12" y2="68" />
              <line x1="28" y1="60" x2="44" y2="68" />
              <line x1="12" y1="78" x2="12" y2="86" />
              <line x1="44" y1="78" x2="44" y2="86" />
            </svg>
            {DIAGRAM.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`topo-node kind-${n.kind}${n.id === current.highlightId ? ' highlight' : ''}`}
                style={{ left: `${n.x}%`, top: `${n.y}%` }}
                disabled={locked}
                onClick={() => {
                  if (locked) return;
                  if (n.id !== current.highlightId) return;
                }}
              >
                <strong>{n.label}</strong>
                <small>
                  {n.kind === 'root-port' ? 'RC/RP' : n.kind === 'switch-ds' ? 'SW' : 'EP'}
                </small>
              </button>
            ))}
          </div>

          <div className="bin-row topo-bins" role="group" aria-label="Node types">
            {BINS.map((b) => (
              <button
                key={b.kind}
                type="button"
                className={`bin bin-${b.kind}`}
                disabled={locked}
                onClick={() => {
                  if (locked) return;
                  if (b.kind !== current.answer) {
                    mistake(randomFail('root-vs-switch'));
                    return;
                  }
                  if (index + 1 >= rounds.length) win();
                  else setIndex((i) => i + 1);
                }}
              >
                <strong>{b.title}</strong>
                <small>{b.hint}</small>
              </button>
            ))}
          </div>
        </div>
      )}
    </GameShell>
  );
}
