import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import DealListing from "@/pages/DealListing";
import DealDetail from "@/pages/DealDetail";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import AffiliateDisclosure from "@/pages/AffiliateDisclosure";
import GiveawayRules from "@/pages/GiveawayRules";
import Dashboard from "@/pages/Dashboard";
import SaveEarn from "@/pages/SaveEarn";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminDeals from "@/pages/admin/Deals";
import AdminDealForm from "@/pages/admin/DealForm";
import AdminRaffle from "@/pages/admin/Raffle";
import Auth from "@/pages/Auth";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

function useReferralCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      document.cookie = `ref=${ref};path=/;max-age=${7 * 24 * 60 * 60}`;
    }
  }, []);
}

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (!isAdmin) {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function Router() {
  useReferralCapture();
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/deals" component={DealListing} />
      <Route path="/deals/:slug" component={DealDetail} />
      <Route path="/save-earn" component={SaveEarn} />
      <Route path="/c/:slug/:sub" component={DealListing} />
      <Route path="/c/:slug" component={DealListing} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/affiliate-disclosure" component={AffiliateDisclosure} />
      <Route path="/giveaway-rules" component={GiveawayRules} />
      <Route path="/dashboard" component={Dashboard} />
      
      <Route path="/admin">{() => <AdminRoute component={AdminDashboard} />}</Route>
      <Route path="/admin/deals">{() => <AdminRoute component={AdminDeals} />}</Route>
      <Route path="/admin/deals/new">{() => <AdminRoute component={AdminDealForm} />}</Route>
      <Route path="/admin/deals/:id/edit">{() => <AdminRoute component={AdminDealForm} />}</Route>
      <Route path="/admin/raffle">{() => <AdminRoute component={AdminRaffle} />}</Route>
      <Route path="/admin/users">{() => <AdminRoute component={AdminDashboard} />}</Route>
      <Route path="/admin/settings">{() => <AdminRoute component={AdminDashboard} />}</Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
