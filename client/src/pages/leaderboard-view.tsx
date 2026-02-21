import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useSearch } from "wouter";
import { Trophy, Users, Target, ArrowLeft, ArrowRight, RefreshCw, Clock } from "lucide-react";
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
  const { t, i18n } = useTranslation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const gameId = params.get("gameId");
  const isRTL = i18n.dir() === 'rtl';

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
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm"></div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary">{t('leaderboard.loading')}</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm"></div>
        <div className="text-center relative z-10">
          <p className="text-destructive mb-4">{t('leaderboard.gameNotFound')}</p>
          <Link href="/">
            <Button onClick={playSound.buttonClick}>{t('leaderboard.home')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const activePlayers = leaderboard?.filter(player => player.completedAt) || [];
  const totalPlayers = leaderboard?.length || 0;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Subtle overlay for content readability */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-sm"></div>

      <div className="container mx-auto px-4 py-8 max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-6" data-testid="header-leaderboard">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-primary animate-pulse" />
            <h2 className="text-3xl font-bold text-primary">
              {t('leaderboard.title')}
            </h2>
            <Trophy className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <p className="text-xl text-primary font-medium mb-2" data-testid="game-name">
            {game.name}
          </p>
          <p className="text-sm text-primary mb-4">
            {t('leaderboard.gameCode')}: <span className="font-mono text-primary">{game.code}</span>
          </p>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="border-2 border-orange-400 shadow-lg shadow-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary" data-testid="total-players">
                {totalPlayers}
              </div>
              <div className="text-sm text-primary">{t('leaderboard.totalPlayers')}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-400 shadow-lg shadow-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-400" data-testid="completed-players">
                {activePlayers.length}
              </div>
              <div className="text-sm text-primary">{t('leaderboard.completedPlayers')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex gap-2 mb-6">
          <Link href={`/game-created?gameId=${gameId}`}>
            <Button
              onClick={playSound.buttonClick}
              variant="outline"
              className="bg-orange-500 hover:bg-orange-600 border border-orange-400 text-white px-3 py-2"
            >
              <div className="flex items-center">
                {isRTL ? <ArrowRight className="w-4 h-4 ml-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
                {t('leaderboard.backToGame')}
              </div>
            </Button>
          </Link>

          <Button
            onClick={handleRefresh}
            variant="outline"
            className="bg-blue-500 hover:bg-blue-600 border border-blue-400 text-white"
          >
            <RefreshCw className="w-4 h-4 rtl:ml-2 ltr:mr-2" />
            {t('leaderboard.refresh')}
          </Button>
        </div>

        {/* Leaderboard */}
        <Card className="border-2 border-orange-400 shadow-lg shadow-primary/20 bg-gradient-to-br from-card to-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-center text-primary">
              🏆 {t('leaderboard.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {activePlayers.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
                <p className="text-primary text-lg mb-2">
                  {t('leaderboard.noPlayers')}
                </p>
                <p className="text-sm text-primary">
                  {t('leaderboard.resultsWillUpdate')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activePlayers
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <div
                      key={player.id}
                      className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-300 border ${index === 0
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
                      <div className={`text-2xl font-bold ${index === 0 ? "text-yellow-400" :
                        index === 1 ? "text-gray-400" :
                          index === 2 ? "text-orange-600" : "text-primary"
                        }`}>
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                      </div>

                      {/* Player Info */}
                      <div className="flex-1">
                        <div className="font-medium text-card-foreground text-lg mb-1" data-testid={`player-name-${index}`}>
                          {player.name}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-primary">
                          <span>📞 {player.phone}</span>
                          <span>✅ {player.correctAnswers}/{player.totalAnswers}</span>
                          <span>⏱️ {player.averageTime.toFixed(1)}s</span>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${index === 0 ? "text-yellow-400" : "text-primary"
                          }`} data-testid={`player-score-${index}`}>
                          {player.score.toLocaleString()}
                        </div>
                        <div className="text-sm text-primary">{t('leaderboard.points')}</div>
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
              {t('leaderboard.home')} 🏠
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}