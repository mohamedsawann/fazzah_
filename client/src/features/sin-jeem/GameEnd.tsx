import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface GameEndProps {
  team1Name: string;
  team2Name: string;
  team1Score: number;
  team2Score: number;
  onPlayAgain: () => void;
}

export function GameEnd({
  team1Name,
  team2Name,
  team1Score,
  team2Score,
  onPlayAgain,
}: GameEndProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith("ar") ?? true;

  const isTie = team1Score === team2Score;
  const team1Wins = team1Score > team2Score;
  const winner = isTie ? null : team1Wins ? team1Name : team2Name;
  const winnerColor = team1Wins ? "text-amber-400" : "text-cyan-400";
  const winnerGlow = team1Wins
    ? "drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]"
    : "drop-shadow-[0_0_30px_rgba(34,211,238,0.6)]";
  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        left: `${(i * 2.5) % 100}%`,
        delay: `${(i % 10) * 0.12}s`,
        duration: `${3 + (i % 5) * 0.4}s`,
        emoji: ["🎉", "✨", "🎊", "⭐"][i % 4],
      })),
    [],
  );

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-12 space-y-8"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {!isTie && (
        <>
          <style>{`
            @keyframes sjConfettiFall {
              0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
              10% { opacity: 1; }
              100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
            }
          `}</style>
          <div className="pointer-events-none fixed inset-0 overflow-hidden">
            {confettiPieces.map((p) => (
              <span
                key={p.id}
                className="absolute text-2xl"
                style={{
                  left: p.left,
                  top: "-8vh",
                  animationName: "sjConfettiFall",
                  animationTimingFunction: "linear",
                  animationIterationCount: "infinite",
                  animationDelay: p.delay,
                  animationDuration: p.duration,
                }}
              >
                {p.emoji}
              </span>
            ))}
          </div>
        </>
      )}
      <div className="text-8xl animate-bounce">{isTie ? "🤝" : "🏆"}</div>

      <div className="space-y-3">
        <h2 className="text-slate-400 text-lg font-semibold uppercase tracking-widest">
          {isTie
            ? isArabic
              ? "تعادل!"
              : "It's a tie!"
            : isArabic
              ? "الفائز"
              : "Winner"}
        </h2>
        {winner && (
          <p className={cn("text-5xl font-black", winnerColor, winnerGlow)}>
            {winner}
          </p>
        )}
      </div>

      {/* Score cards */}
      <div className="flex gap-6 items-end justify-center">
        <div
          className={cn(
            "rounded-2xl px-8 py-5 border-2 flex flex-col items-center",
            team1Wins
              ? "bg-amber-500/20 border-amber-400"
              : isTie
                ? "bg-slate-700/50 border-slate-600"
                : "bg-slate-800/50 border-slate-700",
          )}
        >
          <span className="text-sm text-slate-400 font-semibold">
            {team1Name}
          </span>
          <span
            className={cn(
              "text-5xl font-black tabular-nums mt-1",
              team1Wins ? "text-amber-400" : "text-white",
            )}
          >
            {team1Score}
          </span>
        </div>

        <span className="text-slate-500 text-3xl font-black mb-4">VS</span>

        <div
          className={cn(
            "rounded-2xl px-8 py-5 border-2 flex flex-col items-center",
            !team1Wins && !isTie
              ? "bg-cyan-500/20 border-cyan-400"
              : isTie
                ? "bg-slate-700/50 border-slate-600"
                : "bg-slate-800/50 border-slate-700",
          )}
        >
          <span className="text-sm text-slate-400 font-semibold">
            {team2Name}
          </span>
          <span
            className={cn(
              "text-5xl font-black tabular-nums mt-1",
              !team1Wins && !isTie ? "text-cyan-400" : "text-white",
            )}
          >
            {team2Score}
          </span>
        </div>
      </div>

      <button
        onClick={onPlayAgain}
        className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-black text-xl py-4 px-12 rounded-2xl shadow-xl shadow-amber-500/30 active:scale-95 transition-all"
      >
        {t("sinJeem.playAgain")} 🎮
      </button>
    </div>
  );
}
