import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Check, Copy, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RevealCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: any;
}

export default function RevealCodeModal({ isOpen, onClose, deal }: RevealCodeModalProps) {
  const [step, setStep] = useState<"verifying" | "revealed" | "error">("verifying");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setStep("verifying");
      const timer = setTimeout(() => {
        if (deal.type === "SLOT" && deal.remainingSlots === 0) {
            setStep("error");
        } else {
            setStep("revealed");
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, deal]);

  const handleCopy = () => {
    navigator.clipboard.writeText(deal.promoCode || "");
    setCopied(true);
    toast({
      title: "Code Copied!",
      description: "Paste it at checkout to save.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'store';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {step === "verifying" && "Verifying Deal..."}
            {step === "revealed" && "Here's your code!"}
            {step === "error" && "Deal Unavailable"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 flex flex-col items-center justify-center space-y-4">
          {step === "verifying" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                We're checking deal availability and preparing your exclusive code.
              </p>
            </>
          )}

          {step === "error" && (
            <>
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
                 <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-center font-medium text-lg">Sold Out!</p>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Sorry, all exclusive slots for this deal have been claimed.
              </p>
              <Button variant="outline" onClick={onClose} className="mt-4">Close</Button>
            </>
          )}

          {step === "revealed" && (
            <>
              <div className="w-full bg-muted/50 p-6 rounded-xl border border-dashed border-primary/30 flex flex-col items-center gap-4">
                <p className="text-sm font-medium text-muted-foreground">
                  {deal.promoCode ? "Copy this code at checkout:" : "No code needed - click below to get the deal:"}
                </p>
                
                {deal.promoCode && (
                  <div className="flex items-center gap-2 w-full">
                    <div className="relative flex-1">
                      <div className="absolute inset-0 bg-primary/5 rounded-md border border-primary/20 flex items-center justify-center font-mono text-xl font-bold text-primary tracking-wider">
                        {deal.promoCode}
                      </div>
                      <Input className="opacity-0 pointer-events-none" value={deal.promoCode} readOnly />
                    </div>
                    <Button size="icon" onClick={handleCopy} className={copied ? "bg-green-600 hover:bg-green-700" : ""}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                )}
              </div>

              <div className="w-full space-y-2">
                <Button className="w-full gap-2" size="lg" onClick={() => window.open(deal.affiliateLink, '_blank')}>
                  Go to {getHostname(deal.affiliateLink)} <ExternalLink className="w-4 h-4" />
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Clicking will open the product page in a new tab.
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
