import { useMemo, useState } from 'react';
import { GameShell } from '../components/GameShell';
import { randomFail } from '../data/failStrings';

type CxlType = 'type1' | 'type2' | 'type3';
type ProtoLane = 'io' | 'cache' | 'mem';

interface MatchRound {
  mode: 'match';
  prompt: string;
  device: string;
  sil: CxlType;
  answer: CxlType;
}

interface ProtoRound {
  mode: 'proto';
  prompt: string;
  chip: string;
  answer: ProtoLane;
}

type Round = MatchRound | ProtoRound;

const TYPES: { id: CxlType; title: string; hint: string }[] = [
  { id: 'type1', title: 'Type 1', hint: 'accel + cache' },
  { id: 'type2', title: 'Type 2', hint: 'cache + memory' },
  { id: 'type3', title: 'Type 3', hint: 'memory expander' },
];

const MATCH_POOL: MatchRound[] = [
  {
    mode: 'match',
    prompt: 'Match the device silhouette to a CXL Type.',
    device: 'Accelerator (cache coherent)',
    sil: 'type1',
    answer: 'type1',
  },
  {
    mode: 'match',
    prompt: 'Match the device silhouette to a CXL Type.',
    device: 'GPU-like accel with HBM',
    sil: 'type2',
    answer: 'type2',
  },
  {
    mode: 'match',
    prompt: 'Match the device silhouette to a CXL Type.',
    device: 'Memory expander / buffer',
    sil: 'type3',
    answer: 'type3',
  },
  {
    mode: 'match',
    prompt: 'Match the device silhouette to a CXL Type.',
    device: 'Smart NIC accel (cache only)',
    sil: 'type1',
    answer: 'type1',
  },
  {
    mode: 'match',
    prompt: 'Match the device silhouette to a CXL Type.',
    device: 'CXL DRAM puddle',
    sil: 'type3',
    answer: 'type3',
  },
];

const PROTO_POOL: ProtoRound[] = [
  { mode: 'proto', prompt: 'Bin the CXL protocol lane.', chip: 'Config / MMIO / DMA', answer: 'io' },
  { mode: 'proto', prompt: 'Bin the CXL protocol lane.', chip: 'Cache snoops / coherency', answer: 'cache' },
  { mode: 'proto', prompt: 'Bin the CXL protocol lane.', chip: 'Memory load / store', answer: 'mem' },
  { mode: 'proto', prompt: 'Bin the CXL protocol lane.', chip: 'PCIe-like transactions', answer: 'io' },
  { mode: 'proto', prompt: 'Bin the CXL protocol lane.', chip: 'Host cache agent traffic', answer: 'cache' },
  { mode: 'proto', prompt: 'Bin the CXL protocol lane.', chip: 'Expanded DRAM access', answer: 'mem' },
];

function pickRounds(): Round[] {
  const matches = [...MATCH_POOL].sort(() => Math.random() - 0.5).slice(0, 3);
  const proto = PROTO_POOL[Math.floor(Math.random() * PROTO_POOL.length)];
  return [...matches, proto];
}

interface Props {
  sessionTime: number;
  onComplete: (won: boolean, timeSeconds: number, failReason?: string) => void;
  onAbort: () => void;
}

export function CxlType({ sessionTime, onComplete, onAbort }: Props) {
  const rounds = useMemo(() => pickRounds(), []);
  const [index, setIndex] = useState(0);
  const current = rounds[index];

  const advance = () => {
    if (index + 1 >= rounds.length) return 'win' as const;
    setIndex((i) => i + 1);
    return 'next' as const;
  };

  return (
    <GameShell id="cxl-type" sessionTime={sessionTime} onComplete={onComplete} onAbort={onAbort}>
      {({ win, mistake, locked }) => (
        <div className="mg cxl-type">
          <p className="prompt">
            {current.prompt}{' '}
            {current.mode === 'match' ? (
              <strong>{current.device}</strong>
            ) : (
              <strong>{current.chip}</strong>
            )}{' '}
            ({index + 1}/{rounds.length})
          </p>

          {current.mode === 'match' && (
            <>
              <div className="cxl-stage" aria-label="CXL device silhouette">
                <div className={`cxl-sil sil-${current.sil}`} aria-hidden>
                  <span className="cxl-body" />
                  <span className="cxl-badge">
                    {current.sil === 'type1' && 'Accel'}
                    {current.sil === 'type2' && 'Accel+Mem'}
                    {current.sil === 'type3' && 'Memory'}
                  </span>
                </div>
                <p className="cxl-phy-note">CXL rides a PCIe PHY · Types differ by cache/mem roles</p>
              </div>
              <div className="bin-row cxl-type-bins" role="group" aria-label="CXL Types">
                {TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`bin bin-cxl-${t.id}`}
                    disabled={locked}
                    onClick={() => {
                      if (locked) return;
                      if (t.id !== current.answer) {
                        mistake(randomFail('cxl-type'));
                        return;
                      }
                      if (advance() === 'win') win();
                    }}
                  >
                    <strong>{t.title}</strong>
                    <small>{t.hint}</small>
                  </button>
                ))}
              </div>
            </>
          )}

          {current.mode === 'proto' && (
            <>
              <div className="cxl-proto-chip" aria-label="Protocol chip">
                <strong>{current.chip}</strong>
                <small>CXL protocol</small>
              </div>
              <div className="bin-row cxl-proto-bins" role="group" aria-label="CXL protocols">
                <button
                  type="button"
                  className="bin bin-cxl-io"
                  disabled={locked}
                  onClick={() => {
                    if (locked) return;
                    if (current.answer !== 'io') {
                      mistake(randomFail('cxl-type'));
                      return;
                    }
                    if (advance() === 'win') win();
                  }}
                >
                  <strong>CXL.io</strong>
                  <small>PCIe-like I/O</small>
                </button>
                <button
                  type="button"
                  className="bin bin-cxl-cache"
                  disabled={locked}
                  onClick={() => {
                    if (locked) return;
                    if (current.answer !== 'cache') {
                      mistake(randomFail('cxl-type'));
                      return;
                    }
                    if (advance() === 'win') win();
                  }}
                >
                  <strong>CXL.cache</strong>
                  <small>coherency</small>
                </button>
                <button
                  type="button"
                  className="bin bin-cxl-mem"
                  disabled={locked}
                  onClick={() => {
                    if (locked) return;
                    if (current.answer !== 'mem') {
                      mistake(randomFail('cxl-type'));
                      return;
                    }
                    if (advance() === 'win') win();
                  }}
                >
                  <strong>CXL.mem</strong>
                  <small>memory</small>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </GameShell>
  );
}
