import { useMemo, useState } from 'react';
import { GameShell } from '../components/GameShell';
import { randomFail } from '../data/failStrings';

type HeaderType = 'type0' | 'type1';
interface TreeNode { id: string; label: string; kind: HeaderType; bdf: string; x: number; y: number; }
interface WalkRound { mode: 'walk'; prompt: string; order: string[]; }
interface ClassifyRound { mode: 'classify'; prompt: string; highlightId: string; answer: HeaderType; }
type Round = WalkRound | ClassifyRound;

const TREE: TreeNode[] = [
  { id: 'root', label: 'Root', kind: 'type1', bdf: '00:00.0', x: 50, y: 14 },
  { id: 'br', label: 'Bridge', kind: 'type1', bdf: '00:01.0', x: 50, y: 42 },
  { id: 'ep-a', label: 'NIC', kind: 'type0', bdf: '01:00.0', x: 28, y: 78 },
  { id: 'ep-b', label: 'NVMe', kind: 'type0', bdf: '01:00.1', x: 72, y: 78 },
];

const ROUND_POOL: Round[] = [
  { mode: 'walk', prompt: 'Tap nodes in enumeration order — root, then bridge, then endpoints.', order: ['root', 'br', 'ep-a', 'ep-b'] },
  { mode: 'walk', prompt: 'Walk the hierarchy: Root → Bridge → leaves.', order: ['root', 'br', 'ep-b', 'ep-a'] },
  { mode: 'classify', prompt: 'Classify the highlighted header silhouette.', highlightId: 'br', answer: 'type1' },
  { mode: 'classify', prompt: 'Classify the highlighted header silhouette.', highlightId: 'ep-a', answer: 'type0' },
  { mode: 'classify', prompt: 'Classify the highlighted header silhouette.', highlightId: 'ep-b', answer: 'type0' },
  { mode: 'classify', prompt: 'Classify the highlighted header silhouette.', highlightId: 'root', answer: 'type1' },
];

function pickRounds(n: number): Round[] {
  const walks = ROUND_POOL.filter((r) => r.mode === 'walk');
  const classifies = ROUND_POOL.filter((r) => r.mode === 'classify');
  const walk = walks[Math.floor(Math.random() * walks.length)];
  const shuffledClass = [...classifies].sort(() => Math.random() - 0.5);
  return [walk, ...shuffledClass.slice(0, n - 1)];
}

interface Props {
  sessionTime: number;
  onComplete: (won: boolean, timeSeconds: number, failReason?: string) => void;
  onAbort: () => void;
}

export function ConfigEnum({ sessionTime, onComplete, onAbort }: Props) {
  const rounds = useMemo(() => pickRounds(4), []);
  const [index, setIndex] = useState(0);
  const [walkStep, setWalkStep] = useState(0);
  const current = rounds[index];

  const advance = () => {
    if (index + 1 >= rounds.length) return 'win' as const;
    setIndex((i) => i + 1);
    setWalkStep(0);
    return 'next' as const;
  };

  return (
    <GameShell id="config-enum" sessionTime={sessionTime} onComplete={onComplete} onAbort={onAbort}>
      {({ win, mistake, locked }) => (
        <div className="mg config-enum">
          <p className="prompt">{current.prompt} ({index + 1}/{rounds.length})</p>
          <div className="bdf-legend" aria-hidden>
            <span className="bdf-chip">bus</span>
            <span className="bdf-chip">dev</span>
            <span className="bdf-chip">func</span>
            <span className="bdf-hint">BDF · Bus:Device.Function</span>
          </div>
          <div className="cfg-diagram" role="img" aria-label="PCIe config tree">
            <svg className="cfg-lines" viewBox="0 0 100 100" aria-hidden>
              <line x1="50" y1="20" x2="50" y2="36" />
              <line x1="50" y1="48" x2="28" y2="72" />
              <line x1="50" y1="48" x2="72" y2="72" />
            </svg>
            {TREE.map((n) => {
              const hi = current.mode === 'classify' && current.highlightId === n.id;
              const walked = current.mode === 'walk' && current.order.slice(0, walkStep).includes(n.id);
              const next = current.mode === 'walk' && current.order[walkStep] === n.id;
              return (
                <button
                  key={n.id}
                  type="button"
                  className={`cfg-node kind-${n.kind}${hi ? ' highlight' : ''}${walked ? ' walked' : ''}${next ? ' next' : ''}`}
                  style={{ left: `${n.x}%`, top: `${n.y}%` }}
                  disabled={locked || current.mode === 'classify'}
                  onClick={() => {
                    if (locked || current.mode !== 'walk') return;
                    if (n.id !== current.order[walkStep]) { mistake(randomFail('config-enum')); return; }
                    const nextStep = walkStep + 1;
                    if (nextStep >= current.order.length) { if (advance() === 'win') win(); }
                    else setWalkStep(nextStep);
                  }}
                >
                  <strong>{n.label}</strong>
                  <small>{n.bdf}</small>
                  <span className="cfg-type-tag">{n.kind === 'type1' ? 'T1' : 'T0'}</span>
                </button>
              );
            })}
          </div>
          {current.mode === 'classify' && (
            <div className="header-silhouettes" role="group" aria-label="Header type">
              <button type="button" className="silhouette type0" disabled={locked} onClick={() => {
                if (locked) return;
                if (current.answer !== 'type0') { mistake(randomFail('config-enum')); return; }
                if (advance() === 'win') win();
              }}>
                <div className="sil-bars type0-bars" aria-hidden><span /><span /><span /></div>
                <strong>Type 0</strong>
                <small>Endpoint header</small>
              </button>
              <button type="button" className="silhouette type1" disabled={locked} onClick={() => {
                if (locked) return;
                if (current.answer !== 'type1') { mistake(randomFail('config-enum')); return; }
                if (advance() === 'win') win();
              }}>
                <div className="sil-bars type1-bars" aria-hidden><span /><span /><span /><span /></div>
                <strong>Type 1</strong>
                <small>Bridge / root port</small>
              </button>
            </div>
          )}
          {current.mode === 'walk' && (
            <p className="cfg-walk-status">
              Next: <strong>{TREE.find((t) => t.id === current.order[walkStep])?.label ?? '—'}</strong>
              {' · '}{walkStep}/{current.order.length} visited
            </p>
          )}
        </div>
      )}
    </GameShell>
  );
}
