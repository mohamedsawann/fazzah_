import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StickersBackground } from "@/components/stickers-background";
import { playSound } from "@/lib/soundUtils";
import { useTranslation } from "react-i18next";

export default function JoinGame() {
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
      setLocation(`/registration?gameId=${game.id}&mode=join`);
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: t('joinGame.invalidCode'),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameCode.length !== 6) {
      toast({
        title: t('common.error'),
        description: t('joinGame.codeLengthError'),
        variant: "destructive",
      });
      return;
    }
    validateGameMutation.mutate(gameCode.toUpperCase());
  };

  return (
    <div className="min-h-screen relative overflow-hidden trivia-background">
      <StickersBackground transparent />
      {/* Stronger overlay for better content readability */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-[1]"></div>
      <div className="container mx-auto px-4 py-8 max-w-md relative z-10">
        <div className="mb-6">
          <Link href="/">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-white bg-orange-500 hover:bg-orange-600 transition-colors px-3 py-2 rounded-md"
              data-testid="button-back"
            >
              {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
              <span>{t('common.back')}</span>
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8" data-testid="header-join-game">
          <h2 className="text-4xl md:text-5xl font-bold font-arabic text-primary mb-3 drop-shadow-lg">
            {t('joinGame.pageTitle')}
          </h2>
          <p className="text-lg text-primary font-medium">{t('joinGame.pageSubtitle')}</p>
        </div>

        <Card className="border-2 border-orange-400 shadow-2xl shadow-primary/40 bg-orange-500/25 backdrop-blur-md hover:shadow-primary/60 transition-all duration-300 hover:scale-[1.02]">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="gameCode" className="block text-lg font-semibold mb-4 text-primary">
                  {t('joinGame.codeLabel')}
                </Label>
                <Input
                  id="gameCode"
                  type="text"
                  placeholder={t('joinGame.codePlaceholder')}
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                  className="w-full bg-white/70 border-2 border-gray-300 rounded-xl px-6 py-4 text-center text-3xl font-bold tracking-widest focus:ring-4 focus:ring-primary/50 focus:border-primary transition-all shadow-lg"
                  maxLength={6}
                  data-testid="input-game-code"
                />
                <p className="text-sm text-primary/70 mt-3 text-center">
                  {t('joinGame.codeHelp')}
                </p>
              </div>
              <Button
                type="submit"
                disabled={validateGameMutation.isPending || gameCode.length !== 6}
                onClick={playSound.buttonClick}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-2xl shadow-orange-500/40 hover:shadow-orange-500/60 transition-all duration-300 hover:scale-[1.03] hover:-rotate-1"
                data-testid="button-continue"
              >
                {validateGameMutation.isPending ? t('common.loading') : `${t('common.continue')} 🎯`}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
