import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PlayCircle, PlusCircle, Users } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import logoImage from "@assets/e884b9cb-4af4-47f0-b6bc-69c2b1482d3c_1758492259936.png";
import { playSound } from "@/lib/soundUtils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();

  // Track visitor when component mounts
  const trackVisitorMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/visitors/track', { method: 'POST' });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate visitor count query to show updated count
      queryClient.invalidateQueries({ queryKey: ['/api/visitors/count'] });
    }
  });

  // Get visitor count
  const { data: visitorData } = useQuery({
    queryKey: ['/api/visitors/count'],
    refetchOnMount: true,
  });

  useEffect(() => {
    // Track visitor only once when page loads
    trackVisitorMutation.mutate();
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Subtle overlay for content readability */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm"></div>
      <div className="container mx-auto px-4 py-4 max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8 mt-2" data-testid="header-title">
          <div className="mb-3">
            <img
              src={logoImage}
              alt="فزه Logo"
              className="w-96 h-96 mx-auto drop-shadow-lg object-cover animate-logo-crazy"
            />
          </div>
          <p className="text-2xl text-transparent bg-gradient-to-r from-accent to-primary bg-clip-text font-sans mb-1">{t('common.appName')}</p>
          <p className="text-base text-primary font-sans">
            {t('home.title')}
          </p>
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
                  <PlayCircle className="w-7 h-7 animate-spin" style={{ animationDuration: '3s' }} />
                  <span>{t('home.joinGame.title')}</span>
                </div>
                <p className="text-base text-primary-foreground/80">
                  {t('home.joinGame.subtitle')}
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
                  <span>{t('home.createGame.title')}</span>
                </div>
                <p className="text-base text-primary">
                  {t('home.createGame.subtitle')}
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
                  <Users className="w-7 h-7 animate-bounce" style={{ animationDuration: '2s' }} />
                  <span>{t('home.viewLeaderboard.title')}</span>
                </div>
                <p className="text-base text-primary">
                  {t('home.viewLeaderboard.subtitle')}
                </p>
              </div>
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center space-y-3 bg-black/25 backdrop-blur-sm rounded-2xl px-6 py-4">
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://www.linkedin.com/in/mohammed-sawan-56ba6b251/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white hover:text-white/80 transition-all duration-300 hover:scale-110"
              data-testid="linkedin-link"
            >
              <FaLinkedin className="w-5 h-5 hover:animate-bounce" />
              <span className="text-sm">LinkedIn</span>
            </a>
          </div>

          <div className="text-center">
            <p className="text-sm text-white/80 mb-1">
              {t('home.developedBy')}
            </p>
            <p className="font-medium text-white">
              Mohamed Sawan 🧡
            </p>

            {visitorData && typeof visitorData === 'object' && 'count' in visitorData && (
              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-white/70" data-testid="visitor-count">
                <Users className="w-3 h-3" />
                <span>
                  {(visitorData as { count: number }).count.toLocaleString()} {t('home.visitors')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
