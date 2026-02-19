import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Target, TrendingUp, Zap, Clock } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="font-heading font-bold text-3xl md:text-4xl mb-6" data-testid="text-page-title">About Deal Flow</h1>

        <div className="prose prose-slate max-w-none space-y-6">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Deal Flow helps shoppers discover the best verified deals, promo codes, and limited-time discounts online.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose my-8">
            <div className="flex items-start gap-3 p-4 rounded-xl border bg-slate-50">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><TrendingUp className="w-5 h-5" /></div>
              <div>
                <h3 className="font-heading font-semibold text-sm">Highlighting Trending Deals</h3>
                <p className="text-sm text-muted-foreground mt-1">Stay ahead with the hottest deals our community is using.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl border bg-slate-50">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><Zap className="w-5 h-5" /></div>
              <div>
                <h3 className="font-heading font-semibold text-sm">Surfacing Exclusive Promotions</h3>
                <p className="text-sm text-muted-foreground mt-1">Access slot-based deals with limited availability.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl border bg-slate-50">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><Target className="w-5 h-5" /></div>
              <div>
                <h3 className="font-heading font-semibold text-sm">Updating Offers Daily</h3>
                <p className="text-sm text-muted-foreground mt-1">We verify and curate deals so you only see genuine savings.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl border bg-slate-50">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><Clock className="w-5 h-5" /></div>
              <div>
                <h3 className="font-heading font-semibold text-sm">Saving Time & Money</h3>
                <p className="text-sm text-muted-foreground mt-1">Everything in one place so you spend less time hunting for deals.</p>
              </div>
            </div>
          </div>

          <p>Deal Flow does not sell products directly. All purchases are completed through third-party merchant websites.</p>
          <p>We may earn commissions through affiliate partnerships at no additional cost to users.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
