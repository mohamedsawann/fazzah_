import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useSearch } from "wouter";
import { Trophy, Users, Clock, Target, ArrowLeft, RefreshCw } from "lucide-react";
import { playSound } from "@/lib/soundUtils";

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

interface Game {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  isActive: boolean;
}

export default function LeaderboardView() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const gameId = params.get("gameId");

  const { data: game, isLoading: gameLoading } = useQuery<Game>({
    queryKey: ["/api/games", gameId],
    enabled: !!gameId,
  });

  const { data: leaderboard, isLoading: leaderboardLoading, refetch } = useQuery<Player[]>({
    queryKey: ["/api/games", gameId, "leaderboard"],
    enabled: !!gameId,
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  const handleRefresh = () => {
    playSound.buttonClick();
    refetch();
  };

  if (gameLoading || leaderboardLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-950/10 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جارٍ تحميل النتائج...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-950/10 to-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">لم يتم العثور على اللعبة</p>
          <Link href="/">
            <Button onClick={playSound.buttonClick}>العودة للصفحة الرئيسية</Button>
          </Link>
        </div>
      </div>
    );
  }

  const activePlayers = leaderboard?.filter(player => player.completedAt) || [];
  const totalPlayers = leaderboard?.length || 0;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(0 0% 12%) 0%, hsl(25 60% 20%) 25%, hsl(35 50% 25%) 50%, hsl(25 60% 20%) 75%, hsl(0 0% 12%) 100%)' }}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-2xl animate-ping" style={{ animationDuration: '4s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-6" data-testid="header-leaderboard">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-primary animate-pulse" />
            <h2 className="text-3xl font-bold text-primary">
              نتائج اللعبة
            </h2>
            <Trophy className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <p className="text-xl text-card-foreground font-medium mb-2" data-testid="game-name">
            {game.name}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            رمز اللعبة: <span className="font-mono text-primary">{game.code}</span>
          </p>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="border border-primary/30 shadow-lg shadow-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary" data-testid="total-players">
                {totalPlayers}
              </div>
              <div className="text-sm text-muted-foreground">إجمالي اللاعبين</div>
            </CardContent>
          </Card>
          
          <Card className="border border-primary/30 shadow-lg shadow-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-400" data-testid="completed-players">
                {activePlayers.length}
              </div>
              <div className="text-sm text-muted-foreground">أنهوا اللعبة</div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex gap-2 mb-6">
          <Link href={`/game-created?gameId=${gameId}`}>
            <Button 
              onClick={playSound.buttonClick}
              variant="outline" 
              className="bg-amber-500 hover:bg-amber-600 border border-amber-400 text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              العودة لصفحة اللعبة
            </Button>
          </Link>
          
          <Button 
            onClick={handleRefresh}
            variant="outline"
            className="bg-blue-500 hover:bg-blue-600 border border-blue-400 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            تحديث
          </Button>
        </div>

        {/* Leaderboard */}
        <Card className="border border-primary/30 shadow-lg shadow-primary/20 bg-gradient-to-br from-card to-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-center text-primary">
              🏆 ترتيب اللاعبين
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {activePlayers.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-2">
                  لا يوجد لاعبون أنهوا اللعبة بعد
                </p>
                <p className="text-sm text-muted-foreground">
                  سيتم تحديث النتائج تلقائياً عند انتهاء اللاعبين
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activePlayers
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <div
                      key={player.id}
                      className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-300 border ${
                        index === 0
                          ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/50 shadow-lg"
                          : index === 1
                          ? "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50"
                          : index === 2
                          ? "bg-gradient-to-r from-orange-600/20 to-orange-700/20 border-orange-600/50"
                          : "bg-gradient-to-r from-card/50 to-primary/5 border-primary/30"
                      }`}
                      data-testid={`player-rank-${index + 1}`}
                    >
                      {/* Rank */}
                      <div className={`text-2xl font-bold ${
                        index === 0 ? "text-yellow-400" : 
                        index === 1 ? "text-gray-400" : 
                        index === 2 ? "text-orange-600" : "text-muted-foreground"
                      }`}>
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                      </div>

                      {/* Player Info */}
                      <div className="flex-1">
                        <div className="font-medium text-card-foreground text-lg mb-1" data-testid={`player-name-${index}`}>
                          {player.name}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>📞 {player.phone}</span>
                          <span>✅ {player.correctAnswers}/{player.totalAnswers}</span>
                          <span>⏱️ {player.averageTime.toFixed(1)}s</span>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          index === 0 ? "text-yellow-400" : "text-primary"
                        }`} data-testid={`player-score-${index}`}>
                          {player.score.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">نقطة</div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/">
            <Button 
              onClick={playSound.buttonClick}
              variant="outline"
              className="bg-card border border-border hover:bg-muted text-card-foreground"
            >
              العودة للصفحة الرئيسية 🏠
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}