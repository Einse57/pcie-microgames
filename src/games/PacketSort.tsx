import { useMemo, useState } from 'react';
import { GameShell } from '../components/GameShell';
import { randomFail } from '../data/failStrings';

type PacketKind = 'TLP' | 'DLLP' | 'OS';

interface Packet {
  id: string;
  name: string;
  kind: PacketKind;
}

const POOL: Omit<Packet, 'id'>[] = [
  { name: 'Memory Write', kind: 'TLP' },
  { name: 'Cfg Read', kind: 'TLP' },
  { name: 'Completion', kind: 'TLP' },
  { name: 'Msg / Interrupt', kind: 'TLP' },
  { name: 'ACK', kind: 'DLLP' },
  { name: 'NAK', kind: 'DLLP' },
  { name: 'InitFC1', kind: 'DLLP' },
  { name: 'UpdateFC', kind: 'DLLP' },
  { name: 'TS1 Ordered Set', kind: 'OS' },
  { name: 'TS2 Ordered Set', kind: 'OS' },
  { name: 'SKP', kind: 'OS' },
  { name: 'EIEOS', kind: 'OS' },
];

const BINS: { kind: PacketKind; title: string; hint: string }[] = [
  { kind: 'TLP', title: 'TLP', hint: 'Transaction' },
  { kind: 'DLLP', title: 'DLLP', hint: 'Data Link' },
  { kind: 'OS', title: 'Ordered Set', hint: 'Physical' },
];

function pickPackets(n: number): Packet[] {
  const shuffled = [...POOL].sort(() => Math.random() - 0.5).slice(0, n);
  return shuffled.map((p, i) => ({ ...p, id: `${p.name}-${i}` }));
}

interface Props {
  score: number;
  onComplete: (won: boolean, failReason?: string) => void;
  onAbort: () => void;
}

export function PacketSort({ score, onComplete, onAbort }: Props) {
  const packets = useMemo(() => pickPackets(4), []);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const current = packets[index];

  return (
    <GameShell id="packet-sort" score={score} onComplete={onComplete} onAbort={onAbort}>
      {({ win, lose, locked }) => (
        <div className="mg packet-sort">
          <p className="prompt">
            Sort the packet into the right layer bin. ({index + 1}/{packets.length})
          </p>

          <div className="packet-card" key={current?.id}>
            <span className="packet-chip">INCOMING</span>
            <h2>{current?.name}</h2>
          </div>

          <div className="bin-row">
            {BINS.map((b) => (
              <button
                key={b.kind}
                type="button"
                className={`bin bin-${b.kind.toLowerCase()}`}
                disabled={locked || !current}
                onClick={() => {
                  if (!current || locked) return;
                  const ok = current.kind === b.kind;
                  const nextCorrect = correct + (ok ? 1 : 0);
                  if (!ok) {
                    lose(randomFail('packet-sort'));
                    return;
                  }
                  setCorrect(nextCorrect);
                  if (index + 1 >= packets.length) {
                    win();
                  } else {
                    setIndex((i) => i + 1);
                  }
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
