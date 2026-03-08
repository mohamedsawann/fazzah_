import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface ScoreBoardProps {
  team1Name: string;
  team2Name: string;
  team1Score: number;
  team2Score: number;
}

export function ScoreBoard({ team1Name, team2Name, team1Score, team2Score }: ScoreBoardProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith("ar") ?? true;
  const leading = team1Score > team2Score ? 1 : team2Score > team1Score ? 2 : 0;

  return (
    <div
      className="grid grid-cols-2 gap-3 rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-900/70"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Team 1 */}
      <div
        className={cn(
          "flex flex-col items-center justify-center py-5 px-4 transition-all",
          leading === 1
            ? "bg-amber-500/15 border-b-4 border-amber-400"
            : "bg-slate-800/50"
        )}
      >
        {leading === 1 && (
          <span className="text-amber-400 text-xs font-bold mb-1 tracking-wide uppercase">
            {isArabic ? "يتصدر" : "Leading"}
          </span>
        )}
        <span className="text-sm font-semibold text-slate-400 truncate max-w-full">
          {team1Name}
        </span>
        <span
          className={cn(
            "text-5xl font-black tabular-nums mt-1",
            leading === 1 ? "text-amber-400" : "text-white"
          )}
        >
          {team1Score}
        </span>
        <span className="text-xs text-slate-500 mt-1">{isArabic ? "نقطة" : "pts"}</span>
      </div>

      {/* Team 2 */}
      <div
        className={cn(
          "flex flex-col items-center justify-center py-5 px-4 transition-all",
          leading === 2
            ? "bg-cyan-500/15 border-b-4 border-cyan-400"
            : "bg-slate-800/50"
        )}
      >
        {leading === 2 && (
          <span className="text-cyan-400 text-xs font-bold mb-1 tracking-wide uppercase">
            {isArabic ? "يتصدر" : "Leading"}
          </span>
        )}
        <span className="text-sm font-semibold text-slate-400 truncate max-w-full">
          {team2Name}
        </span>
        <span
          className={cn(
            "text-5xl font-black tabular-nums mt-1",
            leading === 2 ? "text-cyan-400" : "text-white"
          )}
        >
          {team2Score}
        </span>
        <span className="text-xs text-slate-500 mt-1">{isArabic ? "نقطة" : "pts"}</span>
      </div>
    </div>
  );
}
