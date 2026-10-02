import type { ChapterId, MicrogameId } from '../types';
import { CHAPTERS, gamesInChapter } from '../data/microgames';
import { chapterUnlocked } from '../data/progress';

export interface ChapterAnchor {
  chapter: ChapterId;
  label: string;
  x: number;
  y: number;
  hint: string;
}

/** One readable anchor per chapter — diagrammatic map, not a hotspot pile. */
export const CHAPTER_ANCHORS: ChapterAnchor[] = [
  { chapter: 'fundamentals', label: 'Fundamentals', x: 22, y: 28, hint: 'CPU link' },
  { chapter: 'bandwidth', label: 'Bandwidth', x: 42, y: 82, hint: '×16 slot' },
  { chapter: 'topology', label: 'Topology', x: 58, y: 52, hint: 'bifur lanes' },
  { chapter: 'tradeoffs', label: 'Tradeoffs', x: 86, y: 24, hint: 'SA desk' },
  { chapter: 'fabric', label: 'Fabric', x: 18, y: 58, hint: 'switch' },
];

interface MotherboardProps {
  cleared: Set<MicrogameId>;
  onPlay: (id: MicrogameId) => void;
  onFocusChapter?: (chapter: ChapterId) => void;
}

function firstPlayable(chapter: ChapterId, cleared: Set<MicrogameId>): MicrogameId | null {
  const games = gamesInChapter(chapter);
  const next = games.find((g) => !cleared.has(g.id));
  return (next ?? games[0])?.id ?? null;
}

