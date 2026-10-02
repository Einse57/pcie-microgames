interface TimerBarProps {
  seconds: number;
  remaining: number;
}

export function TimerBar({ seconds, remaining }: TimerBarProps) {
  const pct = Math.max(0, (remaining / seconds) * 100);
  const urgent = remaining <= 1.5;
  return (
    <div className="timer-wrap" aria-label={`Time left ${remaining.toFixed(1)} seconds`}>
      <div className="timer-label">{remaining.toFixed(1)}s</div>
      <div className="timer-track">
        <div
          className={`timer-fill${urgent ? ' urgent' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
