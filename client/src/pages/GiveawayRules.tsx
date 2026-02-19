import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function GiveawayRules() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="font-heading font-bold text-3xl md:text-4xl mb-2" data-testid="text-page-title">Deal Flow Referral Giveaway – Official Rules</h1>
        <p className="text-sm text-muted-foreground mb-8">Effective Date: February 16, 2026 | Sponsor: Deal Flow</p>

        <div className="prose prose-slate max-w-none space-y-8">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 not-prose">
            <p className="font-bold text-center text-lg">NO PURCHASE NECESSARY TO ENTER OR WIN</p>
            <p className="text-sm text-center text-muted-foreground mt-2">A purchase does not increase your chances of winning.</p>
          </div>

          <p>This Promotion is sponsored by Deal Flow ("Sponsor"). This Promotion is not sponsored, endorsed, administered by, or associated with Amazon or any third-party platform.</p>
          <p>By participating, you agree to these Official Rules.</p>

          <section>
            <h2 className="font-heading font-semibold text-xl">1. Eligibility</h2>
            <p>Open to legal residents of eligible jurisdictions who are at least 18 years old at the time of entry. Void where prohibited by law.</p>
            <p>Employees and affiliates of Sponsor are not eligible.</p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-xl">2. Promotion Period</h2>
            <p>The Promotion runs in recurring 14-day periods.</p>
            <p>One winner is selected at the end of each 14-day period.</p>
            <p>Sponsor's server time is the official timekeeping device.</p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-xl">3. How to Enter</h2>
            <h3 className="font-heading font-semibold text-lg mt-4">A) Referral Entry</h3>
            <p>Registered users receive one (1) entry for each new user who signs up using their personal referral link during the Promotion Period.</p>
            <p>Only legitimate new accounts qualify.</p>
            <p>Duplicate, fake, automated, or self-referrals are prohibited.</p>

            <h3 className="font-heading font-semibold text-lg mt-4">B) Free Alternative Method of Entry (AMOE)</h3>
            <p>To enter without making referrals, participants may submit a free entry request through the contact form on this website with the subject line:</p>
            <p className="font-bold">"Free Entry Request"</p>
            <p>Limit one (1) free entry per person per Promotion Period.</p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-xl">4. Prize</h2>
            <p>One (1) winner per Promotion Period will receive:</p>
            <p className="font-bold text-lg">$25 USD (cash or digital equivalent)</p>
            <p>Prize delivery method is determined by Sponsor.</p>
            <p>Prize is non-transferable.</p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-xl">5. Winner Selection</h2>
            <p>Winner is selected at random from all eligible entries received during the Promotion Period.</p>
            <p>Odds depend on the number of eligible entries.</p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-xl">6. General Conditions</h2>
            <p>Sponsor reserves the right to disqualify fraudulent or abusive participants.</p>
            <p>Sponsor may modify, suspend, or terminate the Promotion if necessary.</p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-xl">7. Privacy</h2>
            <p>Participation is subject to the <a href="/privacy" className="text-primary hover:underline">Deal Flow Privacy Policy</a>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
