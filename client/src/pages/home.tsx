import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Gamepad2, Users } from "lucide-react";
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

  useEffect(() => {
    document.title = `${t("common.appName")} — ${t("common.tagline")}`;
  }, [t, i18n.language]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Subtle overlay for content readability */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm z-[1]"></div>
      <StickersBackground />
      {/* Developer credit - left side */}
      <div className="fixed bottom-4 left-4 flex flex-col gap-1 text-xs text-primary font-bold z-10 bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2">
        <span>{t("home.developedBy")} Mohamed Sawan 🧡</span>
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
      <div className="container mx-auto px-4 py-4 pb-28 md:pb-4 max-w-md relative z-10">
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
          <p className="text-sm md:text-base text-primary/80 font-medium mt-1">
            {t("common.tagline")}
          </p>
          <div className={`h-2 ${isArabic ? "mt-10" : ""}`} />
        </div>

        {/* Main Action Buttons */}
        <div className="space-y-4 mb-6">
          <Link href="/sin-jeem">
            <Button
              onClick={playSound.buttonClick}
              variant="outline"
              className="w-full relative overflow-hidden bg-emerald-600 hover:bg-emerald-700 border border-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all duration-300 transform hover:scale-[1.02] hover:-rotate-1 h-auto py-7 px-6"
              data-testid="button-sin-jeem"
            >
              <div className="absolute -top-4 -right-3 text-6xl opacity-20 pointer-events-none">
                🎯
              </div>
              <div className="absolute -bottom-4 -left-3 text-5xl opacity-20 pointer-events-none">
                ⭐
              </div>
              <div className="relative flex flex-col items-center text-center gap-2 w-full">
                <div className="flex items-center gap-3">
                  <span className="text-3xl" aria-hidden>
                    🎯
                  </span>
                  <span className="font-black text-2xl">
                    {t("home.sinJeem.title")}
                  </span>
                </div>
                <p className="text-base text-white/90 font-semibold">
                  {t("home.sinJeem.subtitle")}
                </p>
              </div>
            </Button>
          </Link>

          <Link href="/quiz-game">
            <Button
              onClick={playSound.buttonClick}
              variant="outline"
              className="w-full relative overflow-hidden bg-orange-500 hover:bg-orange-600 border border-orange-400 text-white rounded-2xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-[1.02] hover:rotate-1 h-auto py-7 px-6"
              data-testid="button-quiz-hub"
            >
              <div className="absolute -top-4 -right-2 text-6xl opacity-20 pointer-events-none">
                🏆
              </div>
              <div className="absolute -bottom-4 -left-2 text-5xl opacity-20 pointer-events-none">
                🎮
              </div>
              <div className="relative flex flex-col items-center text-center gap-2 w-full">
                <div className="flex items-center gap-3">
                  <Gamepad2 className="w-8 h-8" />
                  <span className="font-black text-2xl">
                    {isArabic ? "لعبة الكويز" : "Quiz Game"}
                  </span>
                </div>
                <p className="text-base text-white/90 font-semibold">
                  {isArabic
                    ? "انضم، أنشئ لعبة، وشاهد لوحة المتصدرين"
                    : "Join, create game, and view leaderboard"}
                </p>
              </div>
            </Button>
          </Link>

          <div className="flex justify-center pt-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-sm text-primary text-sm font-bold animate-pulse">
              <span className="text-base" aria-hidden>
                ✨
              </span>
              <span>{isArabic ? "اختر وضع اللعب" : "Choose your mode"}</span>
              <span className="text-base" aria-hidden>
                🎮
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
