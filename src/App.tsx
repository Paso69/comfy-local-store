import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import { seedIfEmpty } from "@/lib/seed";

import Dashboard from "./pages/Dashboard";
import Goals from "./pages/Goals";
import Tasks from "./pages/Tasks";
import Habits from "./pages/Habits";
import RoutineBuilder from "./pages/RoutineBuilder";
import SchedulePlanner from "./pages/SchedulePlanner";
import QuickCapture from "./pages/QuickCapture";
import KnowledgeVault from "./pages/KnowledgeVault";
import IdeaBank from "./pages/IdeaBank";
import TradingJournal from "./pages/TradingJournal";
import FinancialRoadmap from "./pages/FinancialRoadmap";
import WeeklyReview from "./pages/WeeklyReview";
import PhoneProtocol from "./pages/PhoneProtocol";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedIfEmpty().then(() => setReady(true));
  }, []);

  if (!ready) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-muted-foreground animate-pulse">Loading Life OS...</p>
    </div>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/habits" element={<Habits />} />
              <Route path="/routines" element={<RoutineBuilder />} />
              <Route path="/schedule" element={<SchedulePlanner />} />
              <Route path="/notes" element={<QuickCapture />} />
              <Route path="/knowledge" element={<KnowledgeVault />} />
              <Route path="/ideas" element={<IdeaBank />} />
              <Route path="/trading" element={<TradingJournal />} />
              <Route path="/financial" element={<FinancialRoadmap />} />
              <Route path="/review" element={<WeeklyReview />} />
              <Route path="/phone" element={<PhoneProtocol />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
