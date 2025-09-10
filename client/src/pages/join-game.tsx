import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function JoinGame() {
  const [gameCode, setGameCode] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

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
        title: "خطأ",
        description: "رمز اللعبة غير صحيح. يرجى التحقق من الرمز والمحاولة مرة أخرى.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameCode.length !== 6) {
      toast({
        title: "خطأ",
        description: "يجب أن يكون رمز اللعبة مكوناً من 6 أحرف.",
        variant: "destructive",
      });
      return;
    }
    validateGameMutation.mutate(gameCode.toUpperCase());
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(0 0% 12%) 0%, hsl(25 60% 20%) 25%, hsl(35 50% 25%) 50%, hsl(25 60% 20%) 75%, hsl(0 0% 12%) 100%)' }}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-2xl animate-ping" style={{ animationDuration: '4s' }}></div>
      </div>
      <div className="container mx-auto px-4 py-8 max-w-md relative z-10">
        <div className="mb-6">
          <Link href="/">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-0"
              data-testid="button-back"
            >
              <ArrowRight className="w-5 h-5" />
              <span>العودة</span>
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8" data-testid="header-join-game">
          <h2 className="text-3xl font-bold font-arabic text-primary mb-2 animate-pulse">
            الانضمام للعبة 🚀
          </h2>
          <p className="text-muted-foreground">Join Game</p>
        </div>

        <Card className="border border-primary/30 shadow-lg shadow-primary/20 bg-gradient-to-br from-card to-primary/5 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02]">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="gameCode" className="block text-sm font-medium mb-2">
                  رمز اللعبة / Game Code
                </Label>
                <Input
                  id="gameCode"
                  type="text"
                  placeholder="أدخل رمز اللعبة"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-center text-2xl font-bold focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  maxLength={6}
                  data-testid="input-game-code"
                />
              </div>
              <Button
                type="submit"
                disabled={validateGameMutation.isPending || gameCode.length !== 6}
                className="w-full animate-color-shift text-primary-foreground font-medium py-3 px-6 rounded-lg shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 hover:scale-[1.02] hover:-rotate-1"
                data-testid="button-continue"
              >
                {validateGameMutation.isPending ? "جارٍ التحقق... ⏳" : "متابعة 🎯"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
