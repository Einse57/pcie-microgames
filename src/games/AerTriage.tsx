import { useMemo, useState } from 'react';
import { GameShell } from '../components/GameShell';
import { randomFail } from '../data/failStrings';

type Severity = 'correctable' | 'nonfatal' | 'fatal';
type Action = 'log-clear' | 'advisory' | 'reset';

interface Scenario {
  title: string;
  chip: string;
  severity: Severity;
  action: Action;
}

const SEV_BINS: { id: Severity; title: string; hint: string }[] = [
  { id: 'correctable', title: 'Correctable', hint: 'log & clear' },
  { id: 'nonfatal', title: 'Non-fatal', hint: 'recoverable' },
  { id: 'fatal', title: 'Fatal', hint: 'may reset' },
];

const ACTIONS: { id: Action; title: string; hint: string }[] = [
  { id: 'log-clear', title: 'Log / clear', hint: 'soft correctable' },
  { id: 'advisory', title: 'Advisory recover', hint: 'non-fatal TLP' },
  { id: 'reset', title: 'Link / device reset', hint: 'fatal path' },
];

const POOL: Scenario[] = [
  {
    title: 'Bad TLP (poisoned / malformed) — recoverable',
    chip: 'Bad TLP',
    severity: 'nonfatal',
    action: 'advisory',
  },
  {
    title: 'Surprise link down during traffic',
    chip: 'Link Down',
    severity: 'fatal',
    action: 'reset',
  },
  {
    title: 'Receiver error / bad symbol — PHY corrected',
    chip: 'Rx Err',
    severity: 'correctable',
    action: 'log-clear',
  },
  {
    title: 'Replay timer timeout storm',
    chip: 'Replay TO',
    severity: 'correctable',
    action: 'log-clear',
  },
  {
    title: 'Uncorrectable internal error — device stuck',
    chip: 'Internal',
    severity: 'fatal',
    action: 'reset',
  },
  {
    title: 'Unsupported request (UR) on config',
    chip: 'UR',
    severity: 'nonfatal',
    action: 'advisory',
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

export function AerTriage({ sessionTime, onComplete, onAbort }: Props) {
  const rounds = useMemo(() => pickRounds(4), []);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'severity' | 'action'>('severity');
  const [pickedSev, setPickedSev] = useState<Severity | null>(null);
  const current = rounds[index];

  const knownSev = phase === 'action' ? current.severity : null;
  const meterFill =
    knownSev === 'correctable' ? 28 : knownSev === 'nonfatal' ? 62 : knownSev === 'fatal' ? 95 : 12;

  return (
    <GameShell id="aer-triage" sessionTime={sessionTime} onComplete={onComplete} onAbort={onAbort}>
      {({ win, mistake, locked }) => (
        <div className="mg aer-triage">
          <p className="prompt">
            {phase === 'severity' ? 'Bin the AER event' : 'Pick recovery'}:{' '}
            <strong>{current.title}</strong> ({index + 1}/{rounds.length})
          </p>

          <div className="aer-stage">
            <div className={`aer-chip${knownSev ? ` sev-${knownSev}` : ' sev-unknown'}`} aria-label="Error log chip">
              <strong>{current.chip}</strong>
              <small>AER log</small>
            </div>
            <div className="aer-meter" aria-hidden>
              <div className="aer-meter-track">
                <div
                  className={`aer-meter-fill${knownSev ? ` sev-${knownSev}` : ' sev-unknown'}`}
                  style={{ width: `${meterFill}%` }}
                />
              </div>
              <div className="aer-meter-labels">
                <span>Corr</span>
                <span>Non-fatal</span>
                <span>Fatal</span>
              </div>
            </div>
          </div>

          {phase === 'severity' ? (
            <div className="bin-row aer-bins" role="group" aria-label="Severity">
              {SEV_BINS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className={`bin bin-aer-${b.id}${pickedSev === b.id ? ' selected' : ''}`}
                  disabled={locked}
                  onClick={() => {
                    if (locked) return;
                    if (b.id !== current.severity) {
                      mistake(randomFail('aer-triage'));
                      return;
                    }
                    setPickedSev(b.id);
                    setPhase('action');
                  }}
                >
                  <strong>{b.title}</strong>
                  <small>{b.hint}</small>
                </button>
              ))}
            </div>
          ) : (
            <div className="bin-row aer-actions" role="group" aria-label="Recovery action">
              {ACTIONS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={`bin bin-action-${a.id}`}
                  disabled={locked}
                  onClick={() => {
                    if (locked) return;
                    if (a.id !== current.action) {
                      mistake(randomFail('aer-triage'));
                      return;
                    }
                    if (index + 1 >= rounds.length) win();
                    else {
                      setIndex((i) => i + 1);
                      setPhase('severity');
                      setPickedSev(null);
                    }
                  }}
                >
                  <strong>{a.title}</strong>
                  <small>{a.hint}</small>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </GameShell>
  );
}
