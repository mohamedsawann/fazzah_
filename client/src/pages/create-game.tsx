import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useLocation } from "wouter";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Question {
  text: string;
  options: string[];
  correctAnswer: number;
}

export default function CreateGame() {
  const [gameName, setGameName] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { text: "", options: ["", "", "", ""], correctAnswer: 0 }
  ]);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const createGameMutation = useMutation({
    mutationFn: async (gameData: { name: string; questions: Question[] }) => {
      const response = await apiRequest("POST", "/api/games", gameData);
      return response.json();
    },
    onSuccess: (game) => {
      setLocation(`/game-created?gameId=${game.id}`);
    },
    onError: (error: any) => {
      console.error("Game creation error:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء اللعبة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    },
  });

  const addQuestion = () => {
    setQuestions([...questions, { text: "", options: ["", "", "", ""], correctAnswer: 0 }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const validateQuestions = () => {
    return questions.every(q => 
      q.text.trim() !== "" && 
      q.options.every(opt => opt.trim() !== "") &&
      q.correctAnswer >= 0 && q.correctAnswer < q.options.length
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameName.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم اللعبة.",
        variant: "destructive",
      });
      return;
    }

    if (!validateQuestions()) {
      toast({
        title: "خطأ",
        description: "يرجى التأكد من ملء جميع الأسئلة والخيارات بشكل صحيح.",
        variant: "destructive",
      });
      return;
    }

    createGameMutation.mutate({
      name: gameName,
      questions,
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(0 0% 12%) 0%, hsl(25 60% 20%) 25%, hsl(35 50% 25%) 50%, hsl(25 60% 20%) 75%, hsl(0 0% 12%) 100%)' }}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-2xl animate-ping" style={{ animationDuration: '4s' }}></div>
      </div>
      <div className="container mx-auto px-4 py-8 max-w-2xl relative z-10">
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
          <h2 className="text-3xl font-bold font-arabic text-primary mb-2 animate-pulse">
            إنشاء لعبة ✨
          </h2>
          <p className="text-muted-foreground">Create New Game</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Game Name */}
          <Card className="border border-primary/30 shadow-lg shadow-primary/20 bg-gradient-to-br from-card to-primary/5 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-6">
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
            </CardContent>
          </Card>

          {/* Questions */}
          <div className="space-y-4">
            {questions.map((question, questionIndex) => (
              <Card key={questionIndex} className="border border-accent/30 shadow-lg shadow-accent/20 bg-gradient-to-br from-card to-accent/5 hover:shadow-accent/40 transition-all duration-300 hover:scale-[1.01]">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">
                      السؤال {questionIndex + 1} / Question {questionIndex + 1}
                    </h3>
                    {questions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(questionIndex)}
                        className="text-destructive hover:text-destructive"
                        data-testid={`button-remove-question-${questionIndex}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="block text-sm font-medium mb-2">
                        نص السؤال / Question Text
                      </Label>
                      <Input
                        type="text"
                        placeholder="اكتب السؤال هنا..."
                        value={question.text}
                        onChange={(e) => updateQuestion(questionIndex, 'text', e.target.value)}
                        className="w-full bg-muted border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                        data-testid={`input-question-text-${questionIndex}`}
                      />
                    </div>

                    <div>
                      <Label className="block text-sm font-medium mb-2">
                        الخيارات / Options
                      </Label>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex gap-2 items-center">
                            <Input
                              type="text"
                              placeholder={`الخيار ${optionIndex + 1}`}
                              value={option}
                              onChange={(e) => updateQuestionOption(questionIndex, optionIndex, e.target.value)}
                              className="flex-1 bg-muted border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                              data-testid={`input-option-${questionIndex}-${optionIndex}`}
                            />
                            <Button
                              type="button"
                              variant={question.correctAnswer === optionIndex ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateQuestion(questionIndex, 'correctAnswer', optionIndex)}
                              className="min-w-[80px]"
                              data-testid={`button-correct-answer-${questionIndex}-${optionIndex}`}
                            >
                              {question.correctAnswer === optionIndex ? "صحيح" : "اختر"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add Question Button */}
          <Button
            type="button"
            variant="outline"
            onClick={addQuestion}
            className="w-full bg-accent hover:bg-accent/90 border border-accent/50 text-accent-foreground font-medium py-3 px-6 rounded-lg shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-all duration-300 hover:scale-[1.02] hover:rotate-1"
            data-testid="button-add-question"
          >
            <Plus className="w-5 h-5 mr-2 animate-bounce" />
            إضافة سؤال جديد ➕ / Add New Question
          </Button>

          {/* Create Game Button */}
          <Button
            type="submit"
            disabled={createGameMutation.isPending || !gameName.trim() || !validateQuestions()}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-6 rounded-lg shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 hover:scale-[1.02] hover:-rotate-1"
            data-testid="button-create-game"
          >
            {createGameMutation.isPending ? "جارٍ الإنشاء... ⚡" : "إنشاء اللعبة 🎮"}
          </Button>
        </form>
      </div>
    </div>
  );
}
