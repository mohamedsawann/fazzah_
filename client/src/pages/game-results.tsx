import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useSearch } from "wouter";
import { Trophy } from "lucide-react";

interface Player {
  id: string;
  name: string;
  phone: string;
  gameId: string;
  score: number;
  correctAnswers: number;
  totalAnswers: number;
  averageTime: number;
  completedAt: string | null;
}

export default function GameResults() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const playerId = params.get("playerId");
  const gameId = params.get("gameId");

  const { data: leaderboard, isLoading } = useQuery<Player[]>({
    queryKey: ["/api/games", gameId, "leaderboard"],
    enabled: !!gameId,
  });

  const currentPlayer = leaderboard?.find(player => player.id === playerId);
  const playerRank = leaderboard?.findIndex(player => player.id === playerId);

  if (isLoading || !currentPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-950/10 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جارٍ تحميل النتائج...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(0 0% 12%) 0%, hsl(25 60% 20%) 25%, hsl(35 50% 25%) 50%, hsl(25 60% 20%) 75%, hsl(0 0% 12%) 100%)' }}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-2xl animate-ping" style={{ animationDuration: '4s' }}></div>
      </div>
      <div className="container mx-auto px-4 py-8 max-w-md relative z-10">
        <div className="text-center mb-8" data-testid="header-results">
          <div className="text-6xl mb-4 animate-bounce">🎉✨</div>
          <h2 className="text-3xl font-bold font-arabic text-primary mb-2 animate-pulse">
            انتهت اللعبة! 🏆
          </h2>
          <p className="text-muted-foreground">Game Completed</p>
        </div>

        {/* Player Score */}
        <Card className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 hover:scale-[1.02] mb-6">
          <CardContent className="p-6">
            <div className="text-center" data-testid="player-stats">
              <div className="text-4xl font-bold text-primary mb-2" data-testid="final-score">
                {currentPlayer.score.toLocaleString()}
              </div>
              <div className="text-muted-foreground mb-4">نقطتك النهائية</div>
              <div className="flex justify-around text-sm">
                <div>
                  <div className="font-bold" data-testid="correct-answers">
                    {currentPlayer.correctAnswers}
                  </div>
                  <div className="text-muted-foreground">صحيح</div>
                </div>
                <div>
                  <div className="font-bold" data-testid="incorrect-answers">
                    {currentPlayer.totalAnswers - currentPlayer.correctAnswers}
                  </div>
                  <div className="text-muted-foreground">خطأ</div>
                </div>
                <div>
                  <div className="font-bold" data-testid="average-time">
                    {currentPlayer.averageTime}s
                  </div>
                  <div className="text-muted-foreground">متوسط الوقت</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="border border-accent/30 shadow-lg shadow-accent/20 bg-gradient-to-br from-card to-accent/5 hover:shadow-accent/40 transition-all duration-300 hover:scale-[1.01] mb-6">
          <CardContent className="p-6">
            <h3 className="font-medium text-center mb-4 flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-primary animate-bounce" />
              <span>ترتيبك في هذه اللعبة 🏅</span>
            </h3>

            <div className="space-y-2" data-testid="leaderboard-list">
              {leaderboard?.slice(0, 5).map((player, index) => (
                <div
                  key={player.id}
                  className={`flex justify-between items-center py-2 px-3 rounded-lg ${
                    player.id === playerId
                      ? "bg-primary/20 border border-primary/30"
                      : index === 0
                      ? "bg-muted/50"
                      : index === 1
                      ? "bg-muted/30"
                      : "bg-muted/20"
                  }`}
                  data-testid={`leaderboard-entry-${index}`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold ${
                        index === 0
                          ? "text-primary"
                          : index === 1
                          ? "text-accent"
                          : "text-muted-foreground"
                      }`}
                    >
                      {index + 1}.
                    </span>
                    <span className="font-medium" data-testid={`player-name-${index}`}>
                      {player.id === playerId ? "أنت" : player.name}
                    </span>
                    {player.id === playerId && (
                      <span className="text-xs text-primary bg-primary/20 px-2 py-1 rounded">
                        أنت
                      </span>
                    )}
                  </div>
                  <span
                    className={`font-bold ${
                      player.id === playerId
                        ? "text-primary"
                        : index === 0
                        ? "text-primary"
                        : index === 1
                        ? "text-accent"
                        : "text-muted-foreground"
                    }`}
                    data-testid={`player-score-${index}`}
                  >
                    {player.score.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href={`/game-play?playerId=${playerId}&gameId=${gameId}`}>
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 hover:scale-[1.02] hover:-rotate-1"
              data-testid="button-play-again"
            >
              العب مرة أخرى 🔄
            </Button>
          </Link>
          
          <Link href="/">
            <Button
              variant="secondary"
              className="w-full bg-amber-500 hover:bg-amber-600 border border-amber-400 text-white font-medium py-3 px-6 rounded-lg shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all duration-300 hover:scale-[1.02] hover:rotate-1"
              data-testid="button-home"
            >
              العودة للصفحة الرئيسية 🏠
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
