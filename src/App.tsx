import { useEffect, useState } from 'react';
import { Hub } from './components/Hub';
import { Campaign } from './components/Campaign';
import { ResultScreen } from './components/ResultScreen';
import { LinkTraining } from './games/LinkTraining';
import { PacketSort } from './games/PacketSort';
import { BarClaim } from './games/BarClaim';
import type { MicrogameId, RoundResult, Screen } from './types';

const BEST_KEY = 'pcie-microgames-best-time';

export default function App() {
  const [screen, setScreen] = useState<Screen>('hub');
  const [sessionTime, setSessionTime] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [solo, setSolo] = useState<MicrogameId | null>(null);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [lastCampaignTotal, setLastCampaignTotal] = useState<number | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(BEST_KEY);
    if (raw == null || raw === '') return;
    const stored = Number(raw);
    if (Number.isFinite(stored) && stored > 0) setBestTime(stored);
  }, []);

  const addTime = (timeSeconds: number) =>
    setSessionTime((s) => s + timeSeconds);

  const considerBest = (campaignTotal: number) => {
    setBestTime((prev) => {
      if (prev == null || campaignTotal < prev) {
        localStorage.setItem(BEST_KEY, String(campaignTotal));
        return campaignTotal;
      }
      return prev;
    });
  };

  const finishSolo = (won: boolean, timeSeconds: number, failReason?: string) => {
    if (!solo) return;
    addTime(timeSeconds);
    setResults([{ id: solo, won, timeSeconds, failReason }]);
    setLastCampaignTotal(null);
    setScreen('result');
  };

  if (screen === 'hub') {
    return (
      <Hub
        sessionTime={sessionTime}
        bestTime={bestTime}
        onCampaign={() => {
          setResults([]);
          setLastCampaignTotal(null);
          setScreen('campaign');
        }}
        onPlay={(id) => {
          setSolo(id);
          setScreen(id);
        }}
      />
    );
  }

  if (screen === 'campaign') {
    return (
      <Campaign
        sessionTime={sessionTime}
        onScore={addTime}
        onAbort={() => setScreen('hub')}
        onDone={(r) => {
          const total = r.reduce((sum, x) => sum + x.timeSeconds, 0);
          setLastCampaignTotal(total);
          considerBest(total);
          setResults(r);
          setScreen('result');
        }}
      />
    );
  }

  if (screen === 'result') {
    return (
      <ResultScreen
        results={results}
        sessionTime={sessionTime}
        campaignTotal={lastCampaignTotal}
        bestTime={bestTime}
        onHub={() => setScreen('hub')}
        onReplay={() => {
          setResults([]);
          setLastCampaignTotal(null);
          setScreen('campaign');
        }}
      />
    );
  }

  const common = {
    sessionTime,
    onAbort: () => setScreen('hub'),
    onComplete: finishSolo,
  };

  if (screen === 'link-training') return <LinkTraining {...common} />;
  if (screen === 'packet-sort') return <PacketSort {...common} />;
  return <BarClaim {...common} />;
}
