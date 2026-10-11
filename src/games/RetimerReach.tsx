import { useState } from 'react';
import { GameShell } from '../components/GameShell';

type Gen = 4 | 5;

interface GenSpec {
  gts: number;
  nyquistGhz: number;
  /** Approx. end-to-end channel insertion-loss budget at Nyquist (dB) */
  budget: number;
  traceDbPerIn: number;
  connectorDb: number;
  packageDb: number;
  cardDb: number;
}

/** Commonly taught approximations — intuition, not a compliance calculator */
const GENS: Record<Gen, GenSpec> = {
  4: { gts: 16, nyquistGhz: 8, budget: 28, traceDbPerIn: 0.65, connectorDb: 1, packageDb: 4, cardDb: 5 },
  5: { gts: 32, nyquistGhz: 16, budget: 36, traceDbPerIn: 1.1, connectorDb: 1.5, packageDb: 7, cardDb: 8 },
};

const MAX_RETIMERS = 2;

interface Segment {
  name: string;
  detail: string;
  db: number;
}

interface Round {
  gen: Gen;
  segments: Segment[];
  minRetimers: number;
}

const round1 = (x: number) => Math.round(x * 10) / 10;

function buildSegments(gen: Gen): Segment[] {
  const g = GENS[gen];
  const inch = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
  const mobo = inch(6, 14);
  const riser = inch(4, 10);
  const backplane = inch(6, 16);
  const segs: Segment[] = [
    { name: 'CPU package', detail: 'die → BGA', db: g.packageDb },
    { name: 'Board trace', detail: `${mobo} in`, db: mobo * g.traceDbPerIn },
    { name: 'Riser conn.', detail: 'edge connector', db: g.connectorDb },
    { name: 'Riser trace', detail: `${riser} in`, db: riser * g.traceDbPerIn },
    { name: 'Backplane', detail: `${backplane} in`, db: backplane * g.traceDbPerIn },
    { name: 'Slot conn.', detail: 'CEM slot', db: g.connectorDb },
    { name: 'Add-in card', detail: 'card + device pkg', db: g.cardDb },
  ];
  return segs.map((s) => ({ ...s, db: round1(s.db) }));
}

/** Fewest retimers so every sub-channel fits the budget (greedy is optimal here). */
function minRetimers(segments: Segment[], budget: number): number {
  let count = 0;
  let acc = 0;
  for (const s of segments) {
    if (s.db > budget) return Infinity;
    if (round1(acc + s.db) > budget) {
      count += 1;
      acc = s.db;
    } else acc = round1(acc + s.db);
  }
  return count;
}

function makeRound(gen: Gen, allowed: number[]): Round {
  for (;;) {
    const segments = buildSegments(gen);
    const need = minRetimers(segments, GENS[gen].budget);
    if (allowed.includes(need)) return { gen, segments, minRetimers: need };
  }
}

/** Split loss into sub-channels at the chosen gaps (gap i = between segment i and i+1). */
function subChannels(segments: Segment[], gaps: Set<number>): number[] {
  const out: number[] = [];
  let acc = 0;
  segments.forEach((s, i) => {
    acc += s.db;
    if (gaps.has(i) || i === segments.length - 1) {
      out.push(round1(acc));
      acc = 0;
    }
  });
  return out;
}

interface Props {
  sessionTime: number;
  onComplete: (won: boolean, timeSeconds: number, failReason?: string) => void;
  onAbort: () => void;
}

