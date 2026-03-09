import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface ScoreBoardProps {
  team1Name: string;
  team2Name: string;
  team1Score: number;
  team2Score: number;
  team1Avatar: string;
  team2Avatar: string;
  currentTurn: "team1" | "team2";
  team1PowerUps: { double: boolean; skip: boolean };
  team2PowerUps: { double: boolean; skip: boolean };
  onUseDouble: () => void;
  onUseSkip: () => void;
}

export function ScoreBoard({
  team1Name,
  team2Name,
  team1Score,
  team2Score,
  team1Avatar,
  team2Avatar,
  currentTurn,
  team1PowerUps,
  team2PowerUps,
  onUseDouble,
  onUseSkip,
}: ScoreBoardProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith("ar") ?? true;
  const leading = team1Score > team2Score ? 1 : team2Score > team1Score ? 2 : 0;

  return (
    <div className="space-y-3" dir={isArabic ? "rtl" : "ltr"}>
      <div className="grid grid-cols-2 gap-3 rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-900/70">
        {/* Team 1 */}
        <div
          className={cn(
            "flex flex-col items-center justify-center py-5 px-4 transition-all",
            currentTurn === "team1" && "ring-2 ring-amber-300",
            leading === 1
              ? "bg-amber-500/15 border-b-4 border-amber-400"
              : "bg-slate-800/50",
          )}
        >
          {leading === 1 && (
            <span className="text-amber-400 text-xs font-bold mb-1 tracking-wide uppercase">
              {isArabic ? "يتصدر" : "Leading"}
            </span>
          )}
          <span className="text-sm font-semibold text-slate-400 truncate max-w-full">
            {team1Avatar} {team1Name}
          </span>
          <span
            className={cn(
              "text-5xl font-black tabular-nums mt-1",
              leading === 1 ? "text-amber-400" : "text-white",
            )}
          >
            {team1Score}
          </span>
          <span className="text-xs text-slate-500 mt-1">
            {isArabic ? "نقطة" : "pts"}
          </span>
        </div>

        {/* Team 2 */}
        <div
          className={cn(
            "flex flex-col items-center justify-center py-5 px-4 transition-all",
            currentTurn === "team2" && "ring-2 ring-cyan-300",
            leading === 2
              ? "bg-cyan-500/15 border-b-4 border-cyan-400"
              : "bg-slate-800/50",
          )}
        >
          {leading === 2 && (
            <span className="text-cyan-400 text-xs font-bold mb-1 tracking-wide uppercase">
              {isArabic ? "يتصدر" : "Leading"}
            </span>
          )}
          <span className="text-sm font-semibold text-slate-400 truncate max-w-full">
            {team2Avatar} {team2Name}
          </span>
          <span
            className={cn(
              "text-5xl font-black tabular-nums mt-1",
              leading === 2 ? "text-cyan-400" : "text-white",
            )}
          >
            {team2Score}
          </span>
          <span className="text-xs text-slate-500 mt-1">
            {isArabic ? "نقطة" : "pts"}
          </span>
        </div>
      </div>

      <div className="rounded-xl bg-slate-900/70 border border-slate-700/60 p-3">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>
            {isArabic ? "القوة الخاصة للفريق الحالي" : "Current team power-ups"}
          </span>
          <span className="font-bold text-white">
            {currentTurn === "team1"
              ? `${team1Avatar} ${team1Name}`
              : `${team2Avatar} ${team2Name}`}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onUseDouble}
            disabled={
              !(currentTurn === "team1"
                ? team1PowerUps.double
                : team2PowerUps.double)
            }
            className="rounded-lg bg-amber-500/20 hover:bg-amber-500/35 disabled:opacity-40 disabled:cursor-not-allowed border border-amber-400/40 px-3 py-2 text-sm font-bold text-amber-200 transition"
          >
            ⭐ {isArabic ? "دبل السؤال القادم" : "Double Next"}
          </button>
          <button
            onClick={onUseSkip}
            disabled={
              !(currentTurn === "team1"
                ? team1PowerUps.skip
                : team2PowerUps.skip)
            }
            className="rounded-lg bg-cyan-500/20 hover:bg-cyan-500/35 disabled:opacity-40 disabled:cursor-not-allowed border border-cyan-400/40 px-3 py-2 text-sm font-bold text-cyan-200 transition"
          >
            ⏭️ {isArabic ? "تخطي الدور" : "Skip Turn"}
          </button>
        </div>
      </div>
    </div>
  );
}
