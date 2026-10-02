import { useState, type ReactNode } from 'react';
import { CAMPAIGN_ORDER, getMeta } from '../data/microgames';
import type { MicrogameId, RoundResult } from '../types';
import { LinkTraining } from '../games/LinkTraining';
import { PacketSort } from '../games/PacketSort';
import { BarClaim } from '../games/BarClaim';

interface CampaignProps {
  score: number;
  onScore: (delta: number) => void;
  onDone: (results: RoundResult[]) => void;
  onAbort: () => void;
}

export function Campaign({ score, onScore, onDone, onAbort }: CampaignProps) {
  const [step, setStep] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const id = CAMPAIGN_ORDER[step];

  const handleComplete = (won: boolean, failReason?: string) => {
    const nextResults = [...results, { id, won, failReason }];
    setResults(nextResults);
    if (won) onScore(100);
    else onScore(10);

    if (step + 1 >= CAMPAIGN_ORDER.length) {
      window.setTimeout(() => onDone(nextResults), 200);
    } else {
      window.setTimeout(() => setStep((s) => s + 1), 200);
    }
  };

  const common = {
    score,
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
