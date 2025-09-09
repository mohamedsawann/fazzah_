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
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(240 20% 4%) 0%, hsl(280 50% 15%) 25%, hsl(320 60% 20%) 50%, hsl(280 50% 15%) 75%, hsl(240 20% 4%) 100%)' }}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-2xl animate-ping" style={{ animationDuration: '4s' }}></div>
      </div>
      <div className="container mx-auto px-4 py-8 max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-16 mt-12" data-testid="header-title">
          <h1 className="text-7xl font-bold font-arabic text-primary mb-4 drop-shadow-lg animate-pulse">
            فزه
          </h1>
          <p className="text-2xl text-transparent bg-gradient-to-r from-accent to-primary bg-clip-text font-sans mb-2">Fazzah</p>
          <p className="text-base text-muted-foreground font-sans">
            منصة الألعاب التفاعلية ⚡
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="border border-primary/30 shadow-lg shadow-primary/20 bg-gradient-to-br from-card to-primary/5 hover:shadow-primary/40 transition-all duration-300 hover:scale-105">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gamepad2 className="w-5 h-5 text-primary animate-bounce" />
                <span className="font-medium text-card-foreground">ألعاب اليوم</span>
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" data-testid="games-today">
                {stats?.gamesPlayedToday || 0}
              </div>
              <p className="text-xs text-muted-foreground">Games Today</p>
            </CardContent>
          </Card>

          <Card className="border border-accent/30 shadow-lg shadow-accent/20 bg-gradient-to-br from-card to-accent/5 hover:shadow-accent/40 transition-all duration-300 hover:scale-105">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-accent animate-bounce" style={{ animationDelay: '0.5s' }} />
                <span className="font-medium text-card-foreground">اللاعبون</span>
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent" data-testid="total-players">
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
              className="w-full bg-gradient-to-r from-primary via-accent to-primary hover:from-primary/90 hover:via-accent/90 hover:to-primary/90 text-primary-foreground font-medium py-6 px-8 rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 transform hover:scale-[1.02] hover:-rotate-1 text-xl h-auto animate-pulse"
              data-testid="button-join-game"
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-3">
                  <PlayCircle className="w-7 h-7 animate-spin" style={{ animationDuration: '3s' }} />
                  <span>الانضمام للعبة برمز 🚀</span>
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
              className="w-full bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/50 hover:bg-gradient-to-r hover:from-accent/30 hover:to-primary/30 text-card-foreground font-medium py-6 px-8 rounded-xl shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-all duration-300 transform hover:scale-[1.02] hover:rotate-1 text-xl h-auto"
              data-testid="button-create-game"
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-3">
                  <PlusCircle className="w-7 h-7 animate-pulse" />
                  <span>إنشاء لعبة جديدة ✨</span>
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
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110"
              data-testid="linkedin-link"
            >
              <FaLinkedin className="w-5 h-5 hover:animate-bounce" />
              <span className="text-sm">LinkedIn</span>
            </a>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">
              طُور بواسطة / Developed by
            </p>
            <p className="font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              GDG Tech and Innovation Team 💜
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
