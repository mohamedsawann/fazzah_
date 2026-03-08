import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const TOTAL_SECONDS = 30;

interface TimerProps {
  running: boolean;
  onExpire: () => void;
  playTick?: () => void;
  playBuzzer?: () => void;
}

export function Timer({ running, onExpire, playTick, playBuzzer }: TimerProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith("ar") ?? true;
  const [seconds, setSeconds] = useState(TOTAL_SECONDS);
  const [lastTick, setLastTick] = useState<number | null>(null);

  useEffect(() => {
    if (!running) {
      setSeconds(TOTAL_SECONDS);
      return;
    }
    setSeconds(TOTAL_SECONDS);
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

  return (
    <div
      className="flex items-center justify-center gap-2 rounded-xl bg-amber-500/20 border-2 border-amber-500 text-amber-600 dark:text-amber-400 py-3 px-6 text-2xl font-bold"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <span aria-hidden className="text-3xl">
        ⏱
      </span>
      <span>{seconds}</span>
    </div>
  );
}
