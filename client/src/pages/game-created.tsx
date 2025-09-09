import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useSearch, useLocation } from "wouter";
import { Copy, Share2, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const copyGameCode = async () => {
    if (game?.code) {
      try {
        await navigator.clipboard.writeText(game.code);
        toast({
          title: "تم النسخ!",
          description: "تم نسخ رمز اللعبة إلى الحافظة",
        });
      } catch (error) {
        toast({
          title: "خطأ",
          description: "لم يتم نسخ الرمز. يرجى النسخ يدوياً.",
          variant: "destructive",
        });
      }
    }
  };

  const shareGame = async () => {
    if (game?.code && navigator.share) {
      try {
        await navigator.share({
          title: `انضم إلى لعبة ${game.name}`,
          text: `استخدم الرمز: ${game.code}`,
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
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-950/10 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جارٍ تحميل اللعبة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900" style={{ background: 'linear-gradient(135deg, hsl(240 20% 4%) 0%, hsl(262 30% 10%) 50%, hsl(240 20% 4%) 100%)' }}>
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="text-center mb-8" data-testid="header-game-created">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold font-arabic text-primary mb-2">
            تم إنشاء اللعبة!
          </h2>
          <p className="text-muted-foreground">Game Created Successfully</p>
        </div>

        {/* Game Info */}
        <Card className="border border-border shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="text-center" data-testid="game-info">
              <h3 className="text-xl font-medium mb-4" data-testid="game-name">
                {game.name}
              </h3>
              
              <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-xl p-6 mb-6">
                <p className="text-sm text-muted-foreground mb-2">
                  رمز اللعبة / Game Code
                </p>
                <div className="text-4xl font-bold font-mono text-primary mb-4" data-testid="game-code">
                  {game.code}
                </div>
                <p className="text-sm text-muted-foreground">
                  شارك هذا الرمز مع الأصدقاء للانضمام
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={copyGameCode}
                  variant="outline"
                  className="flex-1 bg-card border border-border hover:bg-muted text-card-foreground"
                  data-testid="button-copy-code"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  نسخ الرمز
                </Button>
                
                <Button
                  onClick={shareGame}
                  variant="outline"
                  className="flex-1 bg-card border border-border hover:bg-muted text-card-foreground"
                  data-testid="button-share-code"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  مشاركة
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-medium py-4 px-6 rounded-xl shadow-lg hover:shadow-primary/25 transition-all duration-300"
            data-testid="button-start-playing"
          >
            <Play className="w-5 h-5 mr-2" />
            ابدأ اللعب الآن / Start Playing Now
          </Button>

          <Link href="/">
            <Button
              variant="outline"
              className="w-full bg-card border border-border hover:bg-muted text-card-foreground font-medium py-3 px-6 rounded-lg shadow-lg transition-all duration-300"
              data-testid="button-home"
            >
              العودة للصفحة الرئيسية / Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}