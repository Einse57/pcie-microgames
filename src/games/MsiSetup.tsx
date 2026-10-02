import { useMemo, useState } from 'react';
import { GameShell } from '../components/GameShell';
import { randomFail } from '../data/failStrings';

type IrqMode = 'intx' | 'msi' | 'msix';

interface Scenario {
  title: string;
  queues: number;
  /** Minimum mode that satisfies the need */
  minMode: IrqMode;
  /** Vectors required when MSI/MSI-X is chosen */
  needVectors: number;
}

const MODE_RANK: Record<IrqMode, number> = { intx: 0, msi: 1, msix: 2 };

const VECTOR_OPTS = [1, 2, 4, 8, 16, 32];

const POOL: Scenario[] = [
  { title: 'Simple UART — 1 IRQ line', queues: 1, minMode: 'intx', needVectors: 1 },
  { title: 'NIC with 4 RX queues', queues: 4, minMode: 'msi', needVectors: 4 },
  { title: 'NVMe with 8 I/O queues', queues: 8, minMode: 'msix', needVectors: 8 },
  { title: 'GPU with 16 event vectors', queues: 16, minMode: 'msix', needVectors: 16 },
  { title: 'Legacy HBA — shared pin OK', queues: 1, minMode: 'intx', needVectors: 1 },
  { title: 'SmartNIC 32 queue pairs', queues: 32, minMode: 'msix', needVectors: 32 },
];

function pickRounds(n: number): Scenario[] {
  return [...POOL].sort(() => Math.random() - 0.5).slice(0, n);
}

function modeOk(picked: IrqMode, min: IrqMode): boolean {
  return MODE_RANK[picked] >= MODE_RANK[min];
}

interface Props {
  sessionTime: number;
  onComplete: (won: boolean, timeSeconds: number, failReason?: string) => void;
  onAbort: () => void;
}

export function MsiSetup({ sessionTime, onComplete, onAbort }: Props) {
  const rounds = useMemo(() => pickRounds(4), []);
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<IrqMode | null>(null);
  const [vectors, setVectors] = useState<number | null>(null);
  const current = rounds[index];

  const resetPick = () => {
    setMode(null);
    setVectors(null);
  };

  return (
    <GameShell id="msi-setup" sessionTime={sessionTime} onComplete={onComplete} onAbort={onAbort}>
      {({ win, mistake, locked }) => (
        <div className="mg msi-setup">
          <p className="prompt">
            Interrupt path for <strong>{current.title}</strong> — need{' '}
            <strong>{current.queues}</strong> queue{current.queues === 1 ? '' : 's'}. ({index + 1}/
            {rounds.length})
          </p>

          <div className="irq-stage" aria-label="Interrupt path">
            <div className="irq-node device">
              <strong>Device</strong>
              <small>{current.queues}Q</small>
            </div>
            <div className={`irq-arrow${mode ? ` mode-${mode}` : ''}`} aria-hidden>
              {mode === 'intx' && 'INTx pin'}
              {mode === 'msi' && 'MSI msg'}
              {mode === 'msix' && 'MSI-X ×N'}
              {!mode && '····'}
            </div>
            <div className="irq-node cpu">
              <strong>CPU / APIC</strong>
              <small>{vectors != null ? `${vectors} vec` : 'vectors'}</small>
            </div>
          </div>

          <div className="irq-modes" role="group" aria-label="Interrupt mode">
            {(
              [
                { id: 'intx' as const, title: 'INTx', hint: 'shared pin' },
                { id: 'msi' as const, title: 'MSI', hint: 'message, few vec' },
                { id: 'msix' as const, title: 'MSI-X', hint: 'many vectors' },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                className={`irq-mode-btn${mode === m.id ? ' selected' : ''}`}
                disabled={locked}
                onClick={() => {
                  setMode(m.id);
                  if (m.id === 'intx') setVectors(1);
                  else if (vectors == null) setVectors(current.needVectors);
                }}
              >
                <strong>{m.title}</strong>
                <small>{m.hint}</small>
              </button>
            ))}
          </div>

          {mode && mode !== 'intx' && (
            <div className="vector-row" role="group" aria-label="Vector count">
              <span className="vector-label">Vectors</span>
              {VECTOR_OPTS.filter((v) => v <= 32).map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`vector-chip${vectors === v ? ' selected' : ''}`}
                  disabled={locked}
                  onClick={() => setVectors(v)}
                >
                  {v}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            className="primary-btn train-btn"
            disabled={locked || mode == null || vectors == null}
            onClick={() => {
              if (!mode || vectors == null) return;
              if (!modeOk(mode, current.minMode)) {
                mistake(randomFail('msi-setup'));
                return;
              }
              if (mode !== 'intx' && vectors < current.needVectors) {
                mistake(randomFail('msi-setup'));
                return;
              }
              if (index + 1 >= rounds.length) win();
              else {
                setIndex((i) => i + 1);
                resetPick();
              }
            }}
          >
            Enable path →
          </button>
        </div>
      )}
    </GameShell>
  );
}
