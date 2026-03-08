import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const TOTAL_SECONDS = 30;

interface TimerProps {
  running: boolean;
  onExpire: () => void;
  playTick?: () => void;
  playBuzzer?: () => void;
}

export function Timer({ running, onExpire, playTick, playBuzzer }: TimerProps) {
  const [seconds, setSeconds] = useState(TOTAL_SECONDS);

  // Reset when (re)started
  useEffect(() => {
    if (running) setSeconds(TOTAL_SECONDS);
  }, [running]);

  useEffect(() => {
    if (!running || seconds <= 0) return;
    const t = setInterval(() => {
      setSeconds((s) => {
        const next = s - 1;
        if (next <= 5 && next >= 1 && playTick) playTick();
        if (next === 0) {
          if (playBuzzer) playBuzzer();
          onExpire();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, onExpire, playTick, playBuzzer]);

  if (!running) return null;

  const pct = (seconds / TOTAL_SECONDS) * 100;
  const urgent = seconds <= 10;
  const critical = seconds <= 5;

  return (
    <div className="flex items-center gap-3">
      {/* Circular countdown */}
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="none" stroke="#1e293b" strokeWidth="5" />
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 28}`}
            strokeDashoffset={`${2 * Math.PI * 28 * (1 - pct / 100)}`}
            className={cn(
              "transition-all duration-1000",
              critical ? "stroke-red-500" : urgent ? "stroke-amber-400" : "stroke-emerald-400"
            )}
          />
        </svg>
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center text-xl font-black",
            critical ? "text-red-400" : urgent ? "text-amber-300" : "text-white"
          )}
        >
          {seconds}
        </span>
      </div>

      {/* Bar */}
      <div className="flex-1 h-3 rounded-full bg-slate-800 overflow-hidden max-w-xs">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000",
            critical ? "bg-red-500" : urgent ? "bg-amber-400" : "bg-emerald-400"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
