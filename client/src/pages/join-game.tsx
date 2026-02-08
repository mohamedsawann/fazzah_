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
import { playSound } from "@/lib/soundUtils";

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
    <div className="min-h-screen relative overflow-hidden trivia-background">
      {/* Stronger overlay for better content readability */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
      <div className="container mx-auto px-4 py-8 max-w-md relative z-10">
        <div className="mb-6">
          <Link href="/">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors p-0 bg-background/60 backdrop-blur-sm"
              data-testid="button-back"
            >
              <ArrowRight className="w-5 h-5" />
              <span>العودة</span>
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8" data-testid="header-join-game">
          <h2 className="text-4xl md:text-5xl font-bold font-arabic text-primary mb-3 drop-shadow-lg">
            الانضمام للعبة 🚀
          </h2>
          <p className="text-lg text-primary font-medium">Join Game</p>
        </div>

        <Card className="border-2 border-primary/50 shadow-2xl shadow-primary/40 bg-gradient-to-br from-card/95 to-primary/10 backdrop-blur-md hover:shadow-primary/60 transition-all duration-300 hover:scale-[1.02]">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="gameCode" className="block text-lg font-semibold mb-4 text-primary">
                  رمز اللعبة / Game Code
                </Label>
                <Input
                  id="gameCode"
                  type="text"
                  placeholder="أدخل رمز اللعبة"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                  className="w-full bg-background/90 border-2 border-primary/50 rounded-xl px-6 py-4 text-center text-3xl font-bold tracking-widest focus:ring-4 focus:ring-primary/50 focus:border-primary transition-all shadow-lg"
                  maxLength={6}
                  data-testid="input-game-code"
                />
                <p className="text-sm text-primary/70 mt-3 text-center">
                  أدخل رمز مكون من 6 أحرف
                </p>
              </div>
              <Button
                type="submit"
                disabled={validateGameMutation.isPending || gameCode.length !== 6}
                onClick={playSound.buttonClick}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-2xl shadow-orange-500/40 hover:shadow-orange-500/60 transition-all duration-300 hover:scale-[1.03] hover:-rotate-1"
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
