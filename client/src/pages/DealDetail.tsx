import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RevealCodeModal from "@/components/RevealCodeModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Check, Share2, Flag, ThumbsUp, ThumbsDown, ShieldCheck, Clock, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import NotFound from "./not-found";

export default function DealDetail() {
  const [match, params] = useRoute("/deals/:slug");
  const slug = params?.slug;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deal, isLoading } = useQuery({
    queryKey: ['deal', slug],
    queryFn: () => api.getDealBySlug(slug!),
    enabled: !!slug
  });

  const { data: voteData } = useQuery({
    queryKey: ['dealVotes', deal?.id],
    queryFn: () => api.getDealVotes(deal!.id),
    enabled: !!deal?.id,
  });

  const voteMutation = useMutation({
    mutationFn: ({ dealId, voteType }: { dealId: string; voteType: "WORKED" | "FAILED" }) =>
      api.voteDeal(dealId, voteType),
    onSuccess: (data) => {
      queryClient.setQueryData(['dealVotes', deal?.id], { ...data, userVote: null });
      queryClient.invalidateQueries({ queryKey: ['dealVotes', deal?.id] });
      toast({ title: "Vote recorded", description: "Thanks for your feedback!" });
    },
    onError: () => {
      toast({ title: "Vote failed", description: "Could not record your vote.", variant: "destructive" });
    },
  });

  const clickMutation = useMutation({
    mutationFn: (dealId: string) => api.logClick(dealId),
  });

  const reportMutation = useMutation({
    mutationFn: ({ dealId, reason }: { dealId: string; reason: string }) => api.reportDeal(dealId, reason),
    onSuccess: () => {
      toast({ title: "Report Submitted", description: "Thanks for letting us know. We'll review this deal." });
      setIsReportOpen(false);
      setReportReason("");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Could not submit report.", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 py-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                    <div className="md:col-span-1 space-y-4">
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                    <Skeleton className="h-[300px] w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
  }

  if (!deal) return <NotFound />;

  const originalPrice = parseFloat(deal.originalPrice || deal.original_price || "0");
  const dealPrice = parseFloat(deal.dealPrice || deal.deal_price || "0");
  const discountPercent = deal.discountPercent || deal.discount_percent || 0;
  const promoCode = deal.promoCode || deal.promo_code;
  const affiliateLink = deal.affiliateLink || deal.affiliate_link;
  const imageUrl = deal.imageUrl || deal.image_url;
  const isFeatured = deal.isFeatured ?? deal.is_featured;
  const expirationDate = deal.expirationDate || deal.expiration_date;
  const remainingSlots = deal.remainingSlots ?? deal.remaining_slots;

  const isSoldOut = deal.status === "SOLD_OUT" || (deal.type === "SLOT" && remainingSlots === 0);

  const handleReveal = () => {
    clickMutation.mutate(deal.id);
    setIsModalOpen(true);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: deal.title,
      text: `Check out this deal: ${deal.title}${discountPercent > 0 ? ` - ${discountPercent}% off!` : ""}`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          await copyToClipboard(shareUrl);
        }
      }
    } else {
      await copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Link Copied!", description: "Deal link has been copied to your clipboard." });
    } catch {
      toast({ title: "Share", description: text, variant: "default" });
    }
  };

  const handleReport = () => {
    if (!reportReason.trim()) return;
    reportMutation.mutate({ dealId: deal.id, reason: reportReason.trim() });
  };

  const workedCount = voteData?.workedCount || 0;
  const failedCount = voteData?.failedCount || 0;
  const failRate = voteData?.failRate || 0;
  const userVote = voteData?.userVote;
  const totalVotes = workedCount + failedCount;
  const successRate = totalVotes > 0 ? Math.round((workedCount / totalVotes) * 100) : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 lg:col-span-4">
                <div className="aspect-square bg-white rounded-xl overflow-hidden border sticky top-24">
                    {imageUrl ? (
                      <img 
                          src={imageUrl} 
                          alt={deal.title} 
                          className="w-full h-full object-contain p-4 hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-muted-foreground/20">
                        {deal.title?.[0] || "D"}
                      </div>
                    )}
                </div>
            </div>

            <div className="md:col-span-7 lg:col-span-5 space-y-6">
                <div>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 uppercase tracking-wider text-xs font-bold">
                            {deal.type} Deal
                        </Badge>
                        {isFeatured && (
                            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-none">Featured</Badge>
                        )}
                        {isSoldOut && (
                            <Badge variant="destructive">Sold Out</Badge>
                        )}
                        {expirationDate && (
                          <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Expires {formatDistanceToNow(new Date(expirationDate), { addSuffix: true })}
                          </span>
                        )}
                    </div>

                    <h1 className="font-heading font-bold text-3xl md:text-4xl leading-tight text-foreground" data-testid="text-deal-title">
                        {deal.title}
                    </h1>
                </div>

                <div className="flex items-end gap-3 pb-6 border-b">
                    {dealPrice > 0 && <span className="font-bold text-4xl text-primary">${dealPrice.toFixed(2)}</span>}
                    {originalPrice > 0 && <span className="text-lg text-muted-foreground line-through mb-1">${originalPrice.toFixed(2)}</span>}
                    {discountPercent > 0 && (
                      <Badge variant="destructive" className="mb-2 text-sm font-bold h-6">
                          Save {discountPercent}%
                      </Badge>
                    )}
                </div>

                <div className="prose prose-slate max-w-none text-muted-foreground">
                    <p className="whitespace-pre-wrap">{deal.description}</p>
                    <ul className="space-y-1 mt-4 list-none pl-0">
                        <li className="flex items-center gap-2 text-sm text-foreground">
                            <Check className="w-4 h-4 text-green-500" /> Verified working
                        </li>
                        <li className="flex items-center gap-2 text-sm text-foreground">
                            <ShieldCheck className="w-4 h-4 text-green-500" /> 100% Satisfaction Guarantee
                        </li>
                    </ul>
                </div>

                <div className="bg-card border rounded-xl p-4 space-y-3" data-testid="section-voting">
                  {failRate > 0.4 && totalVotes >= 3 && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm" data-testid="text-vote-warning">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      This code may no longer be valid.
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Button
                      variant={userVote === "WORKED" ? "default" : "outline"}
                      size="sm"
                      className={`gap-2 ${userVote === "WORKED" ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                      onClick={() => voteMutation.mutate({ dealId: deal.id, voteType: "WORKED" })}
                      disabled={voteMutation.isPending}
                      data-testid="button-vote-worked"
                    >
                      <ThumbsUp className="w-4 h-4" /> Worked ({workedCount})
                    </Button>
                    <Button
                      variant={userVote === "FAILED" ? "default" : "outline"}
                      size="sm"
                      className={`gap-2 ${userVote === "FAILED" ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
                      onClick={() => voteMutation.mutate({ dealId: deal.id, voteType: "FAILED" })}
                      disabled={voteMutation.isPending}
                      data-testid="button-vote-failed"
                    >
                      <ThumbsDown className="w-4 h-4" /> Didn't Work ({failedCount})
                    </Button>
                    {successRate !== null && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        {successRate}% success rate
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                    <Button variant="outline" size="sm" className="gap-2 text-muted-foreground" onClick={handleShare} data-testid="button-share">
                        <Share2 className="w-4 h-4" /> Share
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 text-muted-foreground" onClick={() => setIsReportOpen(true)} data-testid="button-report">
                        <Flag className="w-4 h-4" /> Report
                    </Button>
                </div>
            </div>

            <div className="md:col-span-12 lg:col-span-3">
                <div className="bg-card border rounded-xl p-6 shadow-sm sticky top-24 space-y-6">
                    <div className="text-center space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Discount Code</p>
                        <div 
                          className={`bg-muted p-3 rounded-lg border border-dashed border-primary/20 relative group ${!isSoldOut ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`} 
                          onClick={() => !isSoldOut && handleReveal()}
                        >
                            <div className="font-mono font-bold text-lg text-foreground blur-[2px] select-none">
                                {promoCode ? "••••••••" : "NO CODE NEEDED"}
                            </div>
                            {!isSoldOut && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                    <span className="text-xs font-bold text-foreground">Click to Reveal</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <Button 
                        size="lg" 
                        className={`w-full font-bold text-lg h-14 shadow-lg ${isSoldOut ? 'bg-muted text-muted-foreground shadow-none' : 'shadow-primary/20'}`}
                        onClick={handleReveal}
                        disabled={isSoldOut}
                        data-testid="button-reveal-code"
                    >
                        {isSoldOut ? "Sold Out" : (promoCode ? "Reveal Code & Buy" : "Get Deal")}
                    </Button>

                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-xs font-medium text-green-600">
                            <ThumbsUp className="w-3 h-3" /> {successRate !== null ? `${successRate}% Success Rate` : "Be the first to vote"}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </main>

      <RevealCodeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        deal={{ ...deal, promoCode, affiliateLink, remainingSlots, type: deal.type }} 
      />

      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report this deal</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Let us know why you think this deal should be reviewed.
            </p>
            <Textarea
              placeholder="e.g. Expired code, incorrect price, misleading information..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={4}
              data-testid="input-report-reason"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReportOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleReport} 
              disabled={!reportReason.trim() || reportMutation.isPending}
              className="gap-2"
              data-testid="button-submit-report"
            >
              <Flag className="w-4 h-4" />
              {reportMutation.isPending ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}
