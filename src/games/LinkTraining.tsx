import { useMemo, useState } from 'react';
import { GameShell } from '../components/GameShell';
import { randomFail } from '../data/failStrings';

const GENS = [
  { id: 1, label: 'Gen1', speed: '2.5 GT/s' },
  { id: 2, label: 'Gen2', speed: '5.0 GT/s' },
  { id: 3, label: 'Gen3', speed: '8.0 GT/s' },
  { id: 4, label: 'Gen4', speed: '16 GT/s' },
  { id: 5, label: 'Gen5', speed: '32 GT/s' },
] as const;

interface Props {
  score: number;
  onComplete: (won: boolean, failReason?: string) => void;
  onAbort: () => void;
}

export function LinkTraining({ score, onComplete, onAbort }: Props) {
  const target = useMemo(() => GENS[Math.floor(Math.random() * GENS.length)], []);
  const [picked, setPicked] = useState<number | null>(null);
  const [lanes, setLanes] = useState([false, false, false, false]);

  const allAligned = lanes.every(Boolean);

  return (
    <GameShell id="link-training" score={score} onComplete={onComplete} onAbort={onAbort}>
      {({ win, lose, locked }) => (
        <div className="mg link-training">
          <p className="prompt">
            Downstream advertises <strong>{target.label}</strong> ({target.speed}).
            Match Gen <em>and</em> align all 4 lanes!
          </p>

          <div className="gen-grid">
            {GENS.map((g) => (
              <button
                key={g.id}
                type="button"
                className={`gen-btn${picked === g.id ? ' selected' : ''}`}
                disabled={locked}
                onClick={() => setPicked(g.id)}
              >
                <strong>{g.label}</strong>
                <small>{g.speed}</small>
              </button>
            ))}
          </div>

          <div className="lane-row" aria-label="Lane alignment">
            {lanes.map((on, i) => (
              <button
                key={i}
                type="button"
                className={`lane${on ? ' on' : ''}`}
                disabled={locked}
                onClick={() =>
                  setLanes((prev) => {
                    const next = [...prev];
                    next[i] = !next[i];
                    return next;
                  })
                }
              >
                Lane {i}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="primary-btn train-btn"
            disabled={locked || picked === null || !allAligned}
            onClick={() => {
              if (picked === target.id && allAligned) win();
              else lose(randomFail('link-training'));
            }}
          >
            Train Link → L0
          </button>
        </div>
      )}
    </GameShell>
  );
}
