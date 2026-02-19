import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const { toast } = useToast();

  const { data: categoryTree } = useQuery({
    queryKey: ['categoryTree'],
    queryFn: () => api.getCategoryTree(),
  });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    try {
      await api.subscribe(email);
      toast({ title: "Subscribed!", description: "You'll receive the latest deals in your inbox." });
      setEmail("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not subscribe.", variant: "destructive" });
    } finally {
      setSubscribing(false);
    }
  };

  const cats = categoryTree || [];
  const half = Math.ceil(cats.length / 2);
  const col1 = cats.slice(0, half);
  const col2 = cats.slice(half);

  return (
    <footer className="bg-slate-50 border-t mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-1">
            <Link href="/" className="font-heading font-bold text-xl tracking-tighter text-primary mb-4 block">
              DealFlow
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Discover the best deals and exclusive promo codes for your favorite brands. Join thousands of smart shoppers today.
            </p>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {col1.map((cat: any) => (
                <li key={cat.id}>
                  <Link href={`/c/${cat.slug}`} className="hover:text-primary transition-colors" data-testid={`footer-category-${cat.slug}`}>
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">&nbsp;</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {col2.map((cat: any) => (
                <li key={cat.id}>
                  <Link href={`/c/${cat.slug}`} className="hover:text-primary transition-colors" data-testid={`footer-category-${cat.slug}`}>
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/affiliate-disclosure" className="hover:text-primary transition-colors">Affiliate Disclosure</Link></li>
              <li><Link href="/giveaway-rules" className="hover:text-primary transition-colors">Giveaway Rules</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">Subscribe</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Get the latest deals sent straight to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-white border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                data-testid="input-footer-email"
              />
              <button 
                type="submit"
                disabled={subscribing}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                data-testid="button-footer-subscribe"
              >
                {subscribing ? "..." : "Join"}
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-6 text-xs text-muted-foreground space-y-4">
          <p className="text-center leading-relaxed max-w-2xl mx-auto">
            Disclosure: Deal Flow contains affiliate links. We may earn a commission if you purchase through our links at no additional cost to you. As an Amazon Associate, we earn from qualifying purchases. No purchase necessary for referral giveaway participation.
          </p>
          <div className="flex flex-col md:flex-row justify-between items-center pt-2">
            <p>&copy; {new Date().getFullYear()} DealFlow. All rights reserved.</p>
            <div className="flex gap-4 mt-2 md:mt-0">
              <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="/affiliate-disclosure" className="hover:text-primary transition-colors">Disclosure</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
