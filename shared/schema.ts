import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, decimal, jsonb, index, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── Users ───────────────────────────────────────────
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("USER"),
  referralCode: text("referral_code").unique(),
  referredById: varchar("referred_by_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ─── Categories ──────────────────────────────────────
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  parentId: varchar("parent_id"),
});

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type CategoryWithChildren = Category & { children: Category[] };

// ─── Deals ───────────────────────────────────────────
export const deals = pgTable("deals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull().default("AFFILIATE"),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  dealPrice: decimal("deal_price", { precision: 10, scale: 2 }),
  discountPercent: integer("discount_percent"),
  promoCode: text("promo_code"),
  affiliateLink: text("affiliate_link").notNull(),
  expirationDate: timestamp("expiration_date"),
  status: text("status").notNull().default("ACTIVE"),
  isFeatured: boolean("is_featured").notNull().default(false),
  totalSlots: integer("total_slots"),
  remainingSlots: integer("remaining_slots"),
  categoryId: varchar("category_id").references(() => categories.id),
  brand: text("brand"),
  seoTitle: text("seo_title"),
  metaDescription: text("meta_description"),
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDealSchema = createInsertSchema(deals).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Deal = typeof deals.$inferSelect;

// ─── Clicks ──────────────────────────────────────────
export const clicks = pgTable("clicks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dealId: varchar("deal_id").notNull().references(() => deals.id),
  userId: varchar("user_id"),
  ip: text("ip"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("clicks_deal_created_idx").on(table.dealId, table.createdAt),
]);

export const insertClickSchema = createInsertSchema(clicks).omit({ id: true, createdAt: true });
export type InsertClick = z.infer<typeof insertClickSchema>;
export type Click = typeof clicks.$inferSelect;

// ─── Claims ──────────────────────────────────────────
export const claims = pgTable("claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dealId: varchar("deal_id").notNull().references(() => deals.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  ip: text("ip"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  unique("claims_user_deal_unique").on(table.userId, table.dealId),
]);

export const insertClaimSchema = createInsertSchema(claims).omit({ id: true, createdAt: true });
export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type Claim = typeof claims.$inferSelect;

// ─── Reports ─────────────────────────────────────────
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dealId: varchar("deal_id").notNull().references(() => deals.id),
  userId: varchar("user_id"),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const insertReportSchema = createInsertSchema(reports).omit({ id: true, createdAt: true, resolvedAt: true });
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

// ─── Email Subscribers ───────────────────────────────
export const emailSubscribers = pgTable("email_subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEmailSubscriberSchema = createInsertSchema(emailSubscribers).omit({ id: true, createdAt: true });
export type InsertEmailSubscriber = z.infer<typeof insertEmailSubscriberSchema>;
export type EmailSubscriber = typeof emailSubscribers.$inferSelect;

// ─── Scrape Logs ─────────────────────────────────────
export const scrapeLogs = pgTable("scrape_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  success: boolean("success").notNull(),
  source: text("source"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertScrapeLogSchema = createInsertSchema(scrapeLogs).omit({ id: true, createdAt: true });
export type InsertScrapeLog = z.infer<typeof insertScrapeLogSchema>;
export type ScrapeLog = typeof scrapeLogs.$inferSelect;

// ─── Deal Votes ──────────────────────────────────────
export const dealVotes = pgTable("deal_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dealId: varchar("deal_id").notNull().references(() => deals.id),
  userId: varchar("user_id"),
  ip: text("ip"),
  voteType: text("vote_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  unique("deal_votes_user_deal_unique").on(table.dealId, table.userId),
  index("deal_votes_deal_idx").on(table.dealId),
]);

export const insertDealVoteSchema = createInsertSchema(dealVotes).omit({ id: true, createdAt: true });
export type InsertDealVote = z.infer<typeof insertDealVoteSchema>;
export type DealVote = typeof dealVotes.$inferSelect;

// ─── Raffle Entries ──────────────────────────────────
export const raffleEntries = pgTable("raffle_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("raffle_entries_created_idx").on(table.createdAt),
]);

export const insertRaffleEntrySchema = createInsertSchema(raffleEntries).omit({ id: true, createdAt: true });
export type InsertRaffleEntry = z.infer<typeof insertRaffleEntrySchema>;
export type RaffleEntry = typeof raffleEntries.$inferSelect;

// ─── Raffle Winners ─────────────────────────────────
export const raffleWinners = pgTable("raffle_winners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  drawnAt: timestamp("drawn_at").defaultNow().notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
});

export const insertRaffleWinnerSchema = createInsertSchema(raffleWinners).omit({ id: true, drawnAt: true });
export type InsertRaffleWinner = z.infer<typeof insertRaffleWinnerSchema>;
export type RaffleWinner = typeof raffleWinners.$inferSelect;
