import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AffiliateDisclosure() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="font-heading font-bold text-3xl md:text-4xl mb-2" data-testid="text-page-title">Affiliate Disclosure</h1>
        <p className="text-sm text-muted-foreground mb-8">Effective Date: February 16, 2026</p>

        <div className="prose prose-slate max-w-none space-y-6">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Deal Flow participates in affiliate marketing programs.
          </p>

          <p>This means we may earn a commission if you click on certain links and make a purchase, at no additional cost to you.</p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 not-prose">
            <h3 className="font-heading font-semibold text-amber-900 mb-2">Amazon Associate Disclosure</h3>
            <p className="text-sm text-amber-800">
              As an Amazon Associate, we earn from qualifying purchases. Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates.
            </p>
          </div>

          <p>We may also participate in additional affiliate programs including third-party affiliate networks and direct brand partnerships.</p>

          <p>All purchases are completed on third-party merchant websites. Deal Flow is not responsible for pricing changes, product availability, shipping, or merchant policies.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
