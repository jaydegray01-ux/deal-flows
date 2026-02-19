import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { scrapeProduct } from "./scraper";
import { requireAdmin } from "./auth";
import crypto from "crypto";

async function generateUniqueReferralCode(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const code = crypto.randomBytes(4).toString("hex");
    const existing = await storage.getUserByReferralCode(code);
    if (!existing) return code;
  }
  return crypto.randomBytes(8).toString("hex");
}

function getClientIp(req: Request): string {
  return (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "unknown";
}

function getRafflePeriod(): { start: Date; end: Date } {
  const now = new Date();
  const epoch = new Date("2026-02-16T00:00:00Z");
  const msPerPeriod = 14 * 24 * 60 * 60 * 1000;
  const periodsSinceEpoch = Math.floor((now.getTime() - epoch.getTime()) / msPerPeriod);
  const start = new Date(epoch.getTime() + periodsSinceEpoch * msPerPeriod);
  const end = new Date(start.getTime() + msPerPeriod);
  return { start, end };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ─── Healthcheck ───────────────────────────────
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  // ─── Public: Get Categories ────────────────────
  app.get("/api/categories", async (req: Request, res: Response) => {
    const tree = req.query.tree === "true";
    if (tree) {
      const cats = await storage.getTopLevelCategories();
      res.json(cats);
    } else {
      const cats = await storage.getCategories();
      res.json(cats);
    }
  });

  app.get("/api/categories/:slug", async (req: Request, res: Response) => {
    const cat = await storage.getCategoryBySlugWithChildren(req.params.slug);
    if (!cat) return res.status(404).json({ message: "Category not found" });
    res.json(cat);
  });

  // ─── Public: Get Deals (filtered) ──────────────
  app.get("/api/deals", async (req: Request, res: Response) => {
    const categoryId = req.query.categoryId as string | undefined;
    const type = req.query.type as string | undefined;
    const status = (req.query.status as string) || "ACTIVE";
    const search = req.query.search as string | undefined;
    const sort = req.query.sort as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    const result = await storage.getDeals({ categoryId, type, status, search, sort, limit, offset });
    res.json(result);
  });

  app.get("/api/deals/trending", async (_req: Request, res: Response) => {
    const deals = await storage.getTrendingDeals();
    res.json(deals);
  });

  app.get("/api/deals/featured", async (_req: Request, res: Response) => {
    const deals = await storage.getFeaturedDeals();
    res.json(deals);
  });

  app.get("/api/deals/by-slug/:slug", async (req: Request, res: Response) => {
    const deal = await storage.getDealBySlug(req.params.slug);
    if (!deal) return res.status(404).json({ message: "Deal not found" });
    res.json(deal);
  });

  // ─── Public: Log Click ─────────────────────────
  app.post("/api/clicks", async (req: Request, res: Response) => {
    const schema = z.object({ dealId: z.string() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data" });

    await storage.logClick({
      dealId: parsed.data.dealId,
      ip: req.ip || null,
      userAgent: req.headers["user-agent"] || null,
    });
    res.json({ ok: true });
  });

  // ─── Public: Report Deal ───────────────────────
  app.post("/api/reports", async (req: Request, res: Response) => {
    const schema = z.object({ dealId: z.string(), reason: z.string().min(5) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data" });

    await storage.createReport(parsed.data);
    res.json({ ok: true });
  });

  // ─── Public: Subscribe Email ───────────────────
  app.post("/api/subscribe", async (req: Request, res: Response) => {
    const schema = z.object({ email: z.string().email() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid email" });

    const ok = await storage.subscribe(parsed.data);
    if (!ok) return res.status(409).json({ message: "Already subscribed" });
    res.json({ ok: true });
  });

  // ─── Public: Outbound redirect ─────────────────
  app.get("/api/out/:dealId", async (req: Request, res: Response) => {
    const deal = await storage.getDealById(req.params.dealId);
    if (!deal) return res.status(404).json({ message: "Deal not found" });

    await storage.logClick({
      dealId: deal.id,
      ip: req.ip || null,
      userAgent: req.headers["user-agent"] || null,
    });

    res.redirect(deal.affiliateLink);
  });

  // ─── Public: Vote on Deal ─────────────────────
  app.post("/api/deals/:dealId/vote", async (req: Request, res: Response) => {
    const schema = z.object({ voteType: z.enum(["WORKED", "FAILED"]) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid vote type" });

    const userId = req.isAuthenticated() ? req.user!.id : null;
    const ip = getClientIp(req);

    try {
      const counts = await storage.castVote({
        dealId: req.params.dealId,
        userId,
        ip,
        voteType: parsed.data.voteType,
      });
      res.json(counts);
    } catch (err: any) {
      res.status(400).json({ message: "Vote failed" });
    }
  });

  app.get("/api/deals/:dealId/votes", async (req: Request, res: Response) => {
    const counts = await storage.getVoteCounts(req.params.dealId);
    const userId = req.isAuthenticated() ? req.user!.id : null;
    const ip = getClientIp(req);
    const userVote = await storage.getUserVote(req.params.dealId, userId, ip);
    res.json({ ...counts, userVote: userVote?.voteType || null });
  });

  // ─── Public: Referral info / dashboard ─────────
  app.get("/api/referral/dashboard", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    let user = await storage.getUser(req.user!.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.referralCode) {
      const code = await generateUniqueReferralCode();
      user = (await storage.updateUser(user.id, { referralCode: code }))!;
    }

    const referralCount = await storage.getReferralCount(user.id);
    const raffleEntryCount = await storage.getRaffleEntryCount(user.id);
    const { start, end } = getRafflePeriod();

    res.json({
      referralCode: user.referralCode,
      referralCount,
      raffleEntryCount,
      nextDrawDate: end.toISOString(),
      periodStart: start.toISOString(),
      periodEnd: end.toISOString(),
    });
  });

  // ─── Public: Raffle period info ────────────────
  app.get("/api/raffle/info", async (_req: Request, res: Response) => {
    const { start, end } = getRafflePeriod();
    const winners = await storage.getRaffleWinners();
    res.json({
      periodStart: start.toISOString(),
      periodEnd: end.toISOString(),
      recentWinners: winners.slice(0, 5),
    });
  });

  // ─── Admin: Create Deal ────────────────────────
  app.post("/api/admin/deals", requireAdmin, async (req: Request, res: Response) => {
    try {
      const deal = await storage.createDeal(req.body);
      res.status(201).json(deal);
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Failed to create deal" });
    }
  });

  app.patch("/api/admin/deals/:id", requireAdmin, async (req: Request, res: Response) => {
    const deal = await storage.updateDeal(req.params.id, req.body);
    if (!deal) return res.status(404).json({ message: "Deal not found" });
    res.json(deal);
  });

  app.delete("/api/admin/deals/:id", requireAdmin, async (req: Request, res: Response) => {
    const ok = await storage.deleteDeal(req.params.id);
    if (!ok) return res.status(404).json({ message: "Deal not found" });
    res.json({ ok: true });
  });

  app.get("/api/admin/stats", requireAdmin, async (req: Request, res: Response) => {
    const stats = await storage.getAdminStats();
    res.json(stats);
  });

  app.get("/api/admin/deals/:id", requireAdmin, async (req: Request, res: Response) => {
    const deal = await storage.getDealById(req.params.id);
    if (!deal) return res.status(404).json({ message: "Deal not found" });
    res.json(deal);
  });

  app.get("/api/admin/deals", requireAdmin, async (req: Request, res: Response) => {
    const search = req.query.search as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    const result = await storage.getDeals({ search, limit, offset });
    res.json(result);
  });

  app.post("/api/admin/categories", requireAdmin, async (req: Request, res: Response) => {
    const schema = z.object({ name: z.string().min(1), slug: z.string().min(1) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data" });

    try {
      const cat = await storage.createCategory(parsed.data);
      res.status(201).json(cat);
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Failed to create category" });
    }
  });

  app.post("/api/admin/scrape-product", requireAdmin, async (req: Request, res: Response) => {
    const schema = z.object({ url: z.string().url() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid URL" });

    try {
      const result = await scrapeProduct(parsed.data.url);
      await storage.logScrape({
        url: parsed.data.url,
        success: result.success,
        source: result.source,
      });
      res.json(result);
    } catch (err: any) {
      await storage.logScrape({
        url: parsed.data.url,
        success: false,
        source: null,
      });
      res.status(500).json({ message: "Scraping failed", success: false });
    }
  });

  // ─── Admin: Raffle Draw ────────────────────────
  app.post("/api/admin/raffle/draw", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { start, end } = getRafflePeriod();

      const existingWinners = await storage.getRaffleWinners();
      const alreadyDrawn = existingWinners.some(
        w => w.periodStart.getTime() === start.getTime() && w.periodEnd.getTime() === end.getTime()
      );
      if (alreadyDrawn) {
        return res.status(400).json({ message: "A winner has already been drawn for this period" });
      }

      const entries = await storage.getRaffleEntriesInPeriod(start, end);

      if (entries.length === 0) {
        return res.status(400).json({ message: "No raffle entries in this period" });
      }

      const winnerEntry = entries[Math.floor(Math.random() * entries.length)];
      const winner = await storage.getUser(winnerEntry.userId);
      if (!winner) return res.status(500).json({ message: "Winner user not found" });

      const raffleWinner = await storage.createRaffleWinner(winner.id, start, end);
      const referralCount = await storage.getReferralCount(winner.id);

      await storage.deleteRaffleEntriesInPeriod(start, end);

      res.json({
        winnerEmail: winner.email,
        winnerReferralCount: referralCount,
        winner: raffleWinner,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Raffle draw failed" });
    }
  });

  app.get("/api/admin/raffle/winners", requireAdmin, async (_req: Request, res: Response) => {
    const winners = await storage.getRaffleWinners();
    res.json(winners);
  });

  app.get("/api/admin/raffle/entries", requireAdmin, async (_req: Request, res: Response) => {
    const { start, end } = getRafflePeriod();
    const entries = await storage.getRaffleEntriesInPeriod(start, end);
    res.json({ entries, periodStart: start, periodEnd: end, count: entries.length });
  });

  return httpServer;
}
