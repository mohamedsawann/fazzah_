import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useLocation } from "wouter";
import { ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CreateGame() {
  const [gameName, setGameName] = useState("");
  const [category, setCategory] = useState("");
  const [questionCount, setQuestionCount] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const createGameMutation = useMutation({
    mutationFn: async (gameData: { name: string; category: string; questionCount: number }) => {
      const response = await apiRequest("POST", "/api/games", gameData);
      return response.json();
    },
    onSuccess: (game) => {
      setLocation(`/registration?gameId=${game.id}&mode=create`);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء اللعبة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameName || !category || !questionCount) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة.",
        variant: "destructive",
      });
      return;
    }

    createGameMutation.mutate({
      name: gameName,
      category,
      questionCount: parseInt(questionCount),
    });
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

        <div className="text-center mb-8" data-testid="header-create-game">
          <h2 className="text-3xl font-bold font-arabic text-primary mb-2">
            إنشاء لعبة
          </h2>
          <p className="text-muted-foreground">Create New Game</p>
        </div>

        <div className="space-y-4">
          <Card className="border border-border shadow-lg">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="gameName" className="block text-sm font-medium mb-2">
                    اسم اللعبة / Game Name
                  </Label>
                  <Input
                    id="gameName"
                    type="text"
                    placeholder="أدخل اسم اللعبة"
                    value={gameName}
                    onChange={(e) => setGameName(e.target.value)}
                    className="w-full bg-muted border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    data-testid="input-game-name"
                  />
                </div>

                <div>
                  <Label htmlFor="questionCount" className="block text-sm font-medium mb-2">
                    عدد الأسئلة / Number of Questions
                  </Label>
                  <Select value={questionCount} onValueChange={setQuestionCount}>
                    <SelectTrigger
                      className="w-full bg-muted border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      data-testid="select-question-count"
                    >
                      <SelectValue placeholder="اختر عدد الأسئلة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 أسئلة</SelectItem>
                      <SelectItem value="10">10 أسئلة</SelectItem>
                      <SelectItem value="15">15 سؤال</SelectItem>
                      <SelectItem value="20">20 سؤال</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category" className="block text-sm font-medium mb-2">
                    الفئة / Category
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger
                      className="w-full bg-muted border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      data-testid="select-category"
                    >
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ثقافة عامة">ثقافة عامة</SelectItem>
                      <SelectItem value="رياضة">رياضة</SelectItem>
                      <SelectItem value="تاريخ">تاريخ</SelectItem>
                      <SelectItem value="علوم">علوم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </form>
            </CardContent>
          </Card>

          <Button
            onClick={handleSubmit}
            disabled={createGameMutation.isPending || !gameName || !category || !questionCount}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-primary/25 transition-all duration-300"
            data-testid="button-create-game"
          >
            {createGameMutation.isPending ? "جارٍ الإنشاء..." : "إنشاء اللعبة"}
          </Button>
        </div>
      </div>
    </div>
  );
}
