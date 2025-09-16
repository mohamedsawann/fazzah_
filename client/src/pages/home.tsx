import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PlayCircle, PlusCircle, Users } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import logoImage from "@assets/Untitled_design_no_bg_1757455327542.png";
import { playSound } from "@/lib/soundUtils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation('home');
  
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
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(0 0% 12%) 0%, hsl(25 60% 20%) 25%, hsl(35 50% 25%) 50%, hsl(25 60% 20%) 75%, hsl(0 0% 12%) 100%)' }}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-2xl animate-ping" style={{ animationDuration: '4s' }}></div>
      </div>
      <div className="container mx-auto px-4 py-8 max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8 mt-8" data-testid="header-title">
          <div className="mb-3">
            <img 
              src={logoImage} 
              alt="فزه Logo" 
              className="w-80 h-80 mx-auto animate-pulse drop-shadow-lg"
              style={{ filter: 'brightness(0) saturate(100%) invert(47%) sepia(89%) saturate(6000%) hue-rotate(15deg) brightness(130%) contrast(106%)' }}
            />
          </div>
          <p className="text-2xl text-transparent bg-gradient-to-r from-accent to-primary bg-clip-text font-sans mb-1">{t('title')}</p>
          <p className="text-base text-muted-foreground font-sans">
            {t('subtitle')}
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
                  <span>{t('joinGame')}</span>
                </div>
                <p className="text-base text-primary-foreground/80">
                  {t('joinGameDesc')}
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
                  <span>{t('createGame')}</span>
                </div>
                <p className="text-base text-muted-foreground">
                  {t('createGameDesc')}
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
                  <span>{t('viewLeaderboard')}</span>
                </div>
                <p className="text-base text-muted-foreground">
                  {t('viewLeaderboardDesc')}
                </p>
              </div>
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://www.linkedin.com/in/mohammed-sawan-56ba6b251/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110"
              data-testid="linkedin-link"
            >
              <FaLinkedin className="w-5 h-5 hover:animate-bounce" />
              <span className="text-sm">LinkedIn</span>
            </a>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">
              {t('poweredBy')}
            </p>
            <p className="font-medium text-primary">
              {t('brandText')} 🧡
            </p>
            
            {visitorData && (
              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground" data-testid="visitor-count">
                <Users className="w-3 h-3" />
                <span>
                  {visitorData.count.toLocaleString()} {t('visitors')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
