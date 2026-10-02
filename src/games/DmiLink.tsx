import { useMemo, useState } from 'react';
import { GameShell } from '../components/GameShell';
import { randomFail } from '../data/failStrings';

type PathId = 'dmi' | 'peg';

interface Round {
  prompt: string;
  traffic: string;
  answer: PathId;
}

const POOL: Round[] = [
  { prompt: 'Route chipset I/O', traffic: 'USB / SATA via PCH', answer: 'dmi' },
  { prompt: 'Route graphics traffic', traffic: 'GPU framebuffer', answer: 'peg' },
  { prompt: 'Where does LPC / legacy I/O ride?', traffic: 'Chipset sideband I/O', answer: 'dmi' },
  { prompt: 'Peg the display path', traffic: 'Discrete GPU ×16', answer: 'peg' },
  { prompt: 'Chipset audio / Ethernet (onboard)', traffic: 'PCH-attached NIC', answer: 'dmi' },
  { prompt: 'High-BW endpoint on PEG slot', traffic: 'Add-in GPU', answer: 'peg' },
];

function pickRounds(n: number): Round[] {
  return [...POOL].sort(() => Math.random() - 0.5).slice(0, n);
}

interface Props {
  sessionTime: number;
  onComplete: (won: boolean, timeSeconds: number, failReason?: string) => void;
  onAbort: () => void;
}

export function DmiLink({ sessionTime, onComplete, onAbort }: Props) {
  const rounds = useMemo(() => pickRounds(4), []);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<PathId | null>(null);
  const current = rounds[index];

  return (
    <GameShell id="dmi-link" sessionTime={sessionTime} onComplete={onComplete} onAbort={onAbort}>
      {({ win, mistake, locked }) => (
        <div className="mg dmi-link">
          <p className="prompt">
            {current.prompt}: <strong>{current.traffic}</strong>. ({index + 1}/{rounds.length})
          </p>

          <div
            className={`dmi-board${picked ? ` glow-${picked}` : ''}`}
            role="img"
            aria-label="CPU DMI PCH vs PEG GPU"
          >
            <div className="dmi-cpu">
              <strong>CPU</strong>
              <small>SoC / package</small>
            </div>

            <div className="dmi-paths">
              <button
                type="button"
                className={`dmi-path path-dmi${picked === 'dmi' ? ' selected' : ''}`}
                disabled={locked}
                onClick={() => setPicked('dmi')}
                aria-pressed={picked === 'dmi'}
              >
                <span className="dmi-wire" aria-hidden />
                <strong>DMI</strong>
                <small>CPU ↔ PCH</small>
              </button>
              <button
                type="button"
                className={`dmi-path path-peg${picked === 'peg' ? ' selected' : ''}`}
                disabled={locked}
                onClick={() => setPicked('peg')}
                aria-pressed={picked === 'peg'}
              >
                <span className="dmi-wire peg-wire" aria-hidden />
                <strong>PEG ×16</strong>
                <small>CPU ↔ GPU slot</small>
              </button>
            </div>

            <div className="dmi-leaves">
              <div className={`dmi-leaf pch${picked === 'dmi' ? ' lit' : ''}`}>
                <strong>PCH</strong>
                <small>Chipset</small>
              </div>
              <div className={`dmi-leaf gpu${picked === 'peg' ? ' lit' : ''}`}>
                <strong>GPU</strong>
                <small>PEG endpoint</small>
              </div>
            </div>
          </div>

          <p className="dmi-hint" aria-hidden>
            {picked === 'dmi' && 'DMI is the proprietary-ish chipset link — not a general EP slot.'}
            {picked === 'peg' && 'PEG ×16 is a real PCIe root-port path for the GPU.'}
            {!picked && 'Tap DMI for chipset traffic · PEG for discrete GPU.'}
          </p>

          <button
            type="button"
            className="primary-btn train-btn"
            disabled={locked || picked == null}
            onClick={() => {
              if (!picked) return;
              if (picked !== current.answer) {
                mistake(randomFail('dmi-link'));
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
