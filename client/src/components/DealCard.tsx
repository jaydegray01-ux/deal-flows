import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Ticket, Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

interface DealCardProps {
  deal: any;
}

export default function DealCard({ deal }: DealCardProps) {
  const isSlot = deal.type === "SLOT";
  const isSoldOut = deal.status === "SOLD_OUT";
  const originalPrice = parseFloat(deal.originalPrice || deal.original_price || "0");
  const dealPrice = parseFloat(deal.dealPrice || deal.deal_price || "0");
  const discountPercent = deal.discountPercent || deal.discount_percent || 0;
  const remainingSlots = deal.remainingSlots ?? deal.remaining_slots;
  const totalSlots = deal.totalSlots ?? deal.total_slots;
  const imageUrl = deal.imageUrl || deal.image_url;
  const isFeatured = deal.isFeatured ?? deal.is_featured;
  const expirationDate = deal.expirationDate || deal.expiration_date;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 bg-card h-full flex flex-col" data-testid={`card-deal-${deal.id}`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {isFeatured && (
          <div className="absolute top-2 left-2 z-10">
            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-none shadow-sm">
              Featured
            </Badge>
          </div>
        )}
        {isSlot && (
          <div className="absolute top-2 right-2 z-10">
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200 shadow-sm gap-1">
              <Lock className="w-3 h-3" /> Exclusive Slot
            </Badge>
          </div>
        )}
        
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={deal.title} 
            className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground/30">
            {deal.title?.[0] || "D"}
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <Link href={`/deals/${deal.slug}`}>
            <Button variant="secondary" size="sm" className="font-medium shadow-md" data-testid={`button-view-${deal.id}`}>
              View Details
            </Button>
          </Link>
        </div>
      </div>

      <CardContent className="p-4 flex-1 flex flex-col gap-2">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{deal.type}</span>
          <Link href={`/deals/${deal.slug}`}>
            <h3 className="font-heading font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors cursor-pointer">
              {deal.title}
            </h3>
          </Link>
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          {dealPrice > 0 && <span className="text-2xl font-bold text-primary">${dealPrice.toFixed(2)}</span>}
          {originalPrice > 0 && <span className="text-sm text-muted-foreground line-through">${originalPrice.toFixed(2)}</span>}
          {discountPercent > 0 && (
            <Badge variant="destructive" className="ml-auto text-xs font-bold px-1.5 py-0.5 h-auto">
              -{discountPercent}%
            </Badge>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
          {deal.description}
        </p>

        {isSlot && remainingSlots !== undefined && remainingSlots !== null && (
          <div className="mt-auto pt-4">
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-orange-600 flex items-center gap-1">
                <Ticket className="w-3 h-3" />
                {remainingSlots} slots left
              </span>
              <span className="text-muted-foreground">
                {totalSlots} total
              </span>
            </div>
            <div className="h-1.5 w-full bg-orange-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 rounded-full" 
                style={{ width: `${(remainingSlots / (totalSlots || 1)) * 100}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 border-t bg-muted/20 mt-auto flex items-center justify-between text-xs text-muted-foreground">
        {expirationDate ? (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Ends {formatDistanceToNow(new Date(expirationDate), { addSuffix: true })}</span>
          </div>
        ) : (
          <span>No expiry</span>
        )}
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>{deal.type}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
