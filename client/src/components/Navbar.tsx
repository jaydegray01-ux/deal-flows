import { Link, useLocation } from "wouter";
import { Search, ShoppingBag, Menu, LogIn, LogOut, Shield, ChevronDown, User, DollarSign } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function Navbar() {
  const [location] = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: categoryTree } = useQuery({
    queryKey: ['categoryTree'],
    queryFn: () => api.getCategoryTree(),
  });

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-heading font-bold text-2xl tracking-tighter text-primary shrink-0">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
            <ShoppingBag size={20} fill="currentColor" />
          </div>
          DealFlow
        </Link>

        <div className="hidden md:flex flex-1 max-w-md relative mx-4">
          <Input 
            type="search" 
            placeholder="Search for deals..." 
            className="w-full pl-10 bg-muted/50 border-transparent focus:bg-background focus:border-primary/50 transition-all rounded-full"
            data-testid="input-search"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSearchOpen(!isSearchOpen)}>
            <Search className="w-5 h-5" />
          </Button>

          {isAdmin && (
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="hidden md:flex gap-2" data-testid="link-admin">
                <Shield className="w-4 h-4" />
                Admin
              </Button>
            </Link>
          )}
          
          {user && !isAdmin && (
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="hidden md:flex gap-2" data-testid="link-dashboard">
                <User className="w-4 h-4" />
                Dashboard
              </Button>
            </Link>
          )}

          {user ? (
            <Button size="sm" variant="outline" className="hidden md:flex gap-2 rounded-full font-medium" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          ) : (
            <Link href="/auth">
              <Button size="sm" className="hidden md:flex gap-2 rounded-full font-medium" data-testid="link-signin">
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
            </Link>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-4 mt-8">
                <Input type="search" placeholder="Search..." />
                <div className="flex flex-col gap-1">
                  <Link href="/deals"><Button variant="ghost" className="justify-start w-full">All Deals</Button></Link>
                  {(categoryTree || []).filter((cat: any) => cat.slug !== "save-earn").map((cat: any) => (
                    <div key={cat.id}>
                      <Link href={`/c/${cat.slug}`}>
                        <Button variant="ghost" className="justify-start w-full font-medium">{cat.name}</Button>
                      </Link>
                      {cat.children?.map((sub: any) => (
                        <Link key={sub.id} href={`/c/${cat.slug}/${sub.slug}`}>
                          <Button variant="ghost" className="justify-start w-full pl-8 text-muted-foreground text-sm">{sub.name}</Button>
                        </Link>
                      ))}
                    </div>
                  ))}
                  <div className="border-t my-2" />
                  <Link href="/save-earn">
                    <Button variant="ghost" className="justify-start w-full font-medium text-emerald-600 gap-2">
                      <DollarSign className="w-4 h-4" />
                      Save & Earn
                    </Button>
                  </Link>
                  {(categoryTree || []).find((cat: any) => cat.slug === "save-earn")?.children?.map((sub: any) => (
                    <Link key={sub.id} href={`/c/save-earn/${sub.slug}`}>
                      <Button variant="ghost" className="justify-start w-full pl-8 text-muted-foreground text-sm">{sub.name}</Button>
                    </Link>
                  ))}
                  {isAdmin && (
                    <Link href="/admin"><Button variant="ghost" className="justify-start w-full">Admin Dashboard</Button></Link>
                  )}
                </div>
                <div className="border-t pt-4 mt-auto">
                  {user ? (
                    <Button className="w-full" variant="outline" onClick={handleLogout}>Sign Out</Button>
                  ) : (
                    <Link href="/auth">
                      <Button className="w-full">Sign In</Button>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="hidden md:block border-t bg-muted/30">
        <div className="container mx-auto px-4">
          <div
            ref={scrollRef}
            className="flex items-center gap-0 overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <Link
              href="/deals"
              className={`text-sm font-medium whitespace-nowrap px-4 py-2.5 border-b-2 transition-colors shrink-0 ${
                location === "/deals"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
              }`}
              data-testid="nav-all-deals"
            >
              All Deals
            </Link>
            {(categoryTree || []).filter((cat: any) => cat.slug !== "save-earn").map((cat: any) => (
              <div key={cat.id} className="relative group shrink-0">
                <Link
                  href={`/c/${cat.slug}`}
                  className={`text-sm font-medium whitespace-nowrap px-4 py-2.5 border-b-2 transition-colors flex items-center gap-1 ${
                    location.startsWith(`/c/${cat.slug}`)
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                  }`}
                  data-testid={`nav-category-${cat.slug}`}
                >
                  {cat.name}
                  {cat.children?.length > 0 && <ChevronDown className="w-3 h-3" />}
                </Link>
                {cat.children?.length > 0 && (
                  <div className="absolute top-full left-0 mt-0 bg-white border rounded-lg shadow-lg py-2 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    {cat.children.map((sub: any) => (
                      <Link
                        key={sub.id}
                        href={`/c/${cat.slug}/${sub.slug}`}
                        className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                        data-testid={`nav-subcategory-${sub.slug}`}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="shrink-0 w-px h-6 bg-border mx-1 self-center" />

            {(() => {
              const saveEarn = (categoryTree || []).find((cat: any) => cat.slug === "save-earn");
              if (!saveEarn) return null;
              return (
                <div className="relative group shrink-0">
                  <Link
                    href="/save-earn"
                    className={`text-sm font-semibold whitespace-nowrap px-4 py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                      location.startsWith("/save-earn") || location.startsWith("/c/save-earn")
                        ? "border-emerald-500 text-emerald-600"
                        : "border-transparent text-emerald-600 hover:text-emerald-700 hover:border-emerald-300"
                    }`}
                    data-testid="nav-save-earn"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    Save & Earn
                    <ChevronDown className="w-3 h-3" />
                  </Link>
                  <div className="absolute top-full right-0 mt-0 bg-white border rounded-lg shadow-lg py-2 min-w-[220px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    {saveEarn.children?.map((sub: any) => (
                      <Link
                        key={sub.id}
                        href={`/c/save-earn/${sub.slug}`}
                        className="block px-4 py-2 text-sm text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        data-testid={`nav-subcategory-${sub.slug}`}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </nav>
  );
}
