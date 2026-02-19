import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DealCard from "@/components/DealCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Clock, Mail, DollarSign, Banknote, CreditCard, Gift, Users, Receipt, Briefcase, Star, GraduationCap, PiggyBank } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Link } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const saveEarnIcons: Record<string, React.ReactNode> = {
  "cashback-apps": <DollarSign className="w-5 h-5" />,
  "bank-bonuses": <Banknote className="w-5 h-5" />,
  "investing-bonuses": <PiggyBank className="w-5 h-5" />,
  "credit-card-bonuses": <CreditCard className="w-5 h-5" />,
  "referral-bonuses": <Users className="w-5 h-5" />,
  "rewards-apps": <Receipt className="w-5 h-5" />,
  "gig-bonuses": <Briefcase className="w-5 h-5" />,
  "free-trials": <Gift className="w-5 h-5" />,
  "student-discounts": <GraduationCap className="w-5 h-5" />,
  "budget-tools": <Star className="w-5 h-5" />,
};

const saveEarnDescriptions: Record<string, string> = {
  "cashback-apps": "Earn money back on everyday online purchases through trusted cashback platforms.",
  "bank-bonuses": "Get paid to open checking or savings accounts with promotional bonuses.",
  "investing-bonuses": "Receive free stocks or cash bonuses when opening new investing accounts.",
  "credit-card-bonuses": "Earn high-value welcome bonuses through credit card sign-up offers.",
  "referral-bonuses": "Apps and platforms that pay you for referring friends.",
  "rewards-apps": "Earn points, cashback, and gift cards by uploading receipts or shopping.",
  "gig-bonuses": "Earn bonuses from delivery, rideshare, and freelance platforms.",
  "free-trials": "Access limited-time free offers and product trials.",
  "student-discounts": "Exclusive discounts and savings for students.",
  "budget-tools": "Apps that help you track spending and automate savings.",
};

