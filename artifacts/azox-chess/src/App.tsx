import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import SinglePlayerGame from "@/pages/SinglePlayerGame";
import CreateMatch from "@/pages/CreateMatch";
import JoinMatch from "@/pages/JoinMatch";
import MultiplayerGame from "@/pages/MultiplayerGame";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/game/ai" component={SinglePlayerGame} />
      <Route path="/game/create" component={CreateMatch} />
      <Route path="/game/join" component={JoinMatch} />
      <Route path="/game/:code" component={MultiplayerGame} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
