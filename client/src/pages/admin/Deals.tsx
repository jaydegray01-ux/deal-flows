import { useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MoreHorizontal, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function AdminDeals() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const { data } = useQuery({ 
    queryKey: ['admin-deals', searchTerm], 
    queryFn: () => api.getAdminDeals(searchTerm ? { search: searchTerm } : undefined),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteDeal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-deals'] });
      toast({ title: "Deal deleted" });
      setDeleteTarget(null);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deals = data?.deals || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Deals Management</h2>
            <p className="text-muted-foreground">Create, edit, and track all deals.</p>
          </div>
          <Link href="/admin/deals/new">
            <Button className="gap-2" data-testid="button-add-deal">
              <Plus className="w-4 h-4" /> Add New Deal
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="pb-3">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 max-w-sm w-full">
                 <Search className="w-4 h-4 text-muted-foreground" />
                 <Input 
                   placeholder="Search deals..." 
                   className="h-9" 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   data-testid="input-search-deals"
                 />
               </div>
             </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead className="max-w-[200px]">Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No deals found. Create your first deal!
                      </TableCell>
                    </TableRow>
                  ) : (
                    deals.map((deal: any) => (
                      <TableRow key={deal.id}>
                        <TableCell>
                          {(deal.imageUrl || deal.image_url) ? (
                            <img 
                              src={deal.imageUrl || deal.image_url} 
                              alt={deal.title} 
                              className="w-10 h-10 rounded-md object-cover bg-muted"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                              {deal.title?.[0]}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium truncate max-w-[200px]">
                          {deal.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={deal.type === 'SLOT' ? 'bg-orange-50 text-orange-600 border-orange-200' : ''}>
                            {deal.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={deal.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-500'}>
                            {deal.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          ${parseFloat(deal.dealPrice || deal.deal_price || "0").toFixed(2)}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {deal.createdAt || deal.created_at ? format(new Date(deal.createdAt || deal.created_at), 'MMM d, yyyy') : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0" data-testid={`button-actions-${deal.id}`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <Link href={`/admin/deals/${deal.id}/edit`}>
                                <DropdownMenuItem className="gap-2 cursor-pointer" data-testid={`button-edit-${deal.id}`}>
                                  <Pencil className="w-3.5 h-3.5" /> Edit Deal
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(deal.id)}>
                                Copy ID
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 gap-2 cursor-pointer"
                                onClick={() => setDeleteTarget({ id: deal.id, title: deal.title })}
                                data-testid={`button-delete-${deal.id}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete Deal
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Deal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
