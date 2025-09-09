import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { PlayCircle, PlusCircle, Trophy } from "lucide-react";

interface LeaderboardEntry {
  name: string;
  score: number;
}

export default function Home() {
  const { data: leaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard/today"],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-950/10 to-background">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <div className="text-center mb-12 mt-8" data-testid="header-title">
          <h1 className="text-6xl font-bold font-arabic text-primary mb-2 drop-shadow-lg">
            فزه
          </h1>
          <p className="text-xl text-muted-foreground font-sans">Fazzah</p>
          <p className="text-sm text-muted-foreground mt-2 font-sans">
            منصة الألعاب التفاعلية
          </p>
        </div>

        {/* Main Action Buttons */}
        <div className="space-y-4 mb-8">
          <Link href="/join-game">
            <Button
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-medium py-4 px-6 rounded-xl shadow-lg hover:shadow-primary/25 transition-all duration-300 transform hover:scale-[1.02] text-lg h-auto"
              data-testid="button-join-game"
            >
              <div className="flex items-center justify-center gap-3">
                <PlayCircle className="w-6 h-6" />
                <span>الانضمام للعبة برمز</span>
              </div>
              <p className="text-sm text-primary-foreground/80 mt-1">
                Join Game by Code
              </p>
            </Button>
          </Link>

          <Link href="/create-game">
            <Button
              variant="secondary"
              className="w-full bg-card border border-border hover:bg-muted text-card-foreground font-medium py-4 px-6 rounded-xl shadow-lg hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] text-lg h-auto"
              data-testid="button-create-game"
            >
              <div className="flex items-center justify-center gap-3">
                <PlusCircle className="w-6 h-6" />
                <span>إنشاء لعبة جديدة</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Create New Game
              </p>
            </Button>
          </Link>
        </div>

        {/* Today's Winners */}
        <Card className="border border-border shadow-lg" data-testid="card-leaderboard">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-primary" />
              <h3 className="font-medium text-card-foreground">أبطال اليوم</h3>
              <span className="text-sm text-muted-foreground">
                Today's Champions
              </span>
            </div>
            
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center py-2 px-3 bg-muted/50 rounded-lg animate-pulse"
                  >
                    <div className="h-4 bg-muted rounded w-24"></div>
                    <div className="h-4 bg-muted rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2" data-testid="leaderboard-list">
                {leaderboard?.map((entry, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center py-2 px-3 rounded-lg ${
                      index === 0
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
                        {entry.name}
                      </span>
                    </div>
                    <span
                      className={`font-bold ${
                        index === 0
                          ? "text-primary"
                          : index === 1
                          ? "text-accent"
                          : "text-muted-foreground"
                      }`}
                      data-testid={`player-score-${index}`}
                    >
                      {entry.score.toLocaleString()} نقطة
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
