import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { PlayCircle, PlusCircle, Users, Gamepad2 } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";

interface GameStats {
  gamesPlayedToday: number;
  totalPlayers: number;
}

export default function Home() {
  const { data: stats } = useQuery<GameStats>({
    queryKey: ["/api/stats/today"],
    enabled: true,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900" style={{ background: 'linear-gradient(135deg, hsl(240 20% 4%) 0%, hsl(262 30% 10%) 50%, hsl(240 20% 4%) 100%)' }}>
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <div className="text-center mb-16 mt-12" data-testid="header-title">
          <h1 className="text-7xl font-bold font-arabic text-primary mb-4 drop-shadow-lg">
            فزه
          </h1>
          <p className="text-2xl text-muted-foreground font-sans mb-2">Fazzah</p>
          <p className="text-base text-muted-foreground font-sans">
            منصة الألعاب التفاعلية
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="border border-border shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gamepad2 className="w-5 h-5 text-primary" />
                <span className="font-medium text-card-foreground">ألعاب اليوم</span>
              </div>
              <div className="text-2xl font-bold text-primary" data-testid="games-today">
                {stats?.gamesPlayedToday || 0}
              </div>
              <p className="text-xs text-muted-foreground">Games Today</p>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-accent" />
                <span className="font-medium text-card-foreground">اللاعبون</span>
              </div>
              <div className="text-2xl font-bold text-accent" data-testid="total-players">
                {stats?.totalPlayers || 0}
              </div>
              <p className="text-xs text-muted-foreground">Total Players</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Action Buttons */}
        <div className="space-y-6 mb-8">
          <Link href="/join-game">
            <Button
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-medium py-6 px-8 rounded-xl shadow-lg hover:shadow-primary/25 transition-all duration-300 transform hover:scale-[1.02] text-xl h-auto"
              data-testid="button-join-game"
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-3">
                  <PlayCircle className="w-7 h-7" />
                  <span>الانضمام للعبة برمز</span>
                </div>
                <p className="text-base text-primary-foreground/80">
                  Join Game by Code
                </p>
              </div>
            </Button>
          </Link>

          <Link href="/create-game">
            <Button
              variant="secondary"
              className="w-full bg-card border border-border hover:bg-muted text-card-foreground font-medium py-6 px-8 rounded-xl shadow-lg hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] text-xl h-auto"
              data-testid="button-create-game"
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-3">
                  <PlusCircle className="w-7 h-7" />
                  <span>إنشاء لعبة جديدة</span>
                </div>
                <p className="text-base text-muted-foreground">
                  Create New Game
                </p>
              </div>
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              data-testid="linkedin-link"
            >
              <FaLinkedin className="w-5 h-5" />
              <span className="text-sm">LinkedIn</span>
            </a>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">
              طُور بواسطة / Developed by
            </p>
            <p className="font-medium text-card-foreground">
              GDG Tech and Innovation Team
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
