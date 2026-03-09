import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle, PlusCircle, Users } from "lucide-react";
import { playSound } from "@/lib/soundUtils";
import { useTranslation } from "react-i18next";
import { StickersBackground } from "@/components/stickers-background";

export default function QuizGameHub() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith("ar") ?? false;

  return (
    <div
      className="min-h-screen relative overflow-hidden text-white p-4"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm z-[1]"></div>
      <StickersBackground />
      <div className="max-w-md mx-auto space-y-6">
        <div className="relative z-10 flex items-center justify-between bg-white/90 backdrop-blur-sm border border-primary/20 rounded-xl px-2 py-1.5 shadow-sm">
          <Link href="/">
            <Button
              variant="ghost"
              className="text-slate-900 hover:bg-slate-900/10 font-bold"
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              {t("common.back")}
            </Button>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 px-2">
            {isArabic ? "لعبة الكويز" : "Quiz Game"}
          </h1>
        </div>

        <div className="relative z-10 space-y-4">
          <Link href="/join-game">
            <Button
              onClick={playSound.buttonClick}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-6 px-8 rounded-xl shadow-lg shadow-orange-500/30 transition-all duration-300 text-xl h-auto"
              data-testid="button-quiz-join-game"
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-3">
                  <PlayCircle
                    className="w-7 h-7 animate-spin"
                    style={{ animationDuration: "3s" }}
                  />
                  <span className="font-bold">{t("home.joinGame.title")}</span>
                </div>
                <p className="text-base text-primary-foreground/80 font-bold">
                  {t("home.joinGame.subtitle")}
                </p>
              </div>
            </Button>
          </Link>

          <Link href="/create-game">
            <Button
              onClick={playSound.buttonClick}
              variant="secondary"
              className="w-full bg-amber-500 hover:bg-amber-600 border border-amber-400 text-white font-medium py-6 px-8 rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-300 text-xl h-auto"
              data-testid="button-quiz-create-game"
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-3">
                  <PlusCircle className="w-7 h-7 animate-pulse" />
                  <span className="font-bold">
                    {t("home.createGame.title")}
                  </span>
                </div>
                <p className="text-base text-primary font-bold">
                  {t("home.createGame.subtitle")}
                </p>
              </div>
            </Button>
          </Link>

          <Link href="/view-leaderboard">
            <Button
              onClick={playSound.buttonClick}
              variant="outline"
              className="w-full bg-slate-600 hover:bg-slate-700 border border-slate-500 text-white font-medium py-6 px-8 rounded-xl shadow-lg shadow-slate-600/20 transition-all duration-300 text-xl h-auto"
              data-testid="button-quiz-view-leaderboard"
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-3">
                  <Users
                    className="w-7 h-7 animate-bounce"
                    style={{ animationDuration: "2s" }}
                  />
                  <span className="font-bold">
                    {t("home.viewLeaderboard.title")}
                  </span>
                </div>
                <p className="text-base text-primary font-bold">
                  {t("home.viewLeaderboard.subtitle")}
                </p>
              </div>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
