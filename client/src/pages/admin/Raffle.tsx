import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Ticket, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function AdminRaffle() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showConfirm, setShowConfirm] = useState(false);
  const [drawnWinner, setDrawnWinner] = useState<any>(null);

  const { data: entries, isLoading: entriesLoading } = useQuery({
    queryKey: ['adminRaffleEntries'],
    queryFn: () => api.getRaffleEntries(),
  });

  const { data: winners, isLoading: winnersLoading } = useQuery({
    queryKey: ['adminRaffleWinners'],
    queryFn: () => api.getRaffleWinners(),
  });

  const drawMutation = useMutation({
    mutationFn: () => api.drawRaffle(),
    onSuccess: (data) => {
      setDrawnWinner(data);
      setShowConfirm(false);
      queryClient.invalidateQueries({ queryKey: ['adminRaffleEntries'] });
      queryClient.invalidateQueries({ queryKey: ['adminRaffleWinners'] });
      toast({ title: "Winner Drawn!", description: `Winner: ${data.winnerEmail}` });
    },
    onError: (err: any) => {
      toast({ title: "Draw Failed", description: err.message, variant: "destructive" });
      setShowConfirm(false);
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-2xl" data-testid="text-page-title">Raffle Management</h1>
            <p className="text-muted-foreground text-sm">Manage bi-weekly $25 referral giveaway</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  <Ticket className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Period Entries</p>
                  <p className="text-3xl font-bold" data-testid="text-entry-count">
                    {entriesLoading ? "..." : entries?.count || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Period Ends</p>
                  <p className="text-lg font-bold">
                    {entries?.periodEnd
                      ? formatDistanceToNow(new Date(entries.periodEnd), { addSuffix: true })
                      : "..."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg text-green-600">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Draws</p>
                  <p className="text-3xl font-bold">
                    {winnersLoading ? "..." : winners?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Draw Winner</CardTitle>
            <Button
              onClick={() => setShowConfirm(true)}
              disabled={drawMutation.isPending || (entries?.count || 0) === 0}
              className="gap-2"
              data-testid="button-draw-winner"
            >
              {drawMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trophy className="w-4 h-4" />
              )}
              Draw Winner
            </Button>
          </CardHeader>
          <CardContent>
            {drawnWinner && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4" data-testid="section-drawn-winner">
                <h3 className="font-semibold text-green-900 mb-1">Latest Winner</h3>
                <p className="text-green-800">{drawnWinner.winnerEmail}</p>
                <p className="text-sm text-green-700">Referrals: {drawnWinner.winnerReferralCount}</p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Click "Draw Winner" to randomly select one winner from the current period's entries.
              All entries for this period will be cleared after the draw.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Past Winners</CardTitle>
          </CardHeader>
          <CardContent>
            {winnersLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : winners && winners.length > 0 ? (
              <div className="space-y-3">
                {winners.map((w: any) => (
                  <div key={w.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                    <div>
                      <p className="font-medium">{w.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Period: {format(new Date(w.periodStart), "MMM d")} - {format(new Date(w.periodEnd), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-green-50 text-green-700">$25 Winner</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(w.drawnAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No winners drawn yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Raffle Draw</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This will randomly select one winner from {entries?.count || 0} entries and clear all entries for this period.
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button onClick={() => drawMutation.mutate()} disabled={drawMutation.isPending} className="gap-2">
              {drawMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
              Draw Winner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
