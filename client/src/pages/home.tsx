import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PlayCircle, PlusCircle, Users } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { playSound } from "@/lib/soundUtils";
import { StickersBackground } from "@/components/stickers-background";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith("ar") ?? false;

  // Track visitor when component mounts
  const trackVisitorMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/visitors/track", { method: "POST" });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate visitor count query to show updated count
      queryClient.invalidateQueries({ queryKey: ["/api/visitors/count"] });
    },
  });

  // Get visitor count
  const { data: visitorData } = useQuery({
    queryKey: ["/api/visitors/count"],
    refetchOnMount: true,
  });

  useEffect(() => {
    // Track visitor only once when page loads
    trackVisitorMutation.mutate();
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Subtle overlay for content readability */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm z-[1]"></div>
      <StickersBackground />
      {/* Developer credit - left side */}
      <div className="fixed bottom-4 left-4 flex flex-col gap-1 text-xs text-primary font-bold z-10 bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2">
        <span>{t("home.developedBy")} Mohamed Sawan & Nawal Fadi 🧡</span>
        <a
          href="https://www.linkedin.com/in/mohammed-sawan-56ba6b251/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors"
          data-testid="linkedin-link"
        >
          <FaLinkedin className="w-3.5 h-3.5" />
          <span>LinkedIn</span>
        </a>
      </div>
      {/* Visitor count - right side */}
      {visitorData &&
        typeof visitorData === "object" &&
        "count" in visitorData && (
          <div
            className="fixed bottom-4 right-4 flex items-center gap-2 text-xs text-primary font-bold z-10 bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2"
            data-testid="visitor-count"
          >
            <Users className="w-3 h-3" />
            <span>
              {(visitorData as { count: number }).count.toLocaleString()}{" "}
              {t("home.visitors")}
            </span>
          </div>
        )}
      <div className="container mx-auto px-4 py-4 max-w-md relative z-10">
        {/* Header */}
        <div
          className={`text-center mt-2 ${isArabic ? "mb-2" : "mb-1"}`}
          data-testid="header-title"
        >
          <div className="flex flex-col items-center gap-0 mb-0 leading-none [&_img]:block">
            {!isArabic && (
              <div className="relative inline-block mt-0">
                <img
                  src="/fazzah-english.png"
                  alt="Fazzah"
                  className="w-56 h-auto object-contain"
                />
                <img
                  src="/star.png"
                  alt=""
                  className="absolute top-[32%] left-[8%] w-7 h-7 object-contain animate-star-letters pointer-events-none"
                />
                <img
                  src="/two-strokes-sticker.png"
                  alt=""
                  className="absolute top-16 -left-2 w-6 h-6 object-contain pointer-events-none glow-neon-orange"
                  aria-hidden
                />
                <img
                  src="/three-strokes-sticker.png"
                  alt=""
                  className="absolute bottom-0 right-0 -translate-y-16 w-8 h-8 object-contain pointer-events-none glow-neon-orange"
                  aria-hidden
                />
              </div>
            )}
            {isArabic && (
              <div className="relative inline-block mt-20">
                <img
                  src="/fazzah-arabic.png"
                  alt="فزة"
                  className="w-24 h-auto object-contain"
                />
                <img
                  src="/star-arabic.png"
                  alt=""
                  className="absolute -top-2 right-10 w-6 h-6 object-contain animate-star-arabic pointer-events-none"
                />
                <img
                  src="/three-strokes-sticker.png"
                  alt=""
                  className="absolute top-16 -right-2 w-8 h-8 object-contain pointer-events-none glow-neon-orange"
                  aria-hidden
                />
                <img
                  src="/two-strokes-sticker.png"
                  alt=""
                  className="absolute bottom-0 left-0 -translate-y-16 w-6 h-6 object-contain pointer-events-none glow-neon-orange"
                  aria-hidden
                />
              </div>
            )}
          </div>
          <p
            className={`text-2xl text-transparent bg-gradient-to-r from-accent to-primary bg-clip-text font-sans mb-0 ${!isArabic ? "-mt-12" : ""} font-bold`}
          >
            {t("common.appName")}
          </p>
          <div
            className={`w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] flex justify-center ${isArabic ? "mt-10" : ""}`}
          >
            <p
              className={`text-base text-primary mt-0 whitespace-pre-line text-center max-w-2xl px-4 font-bold`}
              style={{
                fontFamily: isArabic
                  ? "Cairo, sans-serif"
                  : "Nunito, sans-serif",
              }}
            >
              {t("home.title")}
            </p>
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="space-y-4 mb-6">
          <Link href="/join-game">
            <Button
              onClick={playSound.buttonClick}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-6 px-8 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-[1.02] hover:-rotate-1 text-xl h-auto"
              data-testid="button-join-game"
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-3">
                  <PlayCircle
                    className="w-7 h-7 animate-spin"
                    style={{ animationDuration: "3s" }}
                  />
                  <span className="font-bold">{t("home.joinGame.title")}</span>
                </div>
                <p className={`text-base text-primary-foreground/80 font-bold`}>
                  {t("home.joinGame.subtitle")}
                </p>
              </div>
            </Button>
          </Link>

          <Link href="/create-game">
            <Button
              onClick={playSound.buttonClick}
              variant="secondary"
              className="w-full bg-amber-500 hover:bg-amber-600 border border-amber-400 text-white font-medium py-6 px-8 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all duration-300 transform hover:scale-[1.02] hover:rotate-1 text-xl h-auto"
              data-testid="button-create-game"
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-3">
                  <PlusCircle className="w-7 h-7 animate-pulse" />
                  <span className="font-bold">
                    {t("home.createGame.title")}
                  </span>
                </div>
                <p className={`text-base text-primary font-bold`}>
                  {t("home.createGame.subtitle")}
                </p>
              </div>
            </Button>
          </Link>

          <Link href="/view-leaderboard">
            <Button
              onClick={playSound.buttonClick}
              variant="outline"
              className="w-full bg-slate-600 hover:bg-slate-700 border border-slate-500 text-white font-medium py-6 px-8 rounded-xl shadow-lg shadow-slate-600/20 hover:shadow-slate-600/40 transition-all duration-300 transform hover:scale-[1.02] hover:-rotate-1 text-xl h-auto"
              data-testid="button-view-leaderboard"
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
                <p className={`text-base text-primary font-bold`}>
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
