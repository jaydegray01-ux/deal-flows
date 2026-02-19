import { Button } from "@/components/ui/button";
import { RotateCcw, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Link } from "wouter";

interface DealFiltersProps {
  filters: any;
  setFilters: (filters: any) => void;
}

export default function DealFilters({ filters, setFilters }: DealFiltersProps) {
  const { data: categoryTree } = useQuery({
    queryKey: ['categoryTree'],
    queryFn: () => api.getCategoryTree()
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading font-semibold mb-4">Categories</h3>
        <div className="space-y-1">
          {(categoryTree || []).map((category: any) => (
            <div key={category.id}>
              <Link href={`/c/${category.slug}`}>
                <div className="flex items-center justify-between cursor-pointer hover:text-primary transition-colors py-1.5 px-2 rounded-md hover:bg-muted">
                  <span className="text-sm font-medium">{category.name}</span>
                  {category.children?.length > 0 && (
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  )}
                </div>
              </Link>
              {category.children?.length > 0 && (
                <div className="ml-4 space-y-0.5">
                  {category.children.map((sub: any) => (
                    <Link key={sub.id} href={`/c/${category.slug}/${sub.slug}`}>
                      <div className="cursor-pointer hover:text-primary transition-colors py-1 px-2 rounded-md hover:bg-muted">
                        <span className="text-sm text-muted-foreground">{sub.name}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-heading font-semibold mb-4">Deal Type</h3>
        <div className="space-y-1">
          <Link href="/deals">
            <div className="cursor-pointer hover:text-primary transition-colors py-1.5 px-2 rounded-md hover:bg-muted">
              <span className="text-sm font-medium">All Deals</span>
            </div>
          </Link>
          <Link href="/deals?type=AFFILIATE">
            <div className="cursor-pointer hover:text-primary transition-colors py-1.5 px-2 rounded-md hover:bg-muted">
              <span className="text-sm font-medium">Affiliate Deals</span>
            </div>
          </Link>
          <Link href="/deals?type=SLOT">
            <div className="cursor-pointer hover:text-primary transition-colors py-1.5 px-2 rounded-md hover:bg-muted">
              <span className="text-sm font-medium text-orange-500">Exclusive Slot Deals</span>
            </div>
          </Link>
        </div>
      </div>

      <div className="border-t pt-6">
         <Link href="/deals">
           <Button variant="outline" className="w-full gap-2">
              <RotateCcw className="w-4 h-4" /> Reset Filters
           </Button>
         </Link>
      </div>
    </div>
  );
}
