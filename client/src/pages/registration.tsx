import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation, useSearch } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StickersBackground } from "@/components/stickers-background";

export default function Registration() {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { toast } = useToast();
  const isRTL = i18n.dir() === 'rtl';

  const params = new URLSearchParams(search);
  const gameId = params.get("gameId");
  const mode = params.get("mode");

  const registerPlayerMutation = useMutation({
    mutationFn: async (playerData: { name: string; phone: string; gameId: string }) => {
      const response = await apiRequest("POST", "/api/players", playerData);
      return response.json();
    },
    onSuccess: (player) => {
      if (player.isExisting) {
        if (player.hasCompleted) {
          // Player already completed this game - redirect to results
          toast({
            title: t('registration.error'),
            description: t('registration.gameCompleted'),
            variant: "default",
          });
          setLocation(`/game-results?playerId=${player.id}&gameId=${gameId}`);
        } else {
          // Player exists but hasn't completed - let them continue
          toast({
            title: t('registration.you'),
            description: t('registration.startGame'),
            variant: "default",
          });
          setLocation(`/game-play?playerId=${player.id}&gameId=${gameId}`);
        }
      } else {
        // New player - proceed to game
        setLocation(`/game-play?playerId=${player.id}&gameId=${gameId}`);
      }
    },
    onError: () => {
      toast({
        title: t('registration.error'),
        description: t('registration.error'),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !gameId) {
      toast({
        title: t('registration.error'),
        description: t('registration.fillAllFields'),
        variant: "destructive",
      });
      return;
    }

    // Basic phone validation
    const phoneRegex = /^05\d{8}$/;
    if (!phoneRegex.test(phone)) {
      toast({
        title: t('registration.error'),
        description: t('registration.invalidPhone'),
        variant: "destructive",
      });
      return;
    }

    registerPlayerMutation.mutate({
      name,
      phone,
      gameId: gameId!,
    });
  };

  const goBack = () => {
    if (mode === "join") {
      setLocation("/join-game");
    } else {
      setLocation("/create-game");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden trivia-background">
      <StickersBackground transparent />
      {/* Subtle overlay for content readability */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-[1]"></div>
      <div className="container mx-auto px-4 py-8 max-w-md relative z-10">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={goBack}
            className="flex items-center gap-2 text-white bg-orange-500 hover:bg-orange-600 transition-colors px-3 py-2 rounded-md"
            data-testid="button-back"
          >
            <div className="flex items-center">
              {isRTL ? <ArrowRight className="w-5 h-5 ml-2" /> : <ArrowLeft className="w-5 h-5 mr-2" />}
              <span>{t('registration.back')}</span>
            </div>
          </Button>
        </div>

        <div className="text-center mb-8" data-testid="header-registration">
          <h2 className="text-3xl font-bold font-arabic text-primary mb-2">
            {t('registration.title')}
          </h2>
          <p className="text-primary">{t('registration.subtitle')}</p>
        </div>

        <Card className="border-2 border-orange-400 shadow-lg bg-white/70">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="block text-sm font-medium mb-2">
                  {t('registration.name')}
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t('registration.enterName')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-orange-500/25 border border-orange-400/50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-colors"
                  data-testid="input-name"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="block text-sm font-medium mb-2">
                  {t('registration.phone')}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t('registration.enterPhone')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-orange-500/25 border border-orange-400/50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-colors"
                  maxLength={10}
                  data-testid="input-phone"
                />
              </div>

              <Button
                type="submit"
                disabled={registerPlayerMutation.isPending || !name || !phone}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300"
                data-testid="button-start-game"
              >
                {registerPlayerMutation.isPending ? t('registration.loading') : t('registration.startPlaying')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
