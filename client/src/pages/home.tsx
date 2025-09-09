import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PlayCircle, PlusCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-950/10 to-background">
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

        {/* Main Action Buttons */}
        <div className="space-y-6">
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
      </div>
    </div>
  );
}
