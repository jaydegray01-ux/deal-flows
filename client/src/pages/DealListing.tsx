import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DealCard from "@/components/DealCard";
import DealFilters from "@/components/DealFilters";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter, ChevronRight, Home } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRoute, useSearch, Link } from "wouter";

export default function DealListing() {
  const [, categoryParams] = useRoute("/c/:slug");
  const [, subParams] = useRoute("/c/:slug/:sub");
  
  const categorySlug = subParams?.slug || categoryParams?.slug;
  const subcategorySlug = subParams?.sub;

  const searchParams = useSearch();
  const urlParams = new URLSearchParams(searchParams);
  const typeFilter = urlParams.get("type") || undefined;

  const [sort, setSort] = useState("newest");
  const [filters, setFilters] = useState({});

  const { data: parentCategory } = useQuery({
    queryKey: ['category', categorySlug],
    queryFn: () => api.getCategoryBySlug(categorySlug!),
    enabled: !!categorySlug,
  });

  const { data: subCategory } = useQuery({
    queryKey: ['category', subcategorySlug],
    queryFn: () => api.getCategoryBySlug(subcategorySlug!),
    enabled: !!subcategorySlug,
  });

  const activeCategoryId = subcategorySlug 
    ? subCategory?.id 
    : parentCategory?.id;

  const { data, isLoading } = useQuery({ 
    queryKey: ['deals', categorySlug, subcategorySlug, typeFilter, sort, activeCategoryId], 
    queryFn: () => {
      const params: Record<string, string> = { sort };
      if (activeCategoryId) params.categoryId = activeCategoryId;
      if (typeFilter) params.type = typeFilter;
      return api.getDeals(params);
    },
    enabled: !categorySlug || !!activeCategoryId,
  });

  const deals = data?.deals || [];
  
  const title = subcategorySlug
    ? subCategory?.name || "Subcategory"
    : categorySlug
    ? parentCategory?.name || "Category"
    : typeFilter === "SLOT" ? "Exclusive Slot Deals" : "All Deals";

  const subcategories = parentCategory?.children || [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {categorySlug && (
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" data-testid="breadcrumbs">
            <Link href="/" className="hover:text-primary transition-colors">
              <Home className="w-4 h-4" />
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/deals" className="hover:text-primary transition-colors">
              Deals
            </Link>
            <ChevronRight className="w-3 h-3" />
            {subcategorySlug ? (
              <>
                <Link href={`/c/${categorySlug}`} className="hover:text-primary transition-colors">
                  {parentCategory?.name || categorySlug}
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground font-medium">{subCategory?.name || subcategorySlug}</span>
              </>
            ) : (
              <span className="text-foreground font-medium">{parentCategory?.name || categorySlug}</span>
            )}
          </nav>
        )}

        {categorySlug && subcategories.length > 0 && !subcategorySlug && (
          <div className="flex flex-wrap gap-2 mb-6" data-testid="subcategory-pills">
            <Link href={`/c/${categorySlug}`}>
              <Button variant="secondary" size="sm" className="rounded-full font-medium">
                All {parentCategory?.name}
              </Button>
            </Link>
            {subcategories.map((sub: any) => (
              <Link key={sub.id} href={`/c/${categorySlug}/${sub.slug}`}>
                <Button variant="outline" size="sm" className="rounded-full" data-testid={`pill-subcategory-${sub.slug}`}>
                  {sub.name}
                </Button>
              </Link>
            ))}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <h2 className="font-heading font-bold text-xl mb-6">Filters</h2>
              <DealFilters filters={filters} setFilters={setFilters} />
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="font-heading font-bold text-3xl" data-testid="text-page-title">{title}</h1>
                <p className="text-muted-foreground">Showing {deals.length} results</p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="md:hidden flex-1 gap-2">
                      <Filter className="w-4 h-4" /> Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <div className="mt-6">
                      <DealFilters filters={filters} setFilters={setFilters} />
                    </div>
                  </SheetContent>
                </Sheet>

                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-[180px]" data-testid="select-sort">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest Arrivals</SelectItem>
                    <SelectItem value="trending">Trending Now</SelectItem>
                    <SelectItem value="ending">Ending Soon</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[1,2,3,4,5,6].map(i => (
                   <div key={i} className="h-[400px] bg-muted animate-pulse rounded-xl" />
                 ))}
               </div>
            ) : deals.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {deals.map((deal: any) => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-lg">No deals found.</p>
                <p className="text-sm mt-2">Try adjusting your filters or check back later.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
