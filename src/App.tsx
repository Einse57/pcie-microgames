import { useEffect, useState } from 'react';
import { Hub } from './components/Hub';
import { Campaign } from './components/Campaign';
import { ResultScreen } from './components/ResultScreen';
import { LinkTraining } from './games/LinkTraining';
import { PacketSort } from './games/PacketSort';
import { BarClaim } from './games/BarClaim';
import { LaneWidths } from './games/LaneWidths';
import { Generations } from './games/Generations';
import { ThroughputCalc } from './games/ThroughputCalc';
import { Bifurcation } from './games/Bifurcation';
import { TradeoffBoss } from './games/TradeoffBoss';
import { RootVsSwitch } from './games/RootVsSwitch';
import { DmaPath } from './games/DmaPath';
import { P2PRoute } from './games/P2PRoute';
import { ConfigEnum } from './games/ConfigEnum';
import { MsiSetup } from './games/MsiSetup';
import { AerTriage } from './games/AerTriage';
import { loadCleared, markCleared } from './data/progress';
import type { MicrogameId, RoundResult, Screen } from './types';

const BEST_KEY = 'pcie-microgames-best-time';

export default function App() {
  const [screen, setScreen] = useState<Screen>('hub');
  const [sessionTime, setSessionTime] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [solo, setSolo] = useState<MicrogameId | null>(null);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [lastCampaignTotal, setLastCampaignTotal] = useState<number | null>(null);
  const [cleared, setCleared] = useState<Set<MicrogameId>>(() => new Set());

  useEffect(() => {
    setCleared(loadCleared());
    const raw = localStorage.getItem(BEST_KEY);
    if (raw == null || raw === '') return;
    const stored = Number(raw);
    if (Number.isFinite(stored) && stored > 0) setBestTime(stored);
  }, []);

  const addTime = (timeSeconds: number) =>
    setSessionTime((s) => s + timeSeconds);

  const noteClear = (id: MicrogameId) => {
    setCleared(markCleared(id));
  };

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
    if (won) noteClear(solo);
    setResults([{ id: solo, won, timeSeconds, failReason }]);
    setLastCampaignTotal(null);
    setScreen('result');
  };

  if (screen === 'hub') {
    return (
      <Hub
        sessionTime={sessionTime}
        bestTime={bestTime}
        cleared={cleared}
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
        onClear={noteClear}
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
  if (screen === 'bar-claim') return <BarClaim {...common} />;
  if (screen === 'lane-widths') return <LaneWidths {...common} />;
  if (screen === 'generations') return <Generations {...common} />;
  if (screen === 'throughput-calc') return <ThroughputCalc {...common} />;
  if (screen === 'bifurcation') return <Bifurcation {...common} />;
  if (screen === 'tradeoff-boss') return <TradeoffBoss {...common} />;
  if (screen === 'root-vs-switch') return <RootVsSwitch {...common} />;
  if (screen === 'dma-path') return <DmaPath {...common} />;
  if (screen === 'p2p-route') return <P2PRoute {...common} />;
  if (screen === 'config-enum') return <ConfigEnum {...common} />;
  if (screen === 'msi-setup') return <MsiSetup {...common} />;
  return <AerTriage {...common} />;
}
