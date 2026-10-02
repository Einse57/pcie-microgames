import { useEffect, useState } from 'react';
import { Hub } from './components/Hub';
import { Campaign } from './components/Campaign';
import { ResultScreen } from './components/ResultScreen';
import { LinkTraining } from './games/LinkTraining';
import { PacketSort } from './games/PacketSort';
import { BarClaim } from './games/BarClaim';
import type { MicrogameId, RoundResult, Screen } from './types';
import './App.css';

const BEST_KEY = 'pcie-microgames-best';

export default function App() {
  const [screen, setScreen] = useState<Screen>('hub');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [solo, setSolo] = useState<MicrogameId | null>(null);
  const [results, setResults] = useState<RoundResult[]>([]);

  useEffect(() => {
    const stored = Number(localStorage.getItem(BEST_KEY) || '0');
    if (!Number.isNaN(stored)) setBest(stored);
  }, []);

  useEffect(() => {
    if (score > best) {
      setBest(score);
      localStorage.setItem(BEST_KEY, String(score));
    }
  }, [score, best]);

  const bump = (delta: number) => setScore((s) => s + delta);

  const finishSolo = (won: boolean, failReason?: string) => {
    if (!solo) return;
    bump(won ? 100 : 10);
    setResults([{ id: solo, won, failReason }]);
    setScreen('result');
  };

  if (screen === 'hub') {
    return (
      <Hub
        score={score}
        best={best}
        onCampaign={() => {
          setResults([]);
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
        score={score}
        onScore={bump}
        onAbort={() => setScreen('hub')}
        onDone={(r) => {
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
        score={score}
        onHub={() => setScreen('hub')}
        onReplay={() => {
          setResults([]);
          setScreen('campaign');
        }}
      />
    );
  }

  const common = {
    score,
    onAbort: () => setScreen('hub'),
    onComplete: finishSolo,
  };

  if (screen === 'link-training') return <LinkTraining {...common} />;
  if (screen === 'packet-sort') return <PacketSort {...common} />;
  return <BarClaim {...common} />;
}
