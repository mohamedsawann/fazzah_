import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useSearch } from "wouter";
import { Trophy } from "lucide-react";
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

export default function GameResults() {
  const { t } = useTranslation();
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
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm"></div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('gameResults.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Subtle overlay for content readability */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-sm"></div>
      <div className="container mx-auto px-4 py-8 max-w-md relative z-10">
        <div className="text-center mb-8" data-testid="header-results">
          <div className="text-6xl mb-4 animate-bounce">🎉✨</div>
          <h2 className="text-3xl font-bold font-arabic text-primary mb-2 animate-pulse">
            {t('gameResults.gameOver')}
          </h2>
          <p className="text-muted-foreground">{t('gameResults.gameCompleted')}</p>
        </div>

        {/* Player Score */}
        <Card className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 hover:scale-[1.02] mb-6">
          <CardContent className="p-6">
            <div className="text-center" data-testid="player-stats">
              <div className="text-4xl font-bold text-primary mb-2" data-testid="final-score">
                {currentPlayer.score.toLocaleString()}
              </div>
              <div className="text-muted-foreground mb-4">{t('gameResults.finalScore')}</div>
              <div className="flex justify-around text-sm">
                <div>
                  <div className="font-bold" data-testid="correct-answers">
                    {currentPlayer.correctAnswers}
                  </div>
                  <div className="text-muted-foreground">{t('gameResults.correctAnswers')}</div>
                </div>
                <div>
                  <div className="font-bold" data-testid="incorrect-answers">
                    {currentPlayer.totalAnswers - currentPlayer.correctAnswers}
                  </div>
                  <div className="text-muted-foreground">{t('gameResults.wrongAnswers')}</div>
                </div>
                <div>
                  <div className="font-bold" data-testid="average-time">
                    {currentPlayer.averageTime}s
                  </div>
                  <div className="text-muted-foreground">{t('gameResults.averageTime')}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="border border-accent/30 shadow-lg shadow-accent/20 bg-gradient-to-br from-card to-accent/5 hover:shadow-accent/40 transition-all duration-300 hover:scale-[1.01] mb-6">
          <CardContent className="p-6">
            <h3 className="font-medium text-center mb-4 flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-primary animate-bounce ltr:mr-2 rtl:ml-2" />
              <span>{t('gameResults.rank')} 🏅</span>
            </h3>

            <div className="space-y-2" data-testid="leaderboard-list">
              {leaderboard?.slice(0, 5).map((player, index) => (
                <div
                  key={player.id}
                  className={`flex justify-between items-center py-2 px-3 rounded-lg ${player.id === playerId
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
                      className={`font-bold ${index === 0
                        ? "text-primary"
                        : index === 1
                          ? "text-accent"
                          : "text-muted-foreground"
                        }`}
                    >
                      {index + 1}.
                    </span>
                    <span className="font-medium" data-testid={`player-name-${index}`}>
                      {player.id === playerId ? t('gameResults.you') : player.name}
                    </span>
                    {player.id === playerId && (
                      <span className="text-xs text-primary bg-primary/20 px-2 py-1 rounded">
                        {t('gameResults.you')}
                      </span>
                    )}
                  </div>
                  <span
                    className={`font-bold ${player.id === playerId
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
          <Link href="/">
            <Button
              onClick={playSound.buttonClick}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 hover:scale-[1.02] hover:-rotate-1"
              data-testid="button-home"
            >
              {t('gameResults.home')} 🏠
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
