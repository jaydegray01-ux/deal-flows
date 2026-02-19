import { useState, useEffect } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Loader2, Search, Link as LinkIcon, Save, ArrowLeft, Tag, X, Wand2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useParams } from "wouter";
import AIContentAssistant from "@/components/AIContentAssistant";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function AdminDealForm() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const dealId = params?.id;
  const isEditing = !!dealId;
  const [tagInput, setTagInput] = useState("");
  const [scrapeUrl, setScrapeUrl] = useState("");

  const [form, setForm] = useState({
    type: "AFFILIATE",
    title: "",
    slug: "",
    description: "",
    imageUrl: "",
    originalPrice: "",
    dealPrice: "",
    discountPercent: "",
    promoCode: "",
    affiliateLink: "",
    expirationDate: "",
    status: "ACTIVE",
    isFeatured: false,
    totalSlots: "",
    remainingSlots: "",
    categoryId: "",
    brand: "",
    seoTitle: "",
    metaDescription: "",
    tags: [] as string[],
  });

  const { data: existingDeal, isLoading: loadingDeal } = useQuery({
    queryKey: ['admin-deal', dealId],
    queryFn: () => api.getAdminDeal(dealId!),
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingDeal) {
      setForm({
        type: existingDeal.type || "AFFILIATE",
        title: existingDeal.title || "",
        slug: existingDeal.slug || "",
        description: existingDeal.description || "",
        imageUrl: existingDeal.imageUrl || existingDeal.image_url || "",
        originalPrice: existingDeal.originalPrice || existingDeal.original_price || "",
        dealPrice: existingDeal.dealPrice || existingDeal.deal_price || "",
        discountPercent: existingDeal.discountPercent?.toString() || existingDeal.discount_percent?.toString() || "",
        promoCode: existingDeal.promoCode || existingDeal.promo_code || "",
        affiliateLink: existingDeal.affiliateLink || existingDeal.affiliate_link || "",
        expirationDate: existingDeal.expirationDate?.split("T")[0] || existingDeal.expiration_date?.split("T")[0] || "",
        status: existingDeal.status || "ACTIVE",
        isFeatured: existingDeal.isFeatured ?? existingDeal.is_featured ?? false,
        totalSlots: existingDeal.totalSlots?.toString() || existingDeal.total_slots?.toString() || "",
        remainingSlots: existingDeal.remainingSlots?.toString() || existingDeal.remaining_slots?.toString() || "",
        categoryId: existingDeal.categoryId || existingDeal.category_id || "",
        brand: existingDeal.brand || "",
        seoTitle: existingDeal.seoTitle || existingDeal.seo_title || "",
        metaDescription: existingDeal.metaDescription || existingDeal.meta_description || "",
        tags: existingDeal.tags || [],
      });
    }
  }, [existingDeal]);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories()
  });

  const scrapeMutation = useMutation({
    mutationFn: (url: string) => api.scrapeProduct(url),
    onSuccess: (data: any) => {
      if (data.success) {
        setForm(prev => ({
          ...prev,
          title: data.title || prev.title,
          slug: data.title ? slugify(data.title) : prev.slug,
          description: data.description || prev.description,
          imageUrl: data.imageUrl || prev.imageUrl,
          dealPrice: data.price?.toString() || prev.dealPrice,
          originalPrice: data.originalPrice?.toString() || prev.originalPrice,
          brand: data.brand || prev.brand,
          affiliateLink: scrapeUrl || prev.affiliateLink,
        }));
        toast({ title: "Product data loaded!", description: "Form fields auto-filled from the URL." });
      } else {
        toast({ title: "Partial data", description: "Could not extract all product details. Fill in manually.", variant: "destructive" });
      }
    },
    onError: () => {
      toast({ title: "Scrape failed", description: "Could not fetch product data. Try a different URL.", variant: "destructive" });
    }
  });

  const saveMutation = useMutation({
    mutationFn: (deal: any) => isEditing ? api.updateDeal(dealId!, deal) : api.createDeal(deal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-deals'] });
      queryClient.invalidateQueries({ queryKey: ['admin-deal', dealId] });
      toast({ title: isEditing ? "Deal updated!" : "Deal created!", description: isEditing ? "Your changes have been saved." : "Your deal has been published." });
      navigate("/admin/deals");
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      ...form,
      originalPrice: form.originalPrice || null,
      dealPrice: form.dealPrice || null,
      discountPercent: form.discountPercent ? parseInt(form.discountPercent) : null,
      totalSlots: form.totalSlots ? parseInt(form.totalSlots) : null,
      remainingSlots: form.remainingSlots ? parseInt(form.remainingSlots) : null,
      expirationDate: form.expirationDate || null,
      categoryId: form.categoryId || null,
      imageUrl: form.imageUrl || null,
    };
    saveMutation.mutate(payload);
  };

  const update = (key: string, value: any) => {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      if (key === "title" && !isEditing && !prev.slug) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  if (isEditing && loadingDeal) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/deals")} data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{isEditing ? "Edit Deal" : "Create New Deal"}</h2>
            <p className="text-muted-foreground">{isEditing ? "Update deal details below." : "Fill in the details or paste a product URL to auto-fill."}</p>
          </div>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Auto-Fill from Product URL
            </CardTitle>
            <CardDescription>Paste a product URL from Amazon, Shopify, or any store to auto-fill the form.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="https://www.amazon.com/product/..."
                  value={scrapeUrl}
                  onChange={(e) => setScrapeUrl(e.target.value)}
                  className="pl-9 h-11"
                  data-testid="input-scrape-url"
                />
              </div>
              <Button
                onClick={() => scrapeMutation.mutate(scrapeUrl)}
                disabled={!scrapeUrl || scrapeMutation.isPending}
                className="gap-2 h-11 px-6"
                data-testid="button-scrape"
              >
                {scrapeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {scrapeMutation.isPending ? "Fetching..." : "Fetch Data"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full justify-start bg-muted/50 h-auto p-1 rounded-lg">
              <TabsTrigger value="details" className="data-[state=active]:bg-white">Deal Details</TabsTrigger>
              <TabsTrigger value="pricing" className="data-[state=active]:bg-white">Pricing & Slots</TabsTrigger>
              <TabsTrigger value="seo" className="data-[state=active]:bg-white">SEO & Tags</TabsTrigger>
              <TabsTrigger value="ai" className="data-[state=active]:bg-white flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5" /> AI Assistant
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Deal Type</Label>
                      <Select value={form.type} onValueChange={(v) => update("type", v)}>
                        <SelectTrigger data-testid="select-deal-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AFFILIATE">Affiliate Deal</SelectItem>
                          <SelectItem value="SLOT">Exclusive Slot Deal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={form.categoryId} onValueChange={(v) => update("categoryId", v)}>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriesData?.map((cat: any) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g., 50% Off Premium Headphones" data-testid="input-title" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>URL Slug</Label>
                      <Input value={form.slug} onChange={(e) => update("slug", e.target.value)} placeholder="auto-generated-from-title" data-testid="input-slug" />
                    </div>
                    <div className="space-y-2">
                      <Label>Brand</Label>
                      <Input value={form.brand} onChange={(e) => update("brand", e.target.value)} placeholder="e.g., Sony" data-testid="input-brand" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe the deal..." rows={4} data-testid="input-description" />
                  </div>

                  <div className="space-y-2">
                    <Label>Image URL</Label>
                    <div className="flex gap-3 items-start">
                      <Input value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} placeholder="https://..." className="flex-1" data-testid="input-image-url" />
                      {form.imageUrl && (
                        <img src={form.imageUrl} alt="Preview" className="w-16 h-16 object-cover rounded-md border" />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Affiliate / Product Link</Label>
                      <Input value={form.affiliateLink} onChange={(e) => update("affiliateLink", e.target.value)} placeholder="https://..." data-testid="input-affiliate-link" />
                    </div>
                    <div className="space-y-2">
                      <Label>Promo Code</Label>
                      <Input value={form.promoCode} onChange={(e) => update("promoCode", e.target.value)} placeholder="e.g., SAVE50" data-testid="input-promo-code" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Switch checked={form.isFeatured} onCheckedChange={(v) => update("isFeatured", v)} data-testid="switch-featured" />
                    <Label className="font-normal">Featured Deal (shows on homepage)</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4 mt-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Original Price ($)</Label>
                      <Input type="number" step="0.01" value={form.originalPrice} onChange={(e) => update("originalPrice", e.target.value)} placeholder="99.99" data-testid="input-original-price" />
                    </div>
                    <div className="space-y-2">
                      <Label>Deal Price ($)</Label>
                      <Input type="number" step="0.01" value={form.dealPrice} onChange={(e) => update("dealPrice", e.target.value)} placeholder="49.99" data-testid="input-deal-price" />
                    </div>
                    <div className="space-y-2">
                      <Label>Discount %</Label>
                      <Input type="number" value={form.discountPercent} onChange={(e) => update("discountPercent", e.target.value)} placeholder="50" data-testid="input-discount" />
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={form.status} onValueChange={(v) => update("status", v)}>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="EXPIRED">Expired</SelectItem>
                          <SelectItem value="SOLD_OUT">Sold Out</SelectItem>
                          <SelectItem value="DISABLED">Disabled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Expiration Date</Label>
                      <Input type="date" value={form.expirationDate} onChange={(e) => update("expirationDate", e.target.value)} data-testid="input-expiration" />
                    </div>
                  </div>

                  {form.type === "SLOT" && (
                    <>
                      <Separator className="my-4" />
                      <h3 className="text-base font-semibold">Exclusive Slot Settings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Total Slots</Label>
                          <Input type="number" value={form.totalSlots} onChange={(e) => update("totalSlots", e.target.value)} placeholder="100" data-testid="input-total-slots" />
                        </div>
                        <div className="space-y-2">
                          <Label>Remaining Slots</Label>
                          <Input type="number" value={form.remainingSlots} onChange={(e) => update("remainingSlots", e.target.value)} placeholder="100" data-testid="input-remaining-slots" />
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4 mt-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label>SEO Title</Label>
                    <Input value={form.seoTitle} onChange={(e) => update("seoTitle", e.target.value)} placeholder="Custom title for search engines" data-testid="input-seo-title" />
                  </div>
                  <div className="space-y-2">
                    <Label>Meta Description</Label>
                    <Textarea value={form.metaDescription} onChange={(e) => update("metaDescription", e.target.value)} placeholder="Brief description for search results..." rows={3} data-testid="input-meta-description" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add a tag..."
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); }}}
                        data-testid="input-tag"
                      />
                      <Button type="button" variant="outline" onClick={addTag} className="gap-1" data-testid="button-add-tag">
                        <Tag className="w-3 h-3" /> Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="gap-1 cursor-pointer" onClick={() => removeTag(tag)}>
                          {tag} <X className="w-3 h-3" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="space-y-4 mt-4">
              <AIContentAssistant
                dealData={{
                  title: form.title,
                  description: form.description,
                  brand: form.brand,
                  dealPrice: form.dealPrice,
                  originalPrice: form.originalPrice,
                  discountPercent: form.discountPercent,
                  promoCode: form.promoCode,
                  tags: form.tags,
                }}
                onApply={(field, value) => {
                  if (field === "tags" && Array.isArray(value)) {
                    setForm(prev => ({ ...prev, tags: value }));
                  } else {
                    update(field, value);
                  }
                }}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => navigate("/admin/deals")} data-testid="button-cancel">
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending} className="gap-2 px-8" data-testid="button-save-deal">
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saveMutation.isPending ? "Saving..." : isEditing ? "Save Changes" : "Publish Deal"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
