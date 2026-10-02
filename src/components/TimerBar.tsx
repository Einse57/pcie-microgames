interface TimerBarProps {
  /** Elapsed seconds (counts up; lower is better) */
  elapsed: number;
  /** Soft reference duration for the fill bar (not a fail limit) */
  par: number;
}

export function TimerBar({ elapsed, par }: TimerBarProps) {
  const pct = Math.min(100, (elapsed / Math.max(par, 0.1)) * 100);
  const over = elapsed > par;
  return (
    <div className="timer-wrap" aria-label={`Elapsed ${elapsed.toFixed(1)} seconds`}>
      <div className="timer-label">{elapsed.toFixed(1)}s</div>
      <div className="timer-track">
        <div
          className={`timer-fill${over ? ' over' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
