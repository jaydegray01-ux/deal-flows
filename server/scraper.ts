import * as cheerio from "cheerio";

export interface ScrapedProduct {
  title: string | null;
  imageUrl: string | null;
  price: number | null;
  originalPrice: number | null;
  brand: string | null;
  description: string | null;
  source: "amazon" | "shopify" | "generic";
  success: boolean;
}

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
};

function parsePrice(text: string | undefined | null): number | null {
  if (!text) return null;
  const match = text.replace(/,/g, "").match(/[\d]+\.?\d*/);
  return match ? parseFloat(match[0]) : null;
}

function isBlockedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return true;
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0") return true;
    if (hostname.startsWith("10.") || hostname.startsWith("192.168.") || hostname.startsWith("172.")) return true;
    if (hostname.endsWith(".local") || hostname.endsWith(".internal")) return true;
    return false;
  } catch {
    return true;
  }
}

function detectSource(url: string): "amazon" | "shopify" | "generic" {
  const hostname = new URL(url).hostname.toLowerCase();
  if (hostname.includes("amazon")) return "amazon";
  return "generic";
}

async function fetchWithRetry(url: string, retries = 2): Promise<string> {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(url, {
        headers: HEADERS,
        signal: controller.signal,
        redirect: "follow",
      });
      clearTimeout(timeout);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (err) {
      if (i === retries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw new Error("Max retries exceeded");
}

function parseJsonLd($: cheerio.CheerioAPI): Partial<ScrapedProduct> {
  const result: Partial<ScrapedProduct> = {};
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).text());
      const product = Array.isArray(data) ? data.find((d: any) => d["@type"] === "Product") : (data["@type"] === "Product" ? data : null);
      if (product) {
        result.title = product.name || null;
        result.description = product.description || null;
        result.imageUrl = Array.isArray(product.image) ? product.image[0] : product.image || null;
        result.brand = product.brand?.name || null;
        if (product.offers) {
          const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
          result.price = parsePrice(offer?.price?.toString());
        }
      }
    } catch {}
  });
  return result;
}

function parseOpenGraph($: cheerio.CheerioAPI): Partial<ScrapedProduct> {
  return {
    title: $('meta[property="og:title"]').attr("content") || null,
    imageUrl: $('meta[property="og:image"]').attr("content") || null,
    description: $('meta[property="og:description"]').attr("content") || null,
    price: parsePrice($('meta[property="product:price:amount"]').attr("content")),
  };
}

function parseAmazon($: cheerio.CheerioAPI): Partial<ScrapedProduct> {
  const title = $("#productTitle").text().trim() || $("h1#title span").text().trim() || null;
  const imageUrl = $("#landingImage").attr("src") || $("#imgBlkFront").attr("src") || $('meta[property="og:image"]').attr("content") || null;
  const priceText = $(".a-price .a-offscreen").first().text() || $("#priceblock_ourprice").text() || $(".a-price-whole").first().text();
  const price = parsePrice(priceText);
  const originalPriceText = $(".a-text-price .a-offscreen").first().text() || $(".basisPrice .a-offscreen").first().text();
  const originalPrice = parsePrice(originalPriceText);
  const brand = $("#bylineInfo").text().replace(/^(Visit the |Brand: )/, "").trim() || null;
  const description = $("#feature-bullets ul").text().trim().substring(0, 500) || $('meta[name="description"]').attr("content") || null;

  return { title, imageUrl, price, originalPrice, brand, description };
}

export async function scrapeProduct(url: string): Promise<ScrapedProduct> {
  if (isBlockedUrl(url)) {
    return { title: null, imageUrl: null, price: null, originalPrice: null, brand: null, description: null, source: "generic", success: false };
  }

  const source = detectSource(url);

  try {
    const html = await fetchWithRetry(url);
    const $ = cheerio.load(html);

    let result: Partial<ScrapedProduct> = {};

    if (source === "amazon") {
      result = parseAmazon($);
    }

    const jsonLd = parseJsonLd($);
    const og = parseOpenGraph($);

    // Merge: specific parser > JSON-LD > OpenGraph > fallback
    const merged: ScrapedProduct = {
      title: result.title || jsonLd.title || og.title || $("title").text().trim() || null,
      imageUrl: result.imageUrl || jsonLd.imageUrl || og.imageUrl || null,
      price: result.price || jsonLd.price || og.price || null,
      originalPrice: result.originalPrice || null,
      brand: result.brand || jsonLd.brand || null,
      description: result.description || jsonLd.description || og.description || null,
      source,
      success: true,
    };

    if (!merged.title) merged.success = false;

    return merged;
  } catch (err) {
    return { title: null, imageUrl: null, price: null, originalPrice: null, brand: null, description: null, source, success: false };
  }
}
