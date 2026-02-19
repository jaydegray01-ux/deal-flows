import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="font-heading font-bold text-3xl md:text-4xl mb-2" data-testid="text-page-title">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Effective Date: February 16, 2026</p>

        <div className="prose prose-slate max-w-none space-y-8">
          <p>Deal Flow collects limited information to operate and improve the website.</p>

          <section>
            <h2 className="font-heading font-semibold text-xl">Information We May Collect</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Email address (if you register or subscribe)</li>
              <li>IP address</li>
              <li>Browser and device information</li>
              <li>Pages visited</li>
              <li>Deal interactions (clicks, votes, claims)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-xl">How We Use Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To improve site functionality</li>
              <li>To prevent fraud or abuse</li>
              <li>To track deal performance</li>
              <li>To operate referral and giveaway systems</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-xl">Affiliate Tracking</h2>
            <p>When you click affiliate links, third-party networks may use cookies to track referrals.</p>
            <p>We do not control third-party tracking technologies.</p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-xl">Cookies</h2>
            <p>We may use cookies to improve performance and user experience.</p>
            <p>You can disable cookies through your browser settings.</p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-xl">Data Security</h2>
            <p>We implement reasonable safeguards but cannot guarantee absolute security.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
