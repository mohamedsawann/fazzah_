import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { playSound } from "@/lib/soundUtils";

export default function ViewLeaderboard() {
  const { t, i18n } = useTranslation();
  const [gameCode, setGameCode] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isRTL = i18n.dir() === 'rtl';

  const validateGameMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("GET", `/api/games/code/${code}`);
      return response.json();
    },
    onSuccess: (game) => {
      setLocation(`/leaderboard-view?gameId=${game.id}`);
    },
    onError: () => {
      toast({
        title: t('viewLeaderboard.error'),
        description: t('viewLeaderboard.invalidCode'),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameCode.length !== 6) {
      toast({
        title: t('viewLeaderboard.error'),
        description: t('viewLeaderboard.invalidCode'),
        variant: "destructive",
      });
      return;
    }
    validateGameMutation.mutate(gameCode.toUpperCase());
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Subtle overlay for content readability */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-sm"></div>
      <div className="container mx-auto px-4 py-8 max-w-md relative z-10">
        <div className="mb-6">
          <Link href="/">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors p-0"
              data-testid="button-back"
            >
              <div className="flex items-center">
                {isRTL ? <ArrowRight className="w-5 h-5 ml-2" /> : <ArrowLeft className="w-5 h-5 mr-2" />}
                <span>{t('viewLeaderboard.back')}</span>
              </div>
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8" data-testid="header-view-leaderboard">
          <h2 className="text-3xl font-bold font-arabic text-primary mb-2 animate-pulse">
            {t('viewLeaderboard.title')}
          </h2>
          <p className="text-primary">{t('viewLeaderboard.subtitle')}</p>
        </div>

        <Card className="border border-primary/30 shadow-lg shadow-primary/20 bg-gradient-to-br from-card to-primary/5 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02]">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="gameCode" className="block text-sm font-medium mb-2">
                  {t('viewLeaderboard.gameCode')}
                </Label>
                <Input
                  id="gameCode"
                  type="text"
                  placeholder={t('viewLeaderboard.enterGameCode')}
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                  className="w-full bg-muted border border-primary/30 rounded-lg px-4 py-3 text-center text-2xl font-bold focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  maxLength={6}
                  data-testid="input-game-code"
                />
              </div>
              <Button
                type="submit"
                disabled={validateGameMutation.isPending || gameCode.length !== 6}
                onClick={playSound.buttonClick}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-6 rounded-lg shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300 hover:scale-[1.02] hover:rotate-1"
                data-testid="button-view-leaderboard"
              >
                {validateGameMutation.isPending ? t('viewLeaderboard.loading') : t('viewLeaderboard.viewButton')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}