import { useMemo, useState } from 'react';
import { GameShell } from '../components/GameShell';
import { randomFail } from '../data/failStrings';

type FormFactor = 'm2' | 'u2' | 'aic';
type Proto = 'nvme-pcie' | 'sata';
type QueueKind = 'admin' | 'io';

interface PlaceRound {
  mode: 'place';
  prompt: string;
  form: FormFactor;
  lanes: 'x4';
}

interface ProtoRound {
  mode: 'proto';
  prompt: string;
  answer: Proto;
}

interface QueueRound {
  mode: 'queue';
  prompt: string;
  chip: string;
  answer: QueueKind;
}

type Round = PlaceRound | ProtoRound | QueueRound;

const FORMS: { id: FormFactor; title: string; hint: string }[] = [
  { id: 'm2', title: 'M.2', hint: 'stick  |  x4' },
  { id: 'u2', title: 'U.2', hint: '2.5"  |  x4' },
  { id: 'aic', title: 'AIC', hint: 'HHHL card  |  x4' },
];

const PLACE_POOL: PlaceRound[] = [
  { mode: 'place', prompt: 'Seat the NVMe stick on a x4 PCIe path.', form: 'm2', lanes: 'x4' },
  { mode: 'place', prompt: 'Dock U.2 NVMe onto x4 lanes.', form: 'u2', lanes: 'x4' },
  { mode: 'place', prompt: 'Drop the AIC NVMe into an x4 root path.', form: 'aic', lanes: 'x4' },
];

const PROTO_POOL: ProtoRound[] = [
  { mode: 'proto', prompt: 'What protocol stack is NVMe on PCIe?', answer: 'nvme-pcie' },
  { mode: 'proto', prompt: 'Classify this endpoint: queues over PCIe, not AHCI.', answer: 'nvme-pcie' },
];

const QUEUE_POOL: QueueRound[] = [
  { mode: 'queue', prompt: 'Bin the queue chip.', chip: 'Admin Q', answer: 'admin' },
  { mode: 'queue', prompt: 'Bin the queue chip.', chip: 'I/O Q pair', answer: 'io' },
  { mode: 'queue', prompt: 'Bin the queue chip.', chip: 'Submission + Completion', answer: 'io' },
  { mode: 'queue', prompt: 'Bin the queue chip.', chip: 'Identify / Set Features', answer: 'admin' },
];

function pickRounds(): Round[] {
  const place = PLACE_POOL[Math.floor(Math.random() * PLACE_POOL.length)];
  const proto = PROTO_POOL[Math.floor(Math.random() * PROTO_POOL.length)];
  const queues = [...QUEUE_POOL].sort(() => Math.random() - 0.5).slice(0, 2);
  return [place, proto, ...queues];
}

interface Props {
  sessionTime: number;
  onComplete: (won: boolean, timeSeconds: number, failReason?: string) => void;
  onAbort: () => void;
}

export function NvmeMap({ sessionTime, onComplete, onAbort }: Props) {
  const rounds = useMemo(() => pickRounds(), []);
  const [index, setIndex] = useState(0);
  const [placed, setPlaced] = useState(false);
  const current = rounds[index];

  const advance = () => {
    if (index + 1 >= rounds.length) return 'win' as const;
    setIndex((i) => i + 1);
    setPlaced(false);
    return 'next' as const;
  };

  return (
    <GameShell id="nvme-map" sessionTime={sessionTime} onComplete={onComplete} onAbort={onAbort}>
      {({ win, mistake, locked }) => (
        <div className="mg nvme-map">
          <p className="prompt">
            {current.prompt} ({index + 1}/{rounds.length})
          </p>

          {current.mode === 'place' && (
            <>
              <div className="nvme-stage" aria-label="PCIe lane map">
                <div className="nvme-root">
                  <strong>Root</strong>
                  <small>x16 budget</small>
                </div>
                <div className="nvme-lanes" aria-hidden>
                  <span className="lane-block x4 live">x4</span>
                  <span className="lane-block x4 muted">x4</span>
                  <span className="lane-block x8 muted">x8</span>
                </div>
                <div className={`nvme-slot${placed ? ' seated' : ''}`}>
                  {placed ? (
                    <>
                      <strong>{FORMS.find((f) => f.id === current.form)?.title} NVMe</strong>
                      <small>PCIe EP | {current.lanes}</small>
                    </>
                  ) : (
                    <>
                      <strong>Empty x4</strong>
                      <small>drop NVMe here</small>
                    </>
                  )}
                </div>
              </div>
              <div className="nvme-forms" role="group" aria-label="Form factor">
                {FORMS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={`nvme-form form-${f.id}${placed && current.form === f.id ? ' selected' : ''}`}
                    disabled={locked || placed}
                    onClick={() => {
                      if (locked || placed) return;
                      if (f.id !== current.form) {
                        mistake(randomFail('nvme-map'));
                        return;
                      }
                      setPlaced(true);
                    }}
                  >
                    <span className={`nvme-sil sil-${f.id}`} aria-hidden />
                    <strong>{f.title}</strong>
                    <small>{f.hint}</small>
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="primary-btn train-btn"
                disabled={locked || !placed}
                onClick={() => {
                  if (!placed) return;
                  if (advance() === 'win') win();
                }}
              >Lock on x4 -></button>
            </>
          )}

          {current.mode === 'proto' && (
            <div className="nvme-proto" role="group" aria-label="Protocol">
              <button
                type="button"
                className="proto-card correct-ish"
                disabled={locked}
                onClick={() => {
                  if (locked) return;
                  if (current.answer !== 'nvme-pcie') {
                    mistake(randomFail('nvme-map'));
                    return;
                  }
                  if (advance() === 'win') win();
                }}
              >
                <div className="proto-stack" aria-hidden>
                  <span>NVMe</span>
                  <span>PCIe EP</span>
                  <span>PHY x4</span>
                </div>
                <strong>NVMe over PCIe</strong>
                <small>Endpoint + queues</small>
              </button>
              <button
                type="button"
                className="proto-card wrong-ish"
                disabled={locked}
                onClick={() => {
                  if (locked) return;
                  if (current.answer !== 'sata') {
                    mistake(randomFail('nvme-map'));
                    return;
                  }
                  if (advance() === 'win') win();
                }}
              >
                <div className="proto-stack sata" aria-hidden>
                  <span>AHCI</span>
                  <span>SATA</span>
                  <span>HBA</span>
                </div>
                <strong>SATA / AHCI</strong>
                <small>legacy disk path</small>
              </button>
            </div>
          )}

          {current.mode === 'queue' && (
            <>
              <div className="nvme-qchip" aria-label="Queue chip">
                <strong>{current.chip}</strong>
                <small>NVMe queue</small>
              </div>
              <div className="bin-row nvme-qbins" role="group" aria-label="Queue type">
                <button
                  type="button"
                  className="bin bin-admin"
                  disabled={locked}
                  onClick={() => {
                    if (locked) return;
                    if (current.answer !== 'admin') {
                      mistake(randomFail('nvme-map'));
                      return;
                    }
                    if (advance() === 'win') win();
                  }}
                >
                  <strong>Admin</strong>
                  <small>1Q control</small>
                </button>
                <button
                  type="button"
                  className="bin bin-io"
                  disabled={locked}
                  onClick={() => {
                    if (locked) return;
                    if (current.answer !== 'io') {
                      mistake(randomFail('nvme-map'));
                      return;
                    }
                    if (advance() === 'win') win();
                  }}
                >
                  <strong>I/O</strong>
                  <small>pairs | data</small>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </GameShell>
  );
}
