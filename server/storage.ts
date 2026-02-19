import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory, type CategoryWithChildren,
  deals, type Deal, type InsertDeal,
  clicks, type InsertClick,
  claims, type InsertClaim,
  reports, type InsertReport,
  emailSubscribers, type InsertEmailSubscriber,
  scrapeLogs, type InsertScrapeLog,
  dealVotes, type DealVote, type InsertDealVote,
  raffleEntries, type RaffleEntry,
  raffleWinners, type RaffleWinner,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, sql, and, ilike, count, isNull, inArray, gte, lte, or } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByReferralCode(code: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;

  getCategories(): Promise<Category[]>;
  getTopLevelCategories(): Promise<CategoryWithChildren[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getCategoryBySlugWithChildren(slug: string): Promise<CategoryWithChildren | undefined>;
  getChildCategories(parentId: string): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  getDeals(filters?: { categoryId?: string; type?: string; status?: string; search?: string; sort?: string; limit?: number; offset?: number }): Promise<{ deals: Deal[]; total: number }>;
  getDealById(id: string): Promise<Deal | undefined>;
  getDealBySlug(slug: string): Promise<Deal | undefined>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  updateDeal(id: string, deal: Partial<InsertDeal>): Promise<Deal | undefined>;
  deleteDeal(id: string): Promise<boolean>;
  getTrendingDeals(limit?: number): Promise<Deal[]>;
  getFeaturedDeals(limit?: number): Promise<Deal[]>;

  logClick(click: InsertClick): Promise<void>;
  getClickCount(dealId: string): Promise<number>;

  createClaim(claim: InsertClaim): Promise<boolean>;
  hasUserClaimed(userId: string, dealId: string): Promise<boolean>;

  createReport(report: InsertReport): Promise<void>;

  subscribe(subscriber: InsertEmailSubscriber): Promise<boolean>;

  logScrape(log: InsertScrapeLog): Promise<void>;

  getAdminStats(): Promise<{ totalDeals: number; activeDeals: number; totalClicks: number; totalUsers: number; topDeals: { id: string; title: string; slug: string; clickCount: number }[] }>;

  castVote(vote: InsertDealVote): Promise<{ workedCount: number; failedCount: number; failRate: number }>;
  getVoteCounts(dealId: string): Promise<{ workedCount: number; failedCount: number; failRate: number }>;
  getUserVote(dealId: string, userId?: string | null, ip?: string | null): Promise<DealVote | undefined>;

  createRaffleEntry(userId: string): Promise<RaffleEntry>;
  getRaffleEntriesInPeriod(start: Date, end: Date): Promise<RaffleEntry[]>;
  deleteRaffleEntriesInPeriod(start: Date, end: Date): Promise<number>;
  createRaffleWinner(userId: string, periodStart: Date, periodEnd: Date): Promise<RaffleWinner>;
  getRaffleWinners(): Promise<(RaffleWinner & { email: string })[]>;
  getReferralCount(userId: string): Promise<number>;
  getRaffleEntryCount(userId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByReferralCode(code: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.referralCode, code));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated;
  }

  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(asc(categories.name));
  }

  async getTopLevelCategories(): Promise<CategoryWithChildren[]> {
    const parents = await db.select().from(categories).where(isNull(categories.parentId)).orderBy(asc(categories.name));
    const parentIds = parents.map(p => p.id);
    const children = parentIds.length > 0
      ? await db.select().from(categories).where(inArray(categories.parentId, parentIds)).orderBy(asc(categories.name))
      : [];
    return parents.map(p => ({
      ...p,
      children: children.filter(c => c.parentId === p.id),
    }));
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [cat] = await db.select().from(categories).where(eq(categories.slug, slug));
    return cat;
  }

  async getCategoryBySlugWithChildren(slug: string): Promise<CategoryWithChildren | undefined> {
    const [cat] = await db.select().from(categories).where(eq(categories.slug, slug));
    if (!cat) return undefined;
    const children = await db.select().from(categories).where(eq(categories.parentId, cat.id)).orderBy(asc(categories.name));
    return { ...cat, children };
  }

  async getChildCategories(parentId: string): Promise<Category[]> {
    return db.select().from(categories).where(eq(categories.parentId, parentId)).orderBy(asc(categories.name));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [created] = await db.insert(categories).values(category).returning();
    return created;
  }

  async getDeals(filters?: { categoryId?: string; type?: string; status?: string; search?: string; sort?: string; limit?: number; offset?: number }): Promise<{ deals: Deal[]; total: number }> {
    const conditions = [];
    if (filters?.categoryId) {
      const children = await db.select({ id: categories.id }).from(categories).where(eq(categories.parentId, filters.categoryId));
      const categoryIds = [filters.categoryId, ...children.map(c => c.id)];
      conditions.push(inArray(deals.categoryId, categoryIds));
    }
    if (filters?.type) conditions.push(eq(deals.type, filters.type));
    if (filters?.status) conditions.push(eq(deals.status, filters.status));
    if (filters?.search) conditions.push(ilike(deals.title, `%${filters.search}%`));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    let orderBy;
    switch (filters?.sort) {
      case "trending": orderBy = desc(deals.createdAt); break;
      case "ending": orderBy = asc(deals.expirationDate); break;
      case "price-low": orderBy = asc(deals.dealPrice); break;
      default: orderBy = desc(deals.createdAt);
    }

    const [totalResult] = await db.select({ count: count() }).from(deals).where(where);
    const result = await db.select().from(deals).where(where).orderBy(orderBy).limit(filters?.limit || 20).offset(filters?.offset || 0);

    return { deals: result, total: totalResult.count };
  }

  async getDealById(id: string): Promise<Deal | undefined> {
    const [deal] = await db.select().from(deals).where(eq(deals.id, id));
    return deal;
  }

  async getDealBySlug(slug: string): Promise<Deal | undefined> {
    const [deal] = await db.select().from(deals).where(eq(deals.slug, slug));
    return deal;
  }

  async createDeal(deal: InsertDeal): Promise<Deal> {
    const [created] = await db.insert(deals).values(deal).returning();
    return created;
  }

  async updateDeal(id: string, deal: Partial<InsertDeal>): Promise<Deal | undefined> {
    const [updated] = await db.update(deals).set({ ...deal, updatedAt: new Date() }).where(eq(deals.id, id)).returning();
    return updated;
  }

  async deleteDeal(id: string): Promise<boolean> {
    const result = await db.delete(deals).where(eq(deals.id, id)).returning();
    return result.length > 0;
  }

  async getTrendingDeals(limit = 4): Promise<Deal[]> {
    return db.select().from(deals).where(eq(deals.status, "ACTIVE")).orderBy(desc(deals.createdAt)).limit(limit);
  }

  async getFeaturedDeals(limit = 4): Promise<Deal[]> {
    return db.select().from(deals).where(and(eq(deals.isFeatured, true), eq(deals.status, "ACTIVE"))).orderBy(desc(deals.createdAt)).limit(limit);
  }

  async getAdminStats() {
    const [dealStats] = await db.select({
      totalDeals: count(),
      activeDeals: sql<number>`count(*) filter (where ${deals.status} = 'ACTIVE')`,
    }).from(deals);

    const [clickStats] = await db.select({ totalClicks: count() }).from(clicks);
    const [userStats] = await db.select({ totalUsers: count() }).from(users);

    const topDealsResult = await db
      .select({
        id: deals.id,
        title: deals.title,
        slug: deals.slug,
        clickCount: count(clicks.id),
      })
      .from(deals)
      .leftJoin(clicks, eq(deals.id, clicks.dealId))
      .where(eq(deals.status, "ACTIVE"))
      .groupBy(deals.id, deals.title, deals.slug)
      .orderBy(desc(count(clicks.id)))
      .limit(5);

    return {
      totalDeals: dealStats.totalDeals,
      activeDeals: Number(dealStats.activeDeals),
      totalClicks: clickStats.totalClicks,
      totalUsers: userStats.totalUsers,
      topDeals: topDealsResult.map(d => ({ id: d.id, title: d.title, slug: d.slug, clickCount: Number(d.clickCount) })),
    };
  }

  async logClick(click: InsertClick): Promise<void> {
    await db.insert(clicks).values(click);
  }

  async getClickCount(dealId: string): Promise<number> {
    const [result] = await db.select({ count: count() }).from(clicks).where(eq(clicks.dealId, dealId));
    return result.count;
  }

  async createClaim(claim: InsertClaim): Promise<boolean> {
    try {
      await db.transaction(async (tx: any) => {
        await tx.insert(claims).values(claim);
        await tx.update(deals).set({ remainingSlots: sql`${deals.remainingSlots} - 1` }).where(eq(deals.id, claim.dealId));
      });
      return true;
    } catch {
      return false;
    }
  }

  async hasUserClaimed(userId: string, dealId: string): Promise<boolean> {
    const [result] = await db.select({ count: count() }).from(claims).where(and(eq(claims.userId, userId), eq(claims.dealId, dealId)));
    return result.count > 0;
  }

  async createReport(report: InsertReport): Promise<void> {
    await db.insert(reports).values(report);
  }

  async subscribe(subscriber: InsertEmailSubscriber): Promise<boolean> {
    try {
      await db.insert(emailSubscribers).values(subscriber);
      return true;
    } catch {
      return false;
    }
  }

  async logScrape(log: InsertScrapeLog): Promise<void> {
    await db.insert(scrapeLogs).values(log);
  }

  async castVote(vote: InsertDealVote): Promise<{ workedCount: number; failedCount: number; failRate: number }> {
    const conditions = [eq(dealVotes.dealId, vote.dealId)];
    if (vote.userId) {
      conditions.push(eq(dealVotes.userId, vote.userId));
    } else if (vote.ip) {
      conditions.push(eq(dealVotes.ip, vote.ip));
      conditions.push(isNull(dealVotes.userId));
    }

    const [existing] = await db.select().from(dealVotes).where(and(...conditions));
    if (existing) {
      await db.update(dealVotes).set({ voteType: vote.voteType }).where(eq(dealVotes.id, existing.id));
    } else {
      await db.insert(dealVotes).values(vote);
    }

    return this.getVoteCounts(vote.dealId);
  }

  async getVoteCounts(dealId: string): Promise<{ workedCount: number; failedCount: number; failRate: number }> {
    const [worked] = await db.select({ count: count() }).from(dealVotes).where(and(eq(dealVotes.dealId, dealId), eq(dealVotes.voteType, "WORKED")));
    const [failed] = await db.select({ count: count() }).from(dealVotes).where(and(eq(dealVotes.dealId, dealId), eq(dealVotes.voteType, "FAILED")));
    const workedCount = worked.count;
    const failedCount = failed.count;
    const total = workedCount + failedCount;
    const failRate = total > 0 ? failedCount / total : 0;
    return { workedCount, failedCount, failRate };
  }

  async getUserVote(dealId: string, userId?: string | null, ip?: string | null): Promise<DealVote | undefined> {
    const conditions = [eq(dealVotes.dealId, dealId)];
    if (userId) {
      conditions.push(eq(dealVotes.userId, userId));
    } else if (ip) {
      conditions.push(eq(dealVotes.ip, ip));
      conditions.push(isNull(dealVotes.userId));
    } else {
      return undefined;
    }
    const [vote] = await db.select().from(dealVotes).where(and(...conditions));
    return vote;
  }

  async createRaffleEntry(userId: string): Promise<RaffleEntry> {
    const [entry] = await db.insert(raffleEntries).values({ userId }).returning();
    return entry;
  }

  async getRaffleEntriesInPeriod(start: Date, end: Date): Promise<RaffleEntry[]> {
    return db.select().from(raffleEntries).where(
      and(gte(raffleEntries.createdAt, start), lte(raffleEntries.createdAt, end))
    );
  }

  async deleteRaffleEntriesInPeriod(start: Date, end: Date): Promise<number> {
    const result = await db.delete(raffleEntries).where(
      and(gte(raffleEntries.createdAt, start), lte(raffleEntries.createdAt, end))
    ).returning();
    return result.length;
  }

  async createRaffleWinner(userId: string, periodStart: Date, periodEnd: Date): Promise<RaffleWinner> {
    const [winner] = await db.insert(raffleWinners).values({ userId, periodStart, periodEnd }).returning();
    return winner;
  }

  async getRaffleWinners(): Promise<(RaffleWinner & { email: string })[]> {
    const winners = await db.select({
      id: raffleWinners.id,
      userId: raffleWinners.userId,
      drawnAt: raffleWinners.drawnAt,
      periodStart: raffleWinners.periodStart,
      periodEnd: raffleWinners.periodEnd,
      email: users.email,
    }).from(raffleWinners).innerJoin(users, eq(raffleWinners.userId, users.id)).orderBy(desc(raffleWinners.drawnAt));
    return winners;
  }

  async getReferralCount(userId: string): Promise<number> {
    const [result] = await db.select({ count: count() }).from(users).where(eq(users.referredById, userId));
    return result.count;
  }

  async getRaffleEntryCount(userId: string): Promise<number> {
    const [result] = await db.select({ count: count() }).from(raffleEntries).where(eq(raffleEntries.userId, userId));
    return result.count;
  }
}

export const storage = new DatabaseStorage();
