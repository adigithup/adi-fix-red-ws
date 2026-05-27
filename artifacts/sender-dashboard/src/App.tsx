import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Senders from "@/pages/Senders";
import History from "@/pages/History";
import Leaderboard from "@/pages/Leaderboard";
import Settings from "@/pages/Settings";
import Status from "@/pages/Status";
import Contact from "@/pages/Contact";
import FixMerah from "@/pages/FixMerah";
import FixMerahDashboard from "@/pages/FixMerahDashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 30000,
      retry: false,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/fix-merah" component={FixMerah} />
        <Route path="/fix-merah-dashboard" component={FixMerahDashboard} />
        <Route path="/senders" component={Senders} />
        <Route path="/history" component={History} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/settings" component={Settings} />
        <Route path="/status" component={Status} />
        <Route path="/contact" component={Contact} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      <Toaster theme="dark" toastOptions={{ className: "glass-card border-primary/50 text-white" }} />
    </QueryClientProvider>
  );
}

export default App;
