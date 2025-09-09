import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation, useSearch } from "wouter";
import { ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Registration() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { toast } = useToast();

  const params = new URLSearchParams(search);
  const gameId = params.get("gameId");
  const mode = params.get("mode");

  const registerPlayerMutation = useMutation({
    mutationFn: async (playerData: { name: string; phone: string; gameId: string }) => {
      const response = await apiRequest("POST", "/api/players", playerData);
      return response.json();
    },
    onSuccess: (player) => {
      setLocation(`/game-play?playerId=${player.id}&gameId=${gameId}`);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !gameId) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة.",
        variant: "destructive",
      });
      return;
    }

    // Basic phone validation
    const phoneRegex = /^05\d{8}$/;
    if (!phoneRegex.test(phone)) {
      toast({
        title: "خطأ",
        description: "رقم الهاتف يجب أن يبدأ بـ 05 ويحتوي على 10 أرقام.",
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900" style={{ background: 'linear-gradient(135deg, hsl(240 20% 4%) 0%, hsl(262 30% 10%) 50%, hsl(240 20% 4%) 100%)' }}>
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={goBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-0"
            data-testid="button-back"
          >
            <ArrowRight className="w-5 h-5" />
            <span>العودة</span>
          </Button>
        </div>

        <div className="text-center mb-8" data-testid="header-registration">
          <h2 className="text-3xl font-bold font-arabic text-primary mb-2">
            التسجيل
          </h2>
          <p className="text-muted-foreground">Registration</p>
        </div>

        <Card className="border border-border shadow-lg">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="block text-sm font-medium mb-2">
                  الاسم / Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="أدخل اسمك"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  data-testid="input-name"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="block text-sm font-medium mb-2">
                  رقم الهاتف / Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="05xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  maxLength={10}
                  data-testid="input-phone"
                />
              </div>

              <Button
                type="submit"
                disabled={registerPlayerMutation.isPending || !name || !phone}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-primary/25 transition-all duration-300"
                data-testid="button-start-game"
              >
                {registerPlayerMutation.isPending ? "جارٍ التسجيل..." : "ابدأ اللعب"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
