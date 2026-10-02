import { useMemo, useState } from 'react';
import { GameShell } from '../components/GameShell';
import { randomFail } from '../data/failStrings';
import type { LaneWidth } from '../data/pcieBandwidth';
import { LANE_WIDTHS } from '../data/pcieBandwidth';

interface DeviceRound {
  name: string;
  icon: string;
  hint: string;
  answer: LaneWidth;
}

const POOL: DeviceRound[] = [
  { name: 'NVMe', icon: '💾', hint: 'M.2', answer: 4 },
  { name: 'GPU', icon: '🎮', hint: 'PEG', answer: 16 },
  { name: 'NIC', icon: '🌐', hint: '1 GbE', answer: 1 },
  { name: 'HBA', icon: '📀', hint: 'RAID', answer: 8 },
  { name: 'Wi-Fi', icon: '📶', hint: 'Key E', answer: 1 },
  { name: 'USB4', icon: '⚡', hint: 'host', answer: 4 },
  { name: 'Accel', icon: '🧮', hint: 'mezz', answer: 8 },
  { name: '2nd GPU', icon: '🖥️', hint: '×16@×8', answer: 8 },
];

function pickRounds(n: number): DeviceRound[] {
  return [...POOL].sort(() => Math.random() - 0.5).slice(0, n);
}

interface Props {
  sessionTime: number;
  onComplete: (won: boolean, timeSeconds: number, failReason?: string) => void;
  onAbort: () => void;
}

export function LaneWidths({ sessionTime, onComplete, onAbort }: Props) {
  const rounds = useMemo(() => pickRounds(4), []);
  const [index, setIndex] = useState(0);
  const [flash, setFlash] = useState<LaneWidth | null>(null);
  const current = rounds[index];

  return (
    <GameShell id="lane-widths" sessionTime={sessionTime} onComplete={onComplete} onAbort={onAbort}>
      {({ win, mistake, locked }) => (
        <div className="mg lane-widths">
          <p className="prompt">
            Fill the slot for <strong>{current.name}</strong>. ({index + 1}/{rounds.length})
          </p>

          <div className="slot-stage">
            <div className="device-chip" aria-label={current.name}>
              <span className="device-icon" aria-hidden>
                {current.icon}
              </span>
              <strong>{current.name}</strong>
              <small>{current.hint}</small>
            </div>

            <div className="pcie-edge" aria-hidden>
              <div className="edge-key" />
              <div className="gold-fingers">
                {Array.from({ length: 16 }, (_, i) => (
                  <span
                    key={i}
                    className={`finger${flash != null && i < flash ? ' lit' : ''}${
                      flash === current.answer && i < flash ? ' match' : ''
                    }`}
                  />
                ))}
              </div>
              <small className="edge-label">×16 edge</small>
            </div>
          </div>

          <div className="width-silhouettes" role="group" aria-label="Link widths">
            {LANE_WIDTHS.map((w) => (
              <button
                key={w}
                type="button"
                className={`sil-btn${flash === w ? ' selected' : ''}`}
                disabled={locked}
                onClick={() => {
                  if (locked) return;
                  setFlash(w);
                  if (w !== current.answer) {
                    mistake(randomFail('lane-widths'));
                    window.setTimeout(() => setFlash(null), 280);
                    return;
                  }
                  if (index + 1 >= rounds.length) win();
                  else {
                    window.setTimeout(() => {
                      setIndex((i) => i + 1);
                      setFlash(null);
                    }, 220);
                  }
                }}
              >
                <span className="sil-ticks" aria-hidden>
                  {Array.from({ length: 16 }, (_, i) => (
                    <i key={i} className={i < w ? 'on' : ''} />
                  ))}
                </span>
                <strong>×{w}</strong>
              </button>
            ))}
          </div>
        </div>
      )}
    </GameShell>
  );
}
