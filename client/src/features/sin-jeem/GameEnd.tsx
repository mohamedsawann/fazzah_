import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

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
  const winner =
    team1Score > team2Score
      ? team1Name
      : team2Score > team1Score
        ? team2Name
        : null;

  return (
    <div
      className="max-w-md mx-auto text-center space-y-6 py-8"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <h2 className="text-3xl font-black text-amber-500">
        🏆 {t("sinJeem.winnerTitle")}
      </h2>
      <p className="text-2xl font-bold text-white animate-pulse">
        {winner ?? t("sinJeem.tie")}
      </p>
      <p className="text-lg text-muted-foreground">
        {team1Name}: {team1Score} — {team2Name}: {team2Score}
      </p>
      <Button size="lg" className="text-lg" onClick={onPlayAgain}>
        {t("sinJeem.playAgain")}
      </Button>
    </div>
  );
}
