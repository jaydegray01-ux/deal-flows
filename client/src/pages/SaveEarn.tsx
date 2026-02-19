import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DealCard from "@/components/DealCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Banknote, CreditCard, Gift, Users, Receipt, Briefcase, Star, GraduationCap, PiggyBank, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Link } from "wouter";

const subcategoryMeta: Record<string, { icon: React.ReactNode; description: string }> = {
  "cashback-apps": {
    icon: <DollarSign className="w-5 h-5" />,
    description: "Earn money back on everyday online purchases through trusted cashback platforms.",
  },
  "bank-bonuses": {
    icon: <Banknote className="w-5 h-5" />,
    description: "Get paid to open checking or savings accounts with promotional bonuses.",
  },
  "investing-bonuses": {
    icon: <PiggyBank className="w-5 h-5" />,
    description: "Receive free stocks or cash bonuses when opening new investing accounts.",
  },
  "credit-card-bonuses": {
    icon: <CreditCard className="w-5 h-5" />,
    description: "Earn high-value welcome bonuses through credit card sign-up offers.",
  },
  "referral-bonuses": {
    icon: <Users className="w-5 h-5" />,
    description: "Apps and platforms that pay you for referring friends.",
  },
  "rewards-apps": {
    icon: <Receipt className="w-5 h-5" />,
    description: "Earn points, cashback, and gift cards by uploading receipts or shopping.",
  },
  "gig-bonuses": {
    icon: <Briefcase className="w-5 h-5" />,
    description: "Earn bonuses from delivery, rideshare, and freelance platforms.",
  },
  "free-trials": {
    icon: <Gift className="w-5 h-5" />,
    description: "Access limited-time free offers and product trials.",
  },
  "student-discounts": {
    icon: <GraduationCap className="w-5 h-5" />,
    description: "Exclusive discounts and savings for students.",
  },
  "budget-tools": {
    icon: <Star className="w-5 h-5" />,
    description: "Apps that help you track spending and automate savings.",
  },
};

export default function SaveEarn() {
  const { data: categoryTree } = useQuery({
    queryKey: ["categoryTree"],
    queryFn: () => api.getCategoryTree(),
  });

  const saveEarn = categoryTree?.find((c: any) => c.slug === "save-earn");

  const { data: dealsData } = useQuery({
    queryKey: ["deals", "save-earn", saveEarn?.id],
    queryFn: () => api.getDeals({ categoryId: saveEarn!.id, limit: "12" }),
    enabled: !!saveEarn?.id,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="relative bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.2),transparent_50%)]" />
          </div>
          <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
            <div className="max-w-2xl">
              <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30 border-none px-4 py-1.5 text-sm backdrop-blur-sm">
                <DollarSign className="w-3.5 h-3.5 mr-1" />
                Save & Earn
              </Badge>
              <h1 className="font-heading font-extrabold text-4xl md:text-5xl leading-tight mb-6">
                Smart Ways to <br />
                <span className="text-emerald-200">Save & Earn More</span>
              </h1>
              <p className="text-emerald-100 text-lg md:text-xl leading-relaxed max-w-lg">
                Discover cashback apps, bank bonuses, investing rewards, and more. Start putting money back in your pocket today.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 bg-emerald-50/50 border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {saveEarn?.children?.map((sub: any) => {
                const meta = subcategoryMeta[sub.slug];
                return (
                  <Link key={sub.id} href={`/c/save-earn/${sub.slug}`}>
                    <div className="group cursor-pointer p-5 rounded-xl border border-emerald-100 bg-white hover:border-emerald-300 hover:shadow-lg transition-all duration-300 flex flex-col gap-3 h-full" data-testid={`card-save-earn-${sub.slug}`}>
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-100 transition-all text-emerald-600">
                        {meta?.icon || <DollarSign className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className="font-semibold text-sm group-hover:text-emerald-700 transition-colors block mb-1">{sub.name}</span>
                        <p className="text-xs text-muted-foreground leading-relaxed">{meta?.description || ""}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="font-heading font-bold text-2xl text-foreground">Latest Save & Earn Deals</h2>
                <p className="text-muted-foreground mt-1">The newest ways to save and earn money.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {dealsData?.deals && dealsData.deals.length > 0 ? (
                dealsData.deals.map((deal: any) => (
                  <DealCard key={deal.id} deal={deal} />
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <div className="inline-flex items-center justify-center p-4 bg-emerald-50 rounded-full mb-4">
                    <DollarSign className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2">No deals yet</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Save & Earn deals are coming soon. Check back later for cashback offers, bank bonuses, and more.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
