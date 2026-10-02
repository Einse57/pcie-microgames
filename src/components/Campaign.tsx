import { useState, type ReactNode } from 'react';
import { CAMPAIGN_ORDER, getMeta } from '../data/microgames';
import type { MicrogameId, RoundResult } from '../types';
import { LinkTraining } from '../games/LinkTraining';
import { PacketSort } from '../games/PacketSort';
import { BarClaim } from '../games/BarClaim';
import { LaneWidths } from '../games/LaneWidths';
import { Generations } from '../games/Generations';
import { ThroughputCalc } from '../games/ThroughputCalc';
import { Bifurcation } from '../games/Bifurcation';
import { TradeoffBoss } from '../games/TradeoffBoss';

interface CampaignProps {
  sessionTime: number;
  onScore: (timeSeconds: number) => void;
  onDone: (results: RoundResult[]) => void;
  onAbort: () => void;
  onClear?: (id: MicrogameId) => void;
}

function renderGame(
  id: MicrogameId,
  common: {
    sessionTime: number;
    onComplete: (won: boolean, timeSeconds: number, failReason?: string) => void;
    onAbort: () => void;
  },
): ReactNode {
  switch (id) {
    case 'link-training':
      return <LinkTraining {...common} />;
    case 'packet-sort':
      return <PacketSort {...common} />;
    case 'bar-claim':
      return <BarClaim {...common} />;
    case 'lane-widths':
      return <LaneWidths {...common} />;
    case 'generations':
      return <Generations {...common} />;
    case 'throughput-calc':
      return <ThroughputCalc {...common} />;
    case 'bifurcation':
      return <Bifurcation {...common} />;
    case 'tradeoff-boss':
      return <TradeoffBoss {...common} />;
  }
}

export function Campaign({ sessionTime, onScore, onDone, onAbort, onClear }: CampaignProps) {
  const [step, setStep] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const id = CAMPAIGN_ORDER[step];

  const handleComplete = (won: boolean, timeSeconds: number, failReason?: string) => {
    const nextResults = [...results, { id, won, timeSeconds, failReason }];
    setResults(nextResults);
    onScore(timeSeconds);
    if (won) onClear?.(id);

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

  return (
    <div className="campaign">
      <div className="campaign-progress" aria-label="Campaign progress">
        {CAMPAIGN_ORDER.map((gid, i) => (
          <span
            key={gid}
            className={`pill${i === step ? ' active' : ''}${i < step ? ' done' : ''}`}
          >
            {i + 1}. {getMeta(gid).title}
          </span>
        ))}
      </div>
      {renderGame(id, common)}
    </div>
  );
}
