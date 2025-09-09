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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900" style={{ background: 'linear-gradient(135deg, hsl(240 20% 4%) 0%, hsl(262 30% 10%) 50%, hsl(240 20% 4%) 100%)' }}>
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="text-center mb-8" data-testid="header-results">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold font-arabic text-primary mb-2">
            انتهت اللعبة!
          </h2>
          <p className="text-muted-foreground">Game Completed</p>
        </div>

        {/* Player Score */}
        <Card className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 shadow-lg mb-6">
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
        <Card className="border border-border shadow-lg mb-6">
          <CardContent className="p-6">
            <h3 className="font-medium text-center mb-4 flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <span>ترتيبك في هذه اللعبة</span>
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
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-primary/25 transition-all duration-300"
              data-testid="button-play-again"
            >
              العب مرة أخرى
            </Button>
          </Link>
          
          <Link href="/">
            <Button
              variant="secondary"
              className="w-full bg-card border border-border hover:bg-muted text-card-foreground font-medium py-3 px-6 rounded-lg shadow-lg transition-all duration-300"
              data-testid="button-home"
            >
              العودة للصفحة الرئيسية
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
