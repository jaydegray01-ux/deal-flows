import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="font-heading font-bold text-3xl md:text-4xl mb-6" data-testid="text-page-title">Contact Deal Flow</h1>

        <div className="space-y-6">
          <div className="flex items-start gap-4 p-6 rounded-xl border bg-slate-50">
            <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0"><Mail className="w-5 h-5" /></div>
            <div>
              <h3 className="font-heading font-semibold mb-1">General Inquiries & Business Partnerships</h3>
              <p className="text-sm text-muted-foreground mb-2">For questions, feedback, support, or business partnerships, please use the contact form on this website.</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center pt-4">We aim to respond within 48 business hours.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
