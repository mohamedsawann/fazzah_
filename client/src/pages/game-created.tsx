import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useSearch, useLocation } from "wouter";
import { Copy, Share2, Play, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { playSound } from "@/lib/soundUtils";
import { StickersBackground } from "@/components/stickers-background";

interface Game {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  isActive: boolean;
}

export default function GameCreated() {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const params = new URLSearchParams(search);
  const gameId = params.get("gameId");

  const { data: game, isLoading } = useQuery<Game>({
    queryKey: ["/api/games", gameId],
    enabled: !!gameId,
  });

  const { t } = useTranslation();

  const copyGameCode = async () => {
    if (game?.code) {
      try {
        await navigator.clipboard.writeText(game.code);
        toast({
          title: t('gameCreated.copied'),
          description: t('gameCreated.copySuccess'),
        });
      } catch (error) {
        toast({
          title: t('gameCreated.title'),
          description: t('gameCreated.copyError'),
          variant: "destructive",
        });
      }
    }
  };

  const shareGame = async () => {
    if (game?.code && navigator.share) {
      try {
        await navigator.share({
          title: `${t('gameCreated.shareTitle')} ${game.name}`,
          text: `${t('gameCreated.shareText')} ${game.code}`,
          url: window.location.origin,
        });
      } catch (error) {
        copyGameCode();
      }
    } else {
      copyGameCode();
    }
  };

  const startGame = () => {
    setLocation(`/registration?gameId=${gameId}&mode=create`);
  };

  if (isLoading || !game) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center trivia-background">
        <StickersBackground transparent />
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-[1]"></div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary">{t('gameCreated.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden trivia-background">
      <StickersBackground transparent />
      {/* Subtle overlay for content readability */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-[1]"></div>
      <div className="container mx-auto px-4 py-8 max-w-md relative z-10">
        <div className="text-center mb-8" data-testid="header-game-created">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold font-arabic text-primary mb-2">
            {t('gameCreated.title')}
          </h2>
          <p className="text-primary">{t('gameCreated.subtitle')}</p>
        </div>

        {/* Game Info */}
        <Card className="border-2 border-orange-400 shadow-lg mb-6 bg-orange-500/25">
          <CardContent className="p-6">
            <div className="text-center" data-testid="game-info">
              <h3 className="text-xl font-medium mb-4" data-testid="game-name">
                {game.name}
              </h3>

              <div className="bg-white/70 border-2 border-black rounded-xl p-6 mb-6">
                <p className="text-sm text-primary mb-2">
                  {t('gameCreated.gameCode')}
                </p>
                <div className="text-4xl font-bold font-mono text-primary mb-4" data-testid="game-code">
                  {game.code}
                </div>
                <p className="text-sm text-primary">
                  {t('gameCreated.shareCode')}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    playSound.buttonClick();
                    copyGameCode();
                  }}
                  variant="outline"
                  className="flex-1 bg-white/70 hover:bg-white/90 border-2 border-black text-card-foreground"
                  data-testid="button-copy-code"
                >
                  <Copy className="w-4 h-4 rtl:ml-2 ltr:mr-2" />
                  {t('gameCreated.copyCode')}
                </Button>

                <Button
                  onClick={() => {
                    playSound.buttonClick();
                    shareGame();
                  }}
                  variant="outline"
                  className="flex-1 bg-white/70 hover:bg-white/90 border-2 border-black text-card-foreground"
                  data-testid="button-share-code"
                >
                  <Share2 className="w-4 h-4 rtl:ml-2 ltr:mr-2" />
                  {t('gameCreated.share')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={() => {
              playSound.buttonClick();
              startGame();
            }}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-4 px-6 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-[1.02]"
            data-testid="button-start-playing"
          >
            <Play className="w-5 h-5 rtl:ml-2 ltr:mr-2" />
            {t('gameCreated.startGame')}
          </Button>

          <Link href={`/leaderboard-view?gameId=${gameId}`}>
            <Button
              onClick={playSound.buttonClick}
              variant="outline"
              className="w-full bg-amber-500 hover:bg-amber-600 border border-amber-400 text-white font-medium py-3 px-6 rounded-lg shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all duration-300 transform hover:scale-[1.02]"
              data-testid="button-view-leaderboard"
            >
              <BarChart3 className="w-5 h-5 rtl:ml-2 ltr:mr-2" />
              {t('gameCreated.viewLeaderboard')}
            </Button>
          </Link>

          <Link href="/">
            <Button
              onClick={playSound.buttonClick}
              variant="outline"
              className="w-full bg-card border border-primary/30 hover:bg-muted text-card-foreground font-medium py-3 px-6 rounded-lg shadow-lg transition-all duration-300"
              data-testid="button-home"
            >
              {t('gameCreated.home')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}