import { useMemo, useState } from 'react';
import { GameShell } from '../components/GameShell';
import { randomFail } from '../data/failStrings';
import type { LaneWidth } from '../data/pcieBandwidth';
import { LANE_WIDTHS } from '../data/pcieBandwidth';

interface Scenario {
  prompt: string;
  detail: string;
  answer: LaneWidth;
}

const POOL: Scenario[] = [
  {
    prompt: 'NVMe M.2 SSD (typical client)',
    detail: 'M.2 2280 socket silk often implies four PCIe lanes.',
    answer: 4,
  },
  {
    prompt: 'Discrete GPU — motherboard silk: PEG',
    detail: 'Primary graphics (PEG) slots are usually full ×16.',
    answer: 16,
  },
  {
    prompt: '1 GbE copper NIC (single-port)',
    detail: 'A simple GbE endpoint often trains as a single lane.',
    answer: 1,
  },
  {
    prompt: 'Slot edge silk printed “×8” (open-ended)',
    detail: 'Board routes eight lanes even if the connector is longer.',
    answer: 8,
  },
  {
    prompt: 'Hardware RAID / HBA mezzanine',
    detail: 'Storage HBAs commonly sit in an ×8 slot.',
    answer: 8,
  },
  {
    prompt: 'USB4 / Thunderbolt host controller',
    detail: 'Host controllers in this class are typically ×4 links.',
    answer: 4,
  },
  {
    prompt: 'Wi-Fi / Bluetooth M.2 Key E (legacy feel)',
    detail: 'Low-bandwidth connectivity often uses a single lane.',
    answer: 1,
  },
  {
    prompt: 'Secondary GPU / accelerator — silk “×16 @ ×8”',
    detail: 'Electrically ×8 even if the mechanical slot looks longer.',
    answer: 8,
  },
];

function pickScenarios(n: number): Scenario[] {
  return [...POOL].sort(() => Math.random() - 0.5).slice(0, n);
}

interface Props {
  sessionTime: number;
  onComplete: (won: boolean, timeSeconds: number, failReason?: string) => void;
  onAbort: () => void;
}

export function LaneWidths({ sessionTime, onComplete, onAbort }: Props) {
  const rounds = useMemo(() => pickScenarios(4), []);
  const [index, setIndex] = useState(0);
  const current = rounds[index];

  return (
    <GameShell id="lane-widths" sessionTime={sessionTime} onComplete={onComplete} onAbort={onAbort}>
      {({ win, mistake, locked }) => (
        <div className="mg lane-widths">
          <p className="prompt">
            Select the link width for this device or slot. ({index + 1}/{rounds.length})
          </p>
          <div className="scenario-card">
            <span className="packet-chip">DEVICE / SILK</span>
            <h2>{current.prompt}</h2>
            <p className="scenario-detail">{current.detail}</p>
          </div>
          <div className="width-grid">
            {LANE_WIDTHS.map((w) => (
              <button
                key={w}
                type="button"
                className="width-btn"
                disabled={locked}
                onClick={() => {
                  if (locked) return;
                  if (w !== current.answer) {
                    mistake(randomFail('lane-widths'));
                    return;
                  }
                  if (index + 1 >= rounds.length) win();
                  else setIndex((i) => i + 1);
                }}
              >
                <strong>×{w}</strong>
                <small>{w === 1 ? '1 lane' : `${w} lanes`}</small>
              </button>
            ))}
          </div>
        </div>
      )}
    </GameShell>
  );
}