function SaveEarnSection({ categories }: { categories: any[] | undefined }) {
  const saveEarn = categories?.find((c: any) => c.slug === "save-earn");
  if (!saveEarn || !saveEarn.children?.length) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-y border-emerald-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-emerald-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="font-heading font-bold text-3xl text-foreground">Save & Earn</h2>
            </div>
            <p className="text-muted-foreground max-w-lg">Discover ways to save money, earn cashback, and grow your income with our curated financial opportunities.</p>
          </div>
          <Link href="/save-earn">
            <Button variant="outline" className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800" data-testid="button-view-save-earn">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {saveEarn.children.map((sub: any) => (
            <Link key={sub.id} href={`/c/save-earn/${sub.slug}`}>
              <div className="group cursor-pointer p-5 rounded-xl border border-emerald-100 bg-white hover:border-emerald-300 hover:shadow-lg transition-all duration-300 flex flex-col gap-3 h-full" data-testid={`card-save-earn-${sub.slug}`}>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-100 transition-all text-emerald-600">
                  {saveEarnIcons[sub.slug] || <DollarSign className="w-5 h-5" />}
                </div>
                <div>
                  <span className="font-semibold text-sm group-hover:text-emerald-700 transition-colors block mb-1">{sub.name}</span>
                  <p className="text-xs text-muted-foreground leading-relaxed">{saveEarnDescriptions[sub.slug] || ""}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const { data: trendingDeals } = useQuery({ 
    queryKey: ['trending'], 
    queryFn: () => api.getTrendingDeals()
  });
  
  const { data: featuredDeals } = useQuery({ 
    queryKey: ['featured'], 
    queryFn: () => api.getFeaturedDeals()
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categoryTree'],
    queryFn: () => api.getCategoryTree()
  });

  const subscribeMutation = useMutation({
    mutationFn: (email: string) => api.subscribe(email),
    onSuccess: () => {
      toast({ title: "Subscribed!", description: "You'll receive our best deals." });
      setEmail("");
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) subscribeMutation.mutate(email);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-slate-900 text-white overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-20">
            <img src="/hero-bg.png" alt="Background" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent z-0"></div>
          
          <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
            <div className="max-w-2xl">
              <Badge className="mb-4 bg-primary text-primary-foreground hover:bg-primary/90 border-none px-4 py-1.5 text-sm">
                New Exclusive Deals Added
              </Badge>
              <h1 className="font-heading font-extrabold text-4xl md:text-6xl leading-tight mb-6">
                Discover the Best Deals <br/>
                <span className="text-primary-foreground bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-purple-400">
                  Before They Expire
                </span>
              </h1>
              <p className="text-slate-300 text-lg md:text-xl mb-8 leading-relaxed max-w-lg">
                Join thousands of smart shoppers saving up to 80% on tech, fashion, and software with our verified promo codes and exclusive slot deals.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/deals">
                  <Button size="lg" className="h-12 px-8 text-base bg-violet-600 hover:bg-violet-700 border-none" data-testid="button-browse-deals">
                    Browse All Deals
                  </Button>
                </Link>
                <Link href="/deals?type=SLOT">
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-white/10 border-white/20 hover:bg-white/20 text-white" data-testid="button-view-slots">
                    View Exclusive Slots
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Save & Earn Section */}
        <SaveEarnSection categories={categoriesData} />

        {/* Trending Section */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="font-heading font-bold text-3xl text-foreground flex items-center gap-2">
                  <Zap className="text-yellow-500 fill-yellow-500" />
                  Trending Today
                </h2>
                <p className="text-muted-foreground mt-2">Top deals added by our team.</p>
              </div>
              <Link href="/deals">
                <Button variant="ghost" className="gap-2">
                  View All <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingDeals && trendingDeals.length > 0 ? (
                trendingDeals.map((deal: any) => (
                  <DealCard key={deal.id} deal={deal} />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No deals available yet. Check back soon!
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-16 bg-white border-y">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="font-heading font-bold text-3xl mb-4">Browse by Category</h2>
              <p className="text-muted-foreground">Find exactly what you're looking for across our most popular departments.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categoriesData?.filter((c: any) => c.slug !== "save-earn").map((category: any) => (
                <Link key={category.id} href={`/c/${category.slug}`}>
                  <div className="group cursor-pointer p-6 rounded-xl border bg-slate-50 hover:bg-white hover:border-primary/50 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center text-center gap-3 h-32" data-testid={`card-category-${category.slug}`}>
                    <div className="w-10 h-10 rounded-full bg-white border flex items-center justify-center group-hover:scale-110 transition-transform text-primary font-bold">
                      {category.name[0]}
                    </div>
                    <span className="font-medium text-sm group-hover:text-primary transition-colors">{category.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured / Ending Soon */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="font-heading font-bold text-3xl text-foreground flex items-center gap-2">
                  <Clock className="text-orange-500" />
                  Ending Soon & Exclusives
                </h2>
                <p className="text-muted-foreground mt-2">Don't miss out on these limited-time offers.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDeals && featuredDeals.length > 0 ? (
                featuredDeals.slice(0, 3).map((deal: any) => (
                  <DealCard key={deal.id} deal={deal} />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No featured deals at the moment.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-20 bg-primary overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('/hero-bg.png')] opacity-10 bg-repeat bg-center"></div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-white mb-6">
              Never Miss a Deal Again
            </h2>
            <p className="text-primary-foreground/90 max-w-xl mx-auto mb-10 text-lg">
              Join our newsletter and get the top 5 deals of the week delivered straight to your inbox.
            </p>
            
            <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3" onSubmit={handleSubscribe}>
              <Input 
                type="email" 
                placeholder="Enter your email address" 
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 h-12 rounded-full px-6 focus:bg-white/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="input-email-subscribe"
              />
              <Button size="lg" type="submit" className="h-12 rounded-full bg-white text-primary hover:bg-slate-100 font-bold px-8 shadow-lg" data-testid="button-subscribe">
                Subscribe
              </Button>
            </form>
            <p className="text-primary-foreground/60 text-xs mt-4">
              By subscribing you agree to our Terms & Privacy Policy.
            </p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
