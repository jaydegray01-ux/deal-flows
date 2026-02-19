import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, Ticket, Clock, Copy, Gift, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, Redirect } from "wouter";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['referralDashboard'],
    queryFn: () => api.getReferralDashboard(),
    enabled: !!user,
  });

  const { data: raffleInfo } = useQuery({
    queryKey: ['raffleInfo'],
    queryFn: () => api.getRaffleInfo(),
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return <Redirect to="/auth" />;

  const referralLink = dashboard?.referralCode
    ? `${window.location.origin}/?ref=${dashboard.referralCode}`
    : null;

  const copyReferralLink = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({ title: "Copied!", description: "Referral link copied to clipboard." });
    } catch {
      toast({ title: "Referral Link", description: referralLink });
    }
  };

  const nextDrawDate = dashboard?.nextDrawDate ? new Date(dashboard.nextDrawDate) : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl" data-testid="text-page-title">My Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your referrals and raffle entries</p>
        </div>

        <div className="space-y-6">
          <Card data-testid="card-referral-link">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                My Referral Link
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Share your unique referral link. When someone signs up using it, you earn one raffle entry for our bi-weekly $25 giveaway!
              </p>
              {referralLink ? (
                <div className="flex gap-2">
                  <Input
                    value={referralLink}
                    readOnly
                    className="font-mono text-sm"
                    data-testid="input-referral-link"
                  />
                  <Button onClick={copyReferralLink} variant="outline" className="gap-2 shrink-0" data-testid="button-copy-referral">
                    <Copy className="w-4 h-4" /> Copy
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Loading your referral link...</p>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card data-testid="card-referral-count">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Referrals</p>
                    <p className="text-3xl font-bold" data-testid="text-referral-count">
                      {isLoading ? "..." : dashboard?.referralCount || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-raffle-entries">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg text-green-600">
                    <Ticket className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Raffle Entries</p>
                    <p className="text-3xl font-bold" data-testid="text-raffle-entries">
                      {isLoading ? "..." : dashboard?.raffleEntryCount || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-next-draw">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Next Draw</p>
                    <p className="text-lg font-bold" data-testid="text-next-draw">
                      {nextDrawDate
                        ? formatDistanceToNow(nextDrawDate, { addSuffix: true })
                        : "..."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  Share your referral link with friends
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  When they sign up, you earn one raffle entry
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  Every 14 days, one winner is drawn for $25
                </li>
              </ol>
              <div className="mt-4 pt-4 border-t">
                <Link href="/giveaway-rules" className="text-sm text-primary hover:underline flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> View Official Giveaway Rules
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
