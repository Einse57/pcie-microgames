import { useState, type ReactNode } from 'react';
import { CAMPAIGN_ORDER, getMeta } from '../data/microgames';
import type { MicrogameId, RoundResult } from '../types';
import { LinkTraining } from '../games/LinkTraining';
import { PacketSort } from '../games/PacketSort';
import { BarClaim } from '../games/BarClaim';

interface CampaignProps {
  sessionTime: number;
  onScore: (timeSeconds: number) => void;
  onDone: (results: RoundResult[]) => void;
  onAbort: () => void;
}

export function Campaign({ sessionTime, onScore, onDone, onAbort }: CampaignProps) {
  const [step, setStep] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const id = CAMPAIGN_ORDER[step];

  const handleComplete = (won: boolean, timeSeconds: number, failReason?: string) => {
    const nextResults = [...results, { id, won, timeSeconds, failReason }];
    setResults(nextResults);
    onScore(timeSeconds);

    if (step + 1 >= CAMPAIGN_ORDER.length) {
      window.setTimeout(() => onDone(nextResults), 200);
    } else {
      window.setTimeout(() => setStep((s) => s + 1), 200);
    }
  };

  const common = {
    sessionTime,
    onComplete: handleComplete,
    onAbort,
  };

  let game: ReactNode;
  if (id === 'link-training') game = <LinkTraining {...common} />;
  else if (id === 'packet-sort') game = <PacketSort {...common} />;
  else game = <BarClaim {...common} />;

  return (
    <div className="campaign">
      <div className="campaign-progress" aria-label="Campaign progress">
        {CAMPAIGN_ORDER.map((gid, i) => (
          <span key={gid} className={`pill${i === step ? ' active' : ''}${i < step ? ' done' : ''}`}>
            {i + 1}. {getMeta(gid as MicrogameId).title}
          </span>
        ))}
      </div>
      {game}
    </div>
  );
}
