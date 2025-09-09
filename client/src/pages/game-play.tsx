import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation, useSearch } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  gameId: string;
  text: string;
  options: string[];
  correctAnswer: number;
  order: number;
}

export default function GamePlay() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(20);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [answers, setAnswers] = useState<Array<{
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
    timeSpent: number;
  }>>([]);

  const [, setLocation] = useLocation();
  const search = useSearch();
  const { toast } = useToast();

  const params = new URLSearchParams(search);
  const playerId = params.get("playerId");
  const gameId = params.get("gameId");

  const { data: questions, isLoading } = useQuery<Question[]>({
    queryKey: ["/api/games", gameId, "questions"],
    enabled: !!gameId,
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async (answerData: {
      questionId: string;
      selectedAnswer: number;
      isCorrect: boolean;
      timeSpent: number;
    }) => {
      const response = await apiRequest("POST", `/api/players/${playerId}/answers`, answerData);
      return response.json();
    },
  });

  const completeGameMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/players/${playerId}/complete`);
      return response.json();
    },
    onSuccess: () => {
      setLocation(`/game-results?playerId=${playerId}&gameId=${gameId}`);
    },
  });

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0 && !isAnswered) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && !isAnswered) {
      // Time's up, auto-submit wrong answer
      handleAnswerSelect(-1);
    }
  }, [timeRemaining, isAnswered]);

  // Reset timer when question changes
  useEffect(() => {
    setTimeRemaining(20);
    setIsAnswered(false);
    setSelectedAnswer(null);
  }, [currentQuestionIndex]);

  const currentQuestion = questions?.[currentQuestionIndex];

  const handleAnswerSelect = async (answerIndex: number) => {
    if (isAnswered || !currentQuestion) return;

    setSelectedAnswer(answerIndex);
    setIsAnswered(true);

    const timeSpent = 20 - timeRemaining;
    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    const answerData = {
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
      isCorrect,
      timeSpent,
    };

    setAnswers(prev => [...prev, answerData]);

    // Submit answer to backend
    try {
      const result = await submitAnswerMutation.mutateAsync(answerData);
      setScore(prev => prev + result.points);
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }

    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestionIndex < (questions?.length || 0) - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Game complete
        completeGameMutation.mutate();
      }
    }, 2000);
  };

  if (isLoading || !questions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-950/10 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جارٍ تحميل الأسئلة...</p>
        </div>
      </div>
    );
  }

  const progressPercentage = ((20 - timeRemaining) / 20) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-950/10 to-background">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Game Header */}
        <div className="flex justify-between items-center mb-6" data-testid="game-header">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary" data-testid="current-score">
              {score.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">نقطة</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-medium" data-testid="question-progress">
              {currentQuestionIndex + 1} / {questions.length}
            </div>
            <div className="text-sm text-muted-foreground">سؤال</div>
          </div>
        </div>

        {/* Timer */}
        <div className="mb-6" data-testid="timer-section">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">الوقت المتبقي</span>
            <span className="text-lg font-bold text-primary" data-testid="time-remaining">
              {timeRemaining}s
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-1000"
              style={{ width: `${progressPercentage}%` }}
              data-testid="timer-progress"
            ></div>
          </div>
        </div>

        {/* Question */}
        <Card className="border border-border shadow-lg mb-6">
          <CardContent className="p-6">
            <h3 className="text-xl font-medium text-center mb-6" data-testid="question-text">
              {currentQuestion?.text}
            </h3>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion?.options.map((option, index) => (
                <Button
                  key={index}
                  variant="secondary"
                  disabled={isAnswered}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full bg-muted hover:bg-primary hover:text-primary-foreground border border-border rounded-lg p-4 text-right transition-all duration-300 transform hover:scale-[1.02] h-auto ${
                    isAnswered
                      ? selectedAnswer === index
                        ? index === currentQuestion.correctAnswer
                          ? "bg-green-600 text-white"
                          : "bg-red-600 text-white"
                        : index === currentQuestion.correctAnswer
                        ? "bg-green-600 text-white"
                        : ""
                      : ""
                  }`}
                  data-testid={`answer-option-${index}`}
                >
                  {option}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {isAnswered && (
          <div className="text-center text-muted-foreground" data-testid="answer-feedback">
            {selectedAnswer === currentQuestion?.correctAnswer
              ? "إجابة صحيحة! 🎉"
              : "إجابة خاطئة"}
          </div>
        )}
      </div>
    </div>
  );
}
