import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Wand2, FileText, Search, Share2, Mail, Bell, Tag, Loader2, Copy, Check, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { aiService, type AiSocialResponse, type AiEmailResponse, type AiPushResponse } from "@/lib/aiService";

interface AIContentAssistantProps {
  dealData: {
    title: string;
    description: string;
    brand: string;
    dealPrice: string;
    originalPrice: string;
    discountPercent: string;
    promoCode: string;
    tags: string[];
  };
  onApply: (field: string, value: any) => void;
}

const tools = [
  { id: "description", label: "Description & Bullets", icon: FileText, desc: "Rewrite for conversion" },
  { id: "seo", label: "SEO Optimization", icon: Search, desc: "Title, meta, keywords" },
  { id: "social", label: "Social Media", icon: Share2, desc: "Scripts, captions, hashtags" },
  { id: "email", label: "Email Campaign", icon: Mail, desc: "Subject lines & body" },
  { id: "push", label: "Push Notifications", icon: Bell, desc: "Notification copy" },
  { id: "tags", label: "Tags & Slug", icon: Tag, desc: "Auto-categorize & slug" },
];

export default function AIContentAssistant({ dealData, onApply }: AIContentAssistantProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleGenerate = async (toolId: string) => {
    if (!dealData.title) {
      toast({ title: "Missing Title", description: "Please enter a deal title first.", variant: "destructive" });
      return;
    }

    setLoading(toolId);
    try {
      let result: any;
      switch (toolId) {
        case "description":
          result = await aiService.generateDescription(dealData);
          break;
        case "seo":
          result = await aiService.generateSeo(dealData);
          break;
        case "social":
          result = await aiService.generateSocial(dealData);
          break;
        case "email":
          result = await aiService.generateEmail(dealData);
          break;
        case "push":
          result = await aiService.generatePush(dealData);
          break;
        case "tags":
          result = await aiService.suggestTags(dealData);
          break;
      }
      setResults(prev => ({ ...prev, [toolId]: result }));
      toast({ title: "Content Generated!", description: `${tools.find(t => t.id === toolId)?.label} is ready.` });
    } catch {
      toast({ title: "Generation Failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const CopyButton = ({ text, id }: { text: string; id: string }) => (
    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => copyText(text, id)}>
      {copiedId === id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
    </Button>
  );

  return (
    <div className="space-y-4">
      <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="bg-violet-600 text-white p-1.5 rounded-md">
              <Sparkles className="w-4 h-4" />
            </div>
            AI Content Assistant
          </CardTitle>
          <CardDescription>Generate marketing copy, SEO content, and social media posts for your deal.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tools.map((tool) => (
              <Button
                key={tool.id}
                variant="outline"
                className="h-auto py-3 px-4 justify-start gap-3 bg-white hover:bg-violet-50 hover:border-violet-300 transition-all"
                onClick={() => handleGenerate(tool.id)}
                disabled={!!loading}
                data-testid={`button-ai-${tool.id}`}
              >
                <div className="bg-violet-100 p-2 rounded-md text-violet-600 shrink-0">
                  {loading === tool.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <tool.icon className="w-4 h-4" />}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm">{tool.label}</div>
                  <div className="text-xs text-muted-foreground">{tool.desc}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results Display */}
      {Object.keys(results).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Generated Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={Object.keys(results)[Object.keys(results).length - 1]}>
              <TabsList className="mb-4 flex-wrap h-auto">
                {Object.keys(results).map(key => (
                  <TabsTrigger key={key} value={key} className="capitalize">{key}</TabsTrigger>
                ))}
              </TabsList>

              {/* Description Results */}
              {results.description && (
                <TabsContent value="description" className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg border space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-sm">Marketing Description</h4>
                      <div className="flex gap-1">
                        <CopyButton text={results.description.description} id="desc-copy" />
                        <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => onApply("description", results.description.description + "\n\n" + results.description.bullets.map((b: string) => `- ${b}`).join("\n"))}>
                          Apply
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{results.description.description}</p>
                    <div className="space-y-1">
                      <h5 className="text-xs font-medium">Key Bullets:</h5>
                      {results.description.bullets.map((b: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="text-green-500">-</span> {b}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              )}

              {/* SEO Results */}
              {results.seo && (
                <TabsContent value="seo" className="space-y-3">
                  <div className="bg-muted/50 p-4 rounded-lg border space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-sm">SEO Title</h4>
                        <p className="text-sm text-muted-foreground mt-1">{results.seo.seoTitle}</p>
                      </div>
                      <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => onApply("seoTitle", results.seo.seoTitle)}>
                        Apply
                      </Button>
                    </div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg border space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-sm">Meta Description</h4>
                        <p className="text-sm text-muted-foreground mt-1">{results.seo.metaDescription}</p>
                      </div>
                      <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => onApply("metaDescription", results.seo.metaDescription)}>
                        Apply
                      </Button>
                    </div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg border space-y-2">
                    <h4 className="font-semibold text-sm">Keywords</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {results.seo.keywords.map((kw: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">{kw}</Badge>
                      ))}
                    </div>
                    <Button size="sm" variant="default" className="h-7 text-xs mt-2" onClick={() => onApply("tags", results.seo.keywords)}>
                      Apply as Tags
                    </Button>
                  </div>
                </TabsContent>
              )}

              {/* Social Results */}
              {results.social && (
                <TabsContent value="social" className="space-y-3">
                  <ScrollArea className="max-h-[400px]">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Video Scripts</h4>
                      {(results.social as AiSocialResponse).scripts.map((s, i) => (
                        <div key={i} className="bg-muted/50 p-3 rounded-lg border flex items-start gap-2">
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap flex-1">{s}</p>
                          <CopyButton text={s} id={`social-script-${i}`} />
                        </div>
                      ))}
                      <h4 className="font-semibold text-sm pt-2">Captions</h4>
                      {(results.social as AiSocialResponse).captions.map((c, i) => (
                        <div key={i} className="bg-muted/50 p-3 rounded-lg border flex items-start gap-2">
                          <p className="text-sm text-muted-foreground flex-1">{c}</p>
                          <CopyButton text={c} id={`social-caption-${i}`} />
                        </div>
                      ))}
                      <h4 className="font-semibold text-sm pt-2">Hashtags</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {(results.social as AiSocialResponse).hashtags.map((h, i) => (
                          <Badge key={i} variant="outline" className="text-xs cursor-pointer" onClick={() => copyText(h, `hashtag-${i}`)}>{h}</Badge>
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              )}

              {/* Email Results */}
              {results.email && (
                <TabsContent value="email" className="space-y-3">
                  <ScrollArea className="max-h-[400px]">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Subject Lines</h4>
                      {(results.email as AiEmailResponse).subjects.map((s, i) => (
                        <div key={i} className="bg-muted/50 p-3 rounded-lg border flex items-center justify-between gap-2">
                          <p className="text-sm text-muted-foreground">{s}</p>
                          <CopyButton text={s} id={`email-subject-${i}`} />
                        </div>
                      ))}
                      <h4 className="font-semibold text-sm pt-2">Short Email</h4>
                      <div className="bg-muted/50 p-3 rounded-lg border flex items-start gap-2">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap flex-1">{(results.email as AiEmailResponse).shortEmail}</p>
                        <CopyButton text={(results.email as AiEmailResponse).shortEmail} id="email-short" />
                      </div>
                      <h4 className="font-semibold text-sm pt-2">Long Email</h4>
                      <div className="bg-muted/50 p-3 rounded-lg border flex items-start gap-2">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap flex-1">{(results.email as AiEmailResponse).longEmail}</p>
                        <CopyButton text={(results.email as AiEmailResponse).longEmail} id="email-long" />
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              )}

              {/* Push Results */}
              {results.push && (
                <TabsContent value="push" className="space-y-3">
                  <h4 className="font-semibold text-sm">Push Notification Options</h4>
                  {(results.push as AiPushResponse).pushNotifications.map((p, i) => (
                    <div key={i} className="bg-muted/50 p-3 rounded-lg border flex items-center justify-between gap-2">
                      <p className="text-sm text-muted-foreground">{p}</p>
                      <CopyButton text={p} id={`push-${i}`} />
                    </div>
                  ))}
                </TabsContent>
              )}

              {/* Tags Results */}
              {results.tags && (
                <TabsContent value="tags" className="space-y-3">
                  <div className="bg-muted/50 p-4 rounded-lg border space-y-3">
                    <h4 className="font-semibold text-sm">Suggested Tags</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {results.tags.tags.map((tag: string, i: number) => (
                        <Badge key={i} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                    <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => onApply("tags", results.tags.tags)}>
                      Apply Tags
                    </Button>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg border space-y-3">
                    <h4 className="font-semibold text-sm">Slug Suggestions</h4>
                    <div className="space-y-1">
                      {results.tags.slugSuggestions.map((slug: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <code className="bg-slate-200 px-2 py-0.5 rounded text-xs">{slug}</code>
                          <CopyButton text={slug} id={`slug-${i}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
