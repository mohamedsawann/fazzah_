import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./i18n"; // Initialize i18n
import { LanguageToggle } from "@/components/LanguageToggle";
import Home from "@/pages/home";
import JoinGame from "@/pages/join-game";
import CreateGame from "@/pages/create-game";
import GameCreated from "@/pages/game-created";
import LeaderboardView from "@/pages/leaderboard-view";
import ViewLeaderboard from "@/pages/view-leaderboard";
import Registration from "@/pages/registration";
import GamePlay from "@/pages/game-play";
import GameResults from "@/pages/game-results";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/join-game" component={JoinGame} />
      <Route path="/create-game" component={CreateGame} />
      <Route path="/game-created" component={GameCreated} />
      <Route path="/leaderboard-view" component={LeaderboardView} />
      <Route path="/view-leaderboard" component={ViewLeaderboard} />
      <Route path="/registration" component={Registration} />
      <Route path="/game-play" component={GamePlay} />
      <Route path="/game-results" component={GameResults} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="relative">
          {/* Global Language Toggle */}
          <div className="fixed top-4 left-4 z-50">
            <LanguageToggle />
          </div>
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
