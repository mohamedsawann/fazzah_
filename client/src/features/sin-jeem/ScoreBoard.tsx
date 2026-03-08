import { useTranslation } from "react-i18next";

interface ScoreBoardProps {
  team1Name: string;
  team2Name: string;
  team1Score: number;
  team2Score: number;
}

export function ScoreBoard({
  team1Name,
  team2Name,
  team1Score,
  team2Score,
}: ScoreBoardProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith("ar") ?? true;

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 rounded-xl bg-slate-800/90 text-white px-6 py-4 shadow-xl border-2 border-amber-500/50"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="flex items-center gap-3">
        <span className="font-bold text-lg">{team1Name}:</span>
        <span className="text-2xl font-black text-amber-400 tabular-nums">
          {team1Score}
        </span>
        <span className="text-sm opacity-90">{isArabic ? "نقطة" : "pts"}</span>
      </div>
      <span className="text-slate-400 font-bold">–</span>
      <div className="flex items-center gap-3">
        <span className="font-bold text-lg">{team2Name}:</span>
        <span className="text-2xl font-black text-amber-400 tabular-nums">
          {team2Score}
        </span>
        <span className="text-sm opacity-90">{isArabic ? "نقطة" : "pts"}</span>
      </div>
    </div>
  );
}
