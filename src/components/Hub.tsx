import { MICROGAMES } from '../data/microgames';
import type { MicrogameId } from '../types';
import { formatTime } from '../types';

interface HubProps {
  sessionTime: number;
  bestTime: number | null;
  onPlay: (id: MicrogameId) => void;
  onCampaign: () => void;
}

export function Hub({ sessionTime, bestTime, onPlay, onCampaign }: HubProps) {
  return (
    <div className="hub">
      <header className="hub-hero">
        <p className="eyebrow">Interactive PCIe drills</p>
        <h1>PCIe Microgames</h1>
        <p className="lede">
          Short, focused exercises for platform SAs and new OS/driver engineers.
          Train links, sort packets, and claim BARs — build bus intuition under
          a stopwatch. Lower total time is better.
        </p>
        <div className="hub-actions">
          <button type="button" className="primary-btn" onClick={onCampaign}>
            ▶ Play Campaign (3 games)
          </button>
          <div className="score-row">
            <span>Session time {formatTime(sessionTime)}</span>
            <span>Best time {bestTime == null ? '—' : formatTime(bestTime)}</span>
          </div>
        </div>
      </header>

      <section className="motherboard" aria-label="Motherboard hub">
        <div className="mb-pcb">
          <div className="mb-socket cpu">CPU</div>
          <div className="mb-chipset">PCH / Chipset</div>
          <div className="mb-traces" />
          <div className="mb-slot dimm a">DIMM</div>
          <div className="mb-slot dimm b">DIMM</div>
          <div className="mb-slot pcie">×16</div>
          <div className="mb-slot m2">M.2</div>

          {MICROGAMES.map((g) => (
            <button
              key={g.id}
              type="button"
              className="mb-hotspot"
              style={{ left: `${g.hubSlot.x}%`, top: `${g.hubSlot.y}%` }}
              onClick={() => onPlay(g.id)}
              title={g.title}
            >
              <span className="hotspot-pulse" />
              <span className="hotspot-label">
                <strong>{g.title}</strong>
                <small>{g.hubSlot.label}</small>
              </span>
            </button>
          ))}
        </div>
        <p className="mb-hint">Select a socket to practice one drill, or run the full campaign.</p>
      </section>

      <footer className="hub-foot">
        <span>Phase A vertical slice · Vite + React + TS · Vercel-ready</span>
        <span>Links, packets, and BARs — no CXL, no accounts.</span>
      </footer>
    </div>
  );
}
