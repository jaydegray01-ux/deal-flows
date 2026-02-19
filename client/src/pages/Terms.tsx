import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="font-heading font-bold text-3xl md:text-4xl mb-2" data-testid="text-page-title">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Effective Date: February 16, 2026</p>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="font-heading font-semibold text-xl">1. Acceptance of Terms</h2>
            <p>By accessing and using this website, you agree to be bound by these Terms of Service. If you do not agree, do not use this site.</p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-xl">2. Nature of the Website</h2>
            <p>DealFlow is a deal and coupon platform that aggregates and promotes promotional offers from third-party merchants.</p>
            <p>We do not sell products directly. All purchases are completed on third-party websites.</p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-xl">3. Affiliate Disclosure</h2>
            <p>Some links on this website are affiliate links. This means we may earn a commission if you click a link and make a purchase, at no additional cost to you.</p>
            <p>As an Amazon Associate, we earn from qualifying purchases.</p>
            <p>We may also participate in other affiliate programs including but not limited to ShareASale, Impact, CJ Affiliate, and other merchant programs.</p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-xl">4. Deal Accuracy</h2>
            <p>We attempt to ensure all deals and promo codes are accurate. However:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Prices may change without notice.</li>
              <li>Promo codes may expire.</li>
              <li>Availability may vary.</li>
              <li>We do not guarantee that any code or offer will work.</li>
            </ul>
            <p>We are not responsible for pricing errors or expired promotions.</p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-xl">5. User Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Attempt to exploit limited-claim deals.</li>
              <li>Abuse promo codes.</li>
              <li>Use bots or automated systems.</li>
              <li>Attempt unauthorized access to admin areas.</li>
              <li>Scrape or copy site content without permission.</li>
            </ul>
            <p>We reserve the right to restrict or terminate access for abuse.</p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-xl">6. Limitation of Liability</h2>
            <p>DealFlow is not responsible for:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Third-party product quality.</li>
              <li>Shipping delays.</li>
              <li>Refund issues.</li>
              <li>Damages resulting from purchases made via third-party sites.</li>
            </ul>
            <p>All transactions occur between you and the merchant.</p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-xl">7. Modifications</h2>
            <p>We may update these Terms at any time. Continued use of the site constitutes acceptance of the updated Terms.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
