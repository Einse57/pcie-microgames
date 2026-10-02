import { useMemo, useState } from 'react';
import { GameShell } from '../components/GameShell';
import { randomFail } from '../data/failStrings';

type RouteId = 'p2p-switch' | 'bounce-host';

interface Scenario {
  title: string;
  /** true = same switch, P2P OK */
  p2pOk: boolean;
  answer: RouteId;
}

const POOL: Scenario[] = [
  {
    title: 'GPU A → GPU B (same switch, P2P on)',
    p2pOk: true,
    answer: 'p2p-switch',
  },
  {
    title: 'NIC → GPU (same switch, P2P on)',
    p2pOk: true,
    answer: 'p2p-switch',
  },
  {
    title: 'GPU A → GPU B (separate root ports, no P2P)',
    p2pOk: false,
    answer: 'bounce-host',
  },
  {
    title: 'Accel → NVMe (only via host RP, no ACS path)',
    p2pOk: false,
    answer: 'bounce-host',
  },
  {
    title: 'GPU ↔ SmartNIC under one switch (P2P allowed)',
    p2pOk: true,
    answer: 'p2p-switch',
  },
];

function pickRounds(n: number): Scenario[] {
  return [...POOL].sort(() => Math.random() - 0.5).slice(0, n);
}

interface Props {
  sessionTime: number;
  onComplete: (won: boolean, timeSeconds: number, failReason?: string) => void;
  onAbort: () => void;
}

export function P2PRoute({ sessionTime, onComplete, onAbort }: Props) {
  const rounds = useMemo(() => pickRounds(4), []);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<RouteId | null>(null);
  const current = rounds[index];

  return (
    <GameShell id="p2p-route" sessionTime={sessionTime} onComplete={onComplete} onAbort={onAbort}>
      {({ win, mistake, locked }) => (
        <div className="mg p2p-route">
          <p className="prompt">
            Route the traffic: <strong>{current.title}</strong>. ({index + 1}/{rounds.length})
          </p>

          <div
            className={`p2p-topo${current.p2pOk ? ' p2p-ok' : ' p2p-no'}${picked ? ` glow-${picked}` : ''}`}
            aria-label="Endpoint topology"
          >
            <div className="p2p-row host-row">
              <span className="p2p-chip mem">Memory</span>
              <span className="p2p-chip rc">Root</span>
            </div>
            <div className="p2p-row mid-row">
              {current.p2pOk ? (
                <span className="p2p-chip sw">Switch</span>
              ) : (
                <>
                  <span className="p2p-chip rp">RP-A</span>
                  <span className="p2p-chip rp">RP-B</span>
                </>
              )}
            </div>
            <div className="p2p-row ep-row">
              <span className="p2p-chip ep">EP-A</span>
              <span className="p2p-chip ep">EP-B</span>
            </div>
            <div className="p2p-path-hint" aria-hidden>
              {picked === 'p2p-switch' && current.p2pOk && '⟷ direct via switch'}
              {picked === 'bounce-host' && '↑ bounce via host memory'}
              {!picked && (current.p2pOk ? 'same switch fabric' : 'separate root ports')}
            </div>
          </div>

          <div className="path-choices" role="group" aria-label="Route choice">
            <button
              type="button"
              className={`path-btn${picked === 'p2p-switch' ? ' selected' : ''}`}
              disabled={locked}
              onClick={() => setPicked('p2p-switch')}
            >
              <strong>Direct P2P</strong>
              <small>via switch</small>
            </button>
            <button
              type="button"
              className={`path-btn${picked === 'bounce-host' ? ' selected' : ''}`}
              disabled={locked}
              onClick={() => setPicked('bounce-host')}
            >
              <strong>Bounce host</strong>
              <small>through memory</small>
            </button>
          </div>

          <button
            type="button"
            className="primary-btn train-btn"
            disabled={locked || picked == null}
            onClick={() => {
              if (!picked) return;
              if (picked !== current.answer) {
                mistake(randomFail('p2p-route'));
                return;
              }
              if (index + 1 >= rounds.length) win();
              else {
                setIndex((i) => i + 1);
                setPicked(null);
              }
            }}
          >
            Commit route →
          </button>
        </div>
      )}
    </GameShell>
  );
}