export function RetimerReach({ sessionTime, onComplete, onAbort }: Props) {
  const [rounds] = useState<Round[]>(() => [makeRound(4, [0, 1]), makeRound(5, [1, 2])]);
  const [index, setIndex] = useState(0);
  const [gaps, setGaps] = useState<Set<number>>(() => new Set());
  const round = rounds[index];
  const g = GENS[round.gen];
  const subs = subChannels(round.segments, gaps);
  const total = round1(round.segments.reduce((a, s) => a + s.db, 0));
  const maxDb = Math.max(...round.segments.map((s) => s.db));

  return (
    <GameShell id="retimer-reach" sessionTime={sessionTime} onComplete={onComplete} onAbort={onAbort}>
      {({ win, mistake, locked }) => {
        const toggleGap = (i: number) => {
          if (locked) return;
          const next = new Set(gaps);
          if (next.has(i)) next.delete(i);
          else {
            if (next.size >= MAX_RETIMERS) {
              mistake(`PCIe allows at most ${MAX_RETIMERS} retimers in one link.`);
              return;
            }
            next.add(i);
          }
          setGaps(next);
        };
        const commit = () => {
          if (locked) return;
          const over = subs.findIndex((d) => d > g.budget);
          if (over >= 0) {
            mistake(`Sub-channel ${over + 1} is ${subs[over]} dB — over the ≈${g.budget} dB Gen${round.gen} budget. The eye closes.`);
            return;
          }
          if (gaps.size > round.minRetimers) {
            mistake(
              round.minRetimers === 0
                ? 'This link closes without a retimer — skip the extra latency, power and cost.'
                : `Overbuilt — ${round.minRetimers} retimer${round.minRetimers > 1 ? 's' : ''} can close this link.`,
            );
            return;
          }
          if (index + 1 >= rounds.length) {
            win();
            return;
          }
          setIndex(index + 1);
          setGaps(new Set());
        };

        return (
          <div className="mg retimer-reach">
            <p className="prompt">
              Close the link with the <strong>fewest retimers</strong>: every sub-channel must stay under the loss budget.
              Tap a gap to drop or remove a retimer. ({index + 1}/{rounds.length})
            </p>

            <span className="unit-key">
              Gen{round.gen} · {g.gts} GT/s · Nyquist {g.nyquistGhz} GHz · budget ≈{g.budget} dB per sub-channel · total {total} dB
            </span>

            <div className="rt-chain" role="group" aria-label="Channel segments and retimer gaps">
              <div className="rt-end rt-rc">
                <strong>Root Port</strong>
                <small>CPU</small>
              </div>
              {round.segments.map((s, i) => (
                <div key={`${index}-${i}`} className="rt-piece">
                  <div className="rt-seg" style={{ flexGrow: s.db }}>
                    <span className="rt-seg-bar" style={{ opacity: 0.35 + (0.65 * s.db) / maxDb }} aria-hidden />
                    <strong>{s.name}</strong>
                    <small>{s.detail}</small>
                    <small className="rt-db">{s.db} dB</small>
                  </div>
                  {i < round.segments.length - 1 && (
                    <button
                      type="button"
                      className={`rt-gap${gaps.has(i) ? ' on' : ''}`}
                      disabled={locked}
                      onClick={() => toggleGap(i)}
                      aria-pressed={gaps.has(i)}
                      aria-label={gaps.has(i) ? `Remove retimer after ${s.name}` : `Place retimer after ${s.name}`}
                    >
                      {gaps.has(i) ? 'RT' : '+'}
                    </button>
                  )}
                </div>
              ))}
              <div className="rt-end rt-ep">
                <strong>Endpoint</strong>
                <small>device</small>
              </div>
            </div>

            <div className="rt-meters" aria-label="Sub-channel loss">
              {subs.map((d, i) => {
                const pct = Math.min(100, (d / g.budget) * 100);
                const over = d > g.budget;
                return (
                  <div key={i} className={`rt-meter${over ? ' over' : ''}`}>
                    <small>Sub-channel {i + 1}</small>
                    <div className="rt-meter-track">
                      <span className="rt-meter-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <strong>
                      {d} / {g.budget} dB
                    </strong>
                  </div>
                );
              })}
            </div>

            <button type="button" className="primary-btn train-btn" disabled={locked} onClick={commit}>
              Train link at Gen{round.gen} →
            </button>
          </div>
        );
      }}
    </GameShell>
  );
}
