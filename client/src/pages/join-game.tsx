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
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-950/10 to-background">
      <div className="container mx-auto px-4 py-8 max-w-md">
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
          <h2 className="text-3xl font-bold font-arabic text-primary mb-2">
            الانضمام للعبة
          </h2>
          <p className="text-muted-foreground">Join Game</p>
        </div>

        <Card className="border border-border shadow-lg">
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
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-center text-2xl font-bold tracking-widest focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  maxLength={6}
                  data-testid="input-game-code"
                />
              </div>
              <Button
                type="submit"
                disabled={validateGameMutation.isPending || gameCode.length !== 6}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-primary/25 transition-all duration-300"
                data-testid="button-continue"
              >
                {validateGameMutation.isPending ? "جارٍ التحقق..." : "متابعة"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