export function Motherboard({ cleared, onPlay, onFocusChapter }: MotherboardProps) {
  return (
    <section className="motherboard" aria-label="Motherboard diagram">
      <div className="mb-pcb">
        <svg
          className="mb-svg"
          viewBox="0 0 640 360"
          role="img"
          aria-label="PCIe motherboard layout with CPU, PCH, DIMMs, ×16 slot, M.2, and lane traces"
        >
          <defs>
            <linearGradient id="mbGold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f6d77a" />
              <stop offset="55%" stopColor="#c9a227" />
              <stop offset="100%" stopColor="#8a7018" />
            </linearGradient>
            <linearGradient id="mbMetal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2a3a4e" />
              <stop offset="100%" stopColor="#121a26" />
            </linearGradient>
            <linearGradient id="mbCpu" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0b1220" />
            </linearGradient>
            <filter id="mbGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* PCB silk / mounting holes */}
          <rect x="8" y="8" width="624" height="344" rx="14" fill="none" stroke="rgba(26,92,69,0.9)" strokeWidth="3" />
          {[
            [24, 24],
            [616, 24],
            [24, 336],
            [616, 336],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="6" fill="#0a1f18" stroke="rgba(155,176,201,0.35)" strokeWidth="1.5" />
          ))}

          {/* Thick PCIe lane traces — few, readable */}
          <g className="mb-lane-traces" fill="none" strokeLinecap="round" filter="url(#mbGlow)">
            {/* CPU → ×16 (primary PEG) */}
            <path
              d="M168 175 L168 248 L120 248 L120 290"
              stroke="rgba(94,234,212,0.55)"
              strokeWidth="5"
            />
            <path
              d="M178 175 L178 242 L280 242 L280 290"
              stroke="rgba(94,234,212,0.4)"
              strokeWidth="4"
            />
            {/* Bifurcation fan from ×16 root */}
            <path
              d="M300 290 L300 220 L360 220 L360 200"
              stroke="rgba(167,139,250,0.55)"
              strokeWidth="4"
            />
            <path
              d="M320 290 L320 236 L400 236 L400 200"
              stroke="rgba(167,139,250,0.4)"
              strokeWidth="3.5"
            />
            {/* CPU → PCH DMI */}
            <path
              d="M210 150 L280 150 L280 175"
              stroke="rgba(251,191,36,0.45)"
              strokeWidth="4"
            />
            {/* PCH → M.2 */}
            <path
              d="M340 195 L460 195 L460 278"
              stroke="rgba(56,189,248,0.45)"
              strokeWidth="3.5"
            />
            {/* CPU → switch fabric spur */}
            <path
              d="M120 150 L80 150 L80 200"
              stroke="rgba(244,114,182,0.4)"
              strokeWidth="3.5"
            />
          </g>

          {/* DIMM sticks */}
          <g className="mb-dimms">
            {[0, 1].map((i) => {
              const x = 470 + i * 36;
              return (
                <g key={i} transform={`translate(${x} 48)`}>
                  <rect width="28" height="118" rx="3" fill="url(#mbMetal)" stroke="rgba(155,176,201,0.45)" strokeWidth="1.5" />
                  <rect x="4" y="8" width="20" height="14" rx="1" fill="#0ea5e9" opacity="0.85" />
                  <rect x="6" y="30" width="16" height="70" rx="1" fill="rgba(56,189,248,0.15)" stroke="rgba(56,189,248,0.35)" />
                  {/* gold edge fingers */}
                  {Array.from({ length: 10 }, (_, j) => (
                    <rect key={j} x="2" y={108 + j * 1.1} width="24" height="0.9" fill="url(#mbGold)" />
                  ))}
                  <text x="14" y="-6" textAnchor="middle" fill="rgba(232,241,255,0.65)" fontSize="9" fontFamily="system-ui,sans-serif">
                    DIMM
                  </text>
                </g>
              );
            })}
          </g>

          {/* CPU socket — LGA silhouette */}
          <g className="mb-cpu" transform="translate(95 95)">
            <rect width="100" height="100" rx="6" fill="url(#mbCpu)" stroke="rgba(251,191,36,0.75)" strokeWidth="2.5" strokeDasharray="6 3" />
            <rect x="10" y="10" width="80" height="80" rx="3" fill="#0f172a" stroke="rgba(251,191,36,0.35)" />
            {/* pin grid hint */}
            {Array.from({ length: 6 }, (_, row) =>
              Array.from({ length: 6 }, (_, col) => (
                <circle
                  key={`${row}-${col}`}
                  cx={18 + col * 12}
                  cy={18 + row * 12}
                  r="1.6"
                  fill="rgba(251,191,36,0.35)"
                />
              )),
            )}
            <rect x="28" y="28" width="44" height="44" rx="2" fill="#1e293b" stroke="rgba(251,191,36,0.55)" />
            <text x="50" y="54" textAnchor="middle" fill="#fbbf24" fontSize="13" fontWeight="800" fontFamily="system-ui,sans-serif">
              CPU
            </text>
          </g>

          {/* PCH / chipset */}
          <g className="mb-pch" transform="translate(275 165)">
            <rect width="70" height="48" rx="4" fill="#151c2c" stroke="rgba(167,139,250,0.65)" strokeWidth="1.8" />
            <rect x="8" y="8" width="54" height="32" rx="2" fill="#0b1220" />
            <text x="35" y="28" textAnchor="middle" fill="#a78bfa" fontSize="11" fontWeight="700" fontFamily="system-ui,sans-serif">
              PCH
            </text>
          </g>

          {/* Switch chip (fabric) */}
          <g className="mb-switch" transform="translate(52 195)">
            <rect width="52" height="52" rx="4" fill="#151c2c" stroke="rgba(244,114,182,0.6)" strokeWidth="1.8" />
            <path d="M12 26 H40 M26 12 V40" stroke="rgba(244,114,182,0.7)" strokeWidth="2" />
            <circle cx="26" cy="26" r="6" fill="rgba(244,114,182,0.25)" stroke="rgba(244,114,182,0.8)" />
            <text x="26" y="48" textAnchor="middle" fill="rgba(244,114,182,0.85)" fontSize="8" fontFamily="system-ui,sans-serif">
              SW
            </text>
          </g>

          {/* ×16 GPU / PEG slot with gold fingers */}
          <g className="mb-pcie16" transform="translate(95 292)">
            <rect width="280" height="28" rx="3" fill="#0a1018" stroke="rgba(94,234,212,0.45)" strokeWidth="1.5" />
            {/* retention clip */}
            <rect x="-10" y="4" width="10" height="20" rx="2" fill="#334155" stroke="rgba(155,176,201,0.4)" />
            {/* gold fingers */}
            {Array.from({ length: 48 }, (_, i) => (
              <rect key={i} x={8 + i * 5.5} y="6" width="3.5" height="16" rx="0.5" fill="url(#mbGold)" />
            ))}
            <text x="140" y="-6" textAnchor="middle" fill="rgba(94,234,212,0.9)" fontSize="11" fontWeight="700" fontFamily="system-ui,sans-serif">
              PCIe ×16
            </text>
          </g>

          {/* M.2 slot */}
          <g className="mb-m2" transform="translate(430 278)">
            <rect width="120" height="18" rx="2" fill="#0a1018" stroke="rgba(56,189,248,0.5)" strokeWidth="1.4" />
            {Array.from({ length: 18 }, (_, i) => (
              <rect key={i} x={6 + i * 6} y="4" width="3.5" height="10" rx="0.4" fill="url(#mbGold)" />
            ))}
            {/* Key notch */}
            <rect x="52" y="2" width="8" height="14" fill="#0f3d2e" />
            <text x="60" y="-6" textAnchor="middle" fill="rgba(56,189,248,0.9)" fontSize="10" fontWeight="700" fontFamily="system-ui,sans-serif">
              M.2
            </text>
          </g>

          {/* Silk labels */}
          <text x="320" y="34" textAnchor="middle" fill="rgba(232,241,255,0.35)" fontSize="10" letterSpacing="0.18em" fontFamily="system-ui,sans-serif">
            PLATFORM MAP · DIAGRAM ONLY
          </text>
        </svg>

        {CHAPTER_ANCHORS.map((a) => {
          const unlocked = chapterUnlocked(a.chapter, cleared);
          const games = gamesInChapter(a.chapter);
          const done = games.every((g) => cleared.has(g.id));
          const ch = CHAPTERS.find((c) => c.id === a.chapter)!;
          const playId = firstPlayable(a.chapter, cleared);

          return (
            <button
              key={a.chapter}
              type="button"
              className={`mb-anchor${unlocked ? '' : ' locked'}${done ? ' cleared' : ''}`}
              style={{ left: `${a.x}%`, top: `${a.y}%` }}
              disabled={!unlocked || !playId}
              title={unlocked ? `${ch.title} — ${a.hint}` : 'Clear the previous chapter first'}
              onClick={() => {
                if (!unlocked || !playId) return;
                onFocusChapter?.(a.chapter);
                onPlay(playId);
              }}
            >
              <span className="mb-anchor-dot" />
              <span className="mb-anchor-label">
                <strong>{a.label}</strong>
                <small>{unlocked ? (done ? 'Complete' : a.hint) : 'Locked'}</small>
              </span>
            </button>
          );
        })}
      </div>
      <p className="mb-caption">Platform map — chapter markers jump to the first open drill. Use the cards above to browse every game.</p>
    </section>
  );
}
