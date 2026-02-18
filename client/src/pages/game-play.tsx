import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation, useSearch } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { playSound } from "@/lib/soundUtils";

interface Question {
  id: string;
  gameId: string;
  text: string;
  options: string[];
  correctAnswer: number;
  order: number;
}

export default function GamePlay() {
  const { t } = useTranslation();
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

  // Timer countdown with sound effects
  useEffect(() => {
    if (timeRemaining > 0 && !isAnswered) {
      const timer = setTimeout(() => {
        const newTime = timeRemaining - 1;
        setTimeRemaining(newTime);

        // Play sound effects based on time remaining
        if (newTime <= 5 && newTime > 0) {
          playSound.warningTick(); // Warning sound for last 5 seconds
        } else if (newTime > 5) {
          playSound.countdownTick(); // Regular tick sound
        }

        // Time warning sound at 10 seconds
        if (newTime === 10) {
          playSound.timeWarning();
        }
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

    // Play game start sound for first question
    if (currentQuestionIndex === 0) {
      playSound.gameStart();
    }
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

    // Play sound based on answer correctness
    if (isCorrect) {
      playSound.correctAnswer();
    } else {
      playSound.wrongAnswer();
    }

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
        // Game complete - play completion sound
        playSound.gameComplete();
        completeGameMutation.mutate();
      }
    }, 2000);
  };

  if (isLoading || !questions) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm"></div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('gamePlay.loading')}</p>
        </div>
      </div>
    );
  }

  const progressPercentage = ((20 - timeRemaining) / 20) * 100;

  // Dynamic timer bar colors based on time remaining
  const getTimerBarClass = () => {
    if (timeRemaining <= 5) {
      return "bg-gradient-to-r from-red-500 to-red-600 animate-pulse";
    } else if (timeRemaining <= 10) {
      return "bg-gradient-to-r from-yellow-500 to-orange-500";
    } else {
      return "bg-gradient-to-r from-green-500 to-blue-500";
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Subtle overlay for content readability */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-sm"></div>
      <div className="container mx-auto px-4 py-8 max-w-md relative z-10">
        {/* Game Header */}
        <div className="flex justify-between items-center mb-6" data-testid="game-header">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary" data-testid="current-score">
              {score.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">{t('gamePlay.points')}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-medium" data-testid="question-progress">
              {currentQuestionIndex + 1} / {questions.length}
            </div>
            <div className="text-sm text-muted-foreground">{t('gamePlay.question')}</div>
          </div>
        </div>

        {/* Enhanced Visual Timer */}
        <div className="mb-6" data-testid="timer-section">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-muted-foreground">{t('gamePlay.timeLeft')}</span>
            <span
              className={`text-xl font-bold transition-all duration-300 ${timeRemaining <= 5 ? 'text-red-400 animate-bounce' :
                timeRemaining <= 10 ? 'text-yellow-400' : 'text-green-400'
                }`}
              data-testid="time-remaining"
            >
              {timeRemaining}s
            </span>
          </div>

          {/* Progress Bar Container */}
          <div className="relative">
            <div className="w-full bg-gray-700/50 rounded-full h-4 shadow-inner">
              <div
                className={`h-4 rounded-full transition-all duration-300 ease-out ${getTimerBarClass()}`}
                style={{ width: `${Math.max(0, 100 - progressPercentage)}%` }}
                data-testid="timer-progress"
              >
                {/* Glowing effect for low time */}
                {timeRemaining <= 5 && (
                  <div className="absolute inset-0 rounded-full bg-red-400/30 blur-sm animate-pulse"></div>
                )}
              </div>
            </div>

            {/* Tick marks for visual reference */}
            <div className="absolute top-0 w-full h-4 flex justify-between items-center px-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-0.5 h-2 bg-white/30 rounded-full"
                ></div>
              ))}
            </div>
          </div>

          {/* Warning message for low time */}
          {timeRemaining <= 5 && timeRemaining > 0 && (
            <div className="text-center mt-2">
              <span className="text-red-400 text-sm font-medium animate-pulse">
                ⏰ {t('gamePlay.timeWarning')}
              </span>
            </div>
          )}
        </div>

        {/* Question */}
        <Card className="border border-primary/30 shadow-lg shadow-primary/20 bg-gradient-to-br from-card to-primary/5 mb-6">
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
                  onClick={() => {
                    playSound.buttonClick();
                    handleAnswerSelect(index);
                  }}
                  className={`w-full bg-gradient-to-r from-accent/10 to-primary/10 hover:from-primary hover:to-accent hover:text-primary-foreground border border-accent/30 rounded-lg p-4 transition-all duration-300 transform hover:scale-[1.02] hover:-rotate-1 shadow-lg hover:shadow-accent/30 h-auto text-start ${isAnswered
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
          <div className="text-center text-lg font-bold animate-bounce" data-testid="answer-feedback">
            {selectedAnswer === currentQuestion?.correctAnswer
              ? <span className="text-green-400">{t('gamePlay.correct')}</span>
              : <span className="text-red-400">{t('gamePlay.wrong')}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
