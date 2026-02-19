import AdminLayout from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Ticket, MousePointerClick, Users, TrendingUp, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.getAdminStats(),
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-deals">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.totalDeals ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">{stats?.activeDeals ?? 0} currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-active-deals">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.activeDeals ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">Live and available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-clicks">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.totalClicks ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">All-time deal clicks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-users">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.totalUsers ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">Total registered accounts</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Deals</CardTitle>
              <CardDescription>Deals with the most clicks</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : stats?.topDeals && stats.topDeals.length > 0 ? (
                <div className="space-y-5">
                  {stats.topDeals.map((deal: any, i: number) => (
                    <div key={deal.id} className="flex items-center">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-500 mr-4 shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <p className="text-sm font-medium leading-none truncate">{deal.title}</p>
                        <p className="text-xs text-muted-foreground">{deal.clickCount} clicks</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No deal data yet. Clicks will appear here.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common admin tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/admin/deals/new">
                  <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors" data-testid="link-new-deal">
                    <Ticket className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Create New Deal</p>
                      <p className="text-xs text-muted-foreground">Add a new deal or promo code</p>
                    </div>
                  </div>
                </Link>
                <Link href="/admin/deals">
                  <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors" data-testid="link-manage-deals">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Manage Deals</p>
                      <p className="text-xs text-muted-foreground">Edit, delete, or update existing deals</p>
                    </div>
                  </div>
                </Link>
                <Link href="/admin/raffle">
                  <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors" data-testid="link-raffle">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Raffle Management</p>
                      <p className="text-xs text-muted-foreground">Draw winners and view entries</p>
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
