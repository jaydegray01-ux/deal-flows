import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../shared/schema";
import bcrypt from "bcrypt";

const categories = [
  {
    name: "Electronics",
    slug: "electronics",
    children: [
      { name: "Phone Accessories", slug: "phone-accessories" },
      { name: "Headphones", slug: "headphones" },
      { name: "Smart Home", slug: "smart-home" },
      { name: "Computers & Tablets", slug: "computers-tablets" },
      { name: "Gaming Accessories", slug: "gaming-accessories" },
    ],
  },
  {
    name: "Home & Kitchen",
    slug: "home-kitchen",
    children: [
      { name: "Kitchen Appliances", slug: "kitchen-appliances" },
      { name: "Cleaning Tools", slug: "cleaning-tools" },
      { name: "Home Decor", slug: "home-decor" },
      { name: "Storage & Organization", slug: "storage-organization" },
    ],
  },
  {
    name: "Beauty",
    slug: "beauty",
    children: [
      { name: "Skincare", slug: "skincare" },
      { name: "Makeup", slug: "makeup" },
      { name: "Hair Care", slug: "hair-care" },
      { name: "Grooming", slug: "grooming" },
    ],
  },
  {
    name: "Health & Fitness",
    slug: "health-fitness",
    children: [
      { name: "Supplements", slug: "supplements" },
      { name: "Workout Equipment", slug: "workout-equipment" },
      { name: "Recovery Tools", slug: "recovery-tools" },
    ],
  },
  {
    name: "Fashion",
    slug: "fashion",
    children: [
      { name: "Men's Fashion", slug: "mens-fashion" },
      { name: "Women's Fashion", slug: "womens-fashion" },
      { name: "Shoes", slug: "shoes" },
      { name: "Watches & Accessories", slug: "watches-accessories" },
    ],
  },
  {
    name: "Toys & Games",
    slug: "toys-games",
    children: [
      { name: "Kids Toys", slug: "kids-toys" },
      { name: "Board Games", slug: "board-games" },
      { name: "Video Games", slug: "video-games" },
    ],
  },
  {
    name: "Baby",
    slug: "baby",
    children: [
      { name: "Diapers & Wipes", slug: "diapers-wipes" },
      { name: "Feeding", slug: "feeding" },
      { name: "Baby Gear", slug: "baby-gear" },
    ],
  },
  {
    name: "Office & School",
    slug: "office-school",
    children: [
      { name: "Desk Accessories", slug: "desk-accessories" },
      { name: "School Supplies", slug: "school-supplies" },
    ],
  },
  {
    name: "Automotive",
    slug: "automotive",
    children: [
      { name: "Car Accessories", slug: "car-accessories" },
      { name: "Tools & Equipment", slug: "tools-equipment" },
    ],
  },
  {
    name: "Pet Supplies",
    slug: "pet-supplies",
    children: [
      { name: "Dog Supplies", slug: "dog-supplies" },
      { name: "Cat Supplies", slug: "cat-supplies" },
      { name: "Pet Grooming", slug: "pet-grooming" },
    ],
  },
  {
    name: "Save & Earn",
    slug: "save-earn",
    children: [
      { name: "Cashback Apps", slug: "cashback-apps" },
      { name: "Bank Bonuses", slug: "bank-bonuses" },
      { name: "Investing App Bonuses", slug: "investing-bonuses" },
      { name: "Credit Card Welcome Offers", slug: "credit-card-bonuses" },
      { name: "Referral Bonuses", slug: "referral-bonuses" },
      { name: "Rewards & Receipt Apps", slug: "rewards-apps" },
      { name: "Gig & Side Hustle Bonuses", slug: "gig-bonuses" },
      { name: "Free Trials & Freebies", slug: "free-trials" },
      { name: "Student Discounts", slug: "student-discounts" },
      { name: "Budget Tools & Savings Apps", slug: "budget-tools" },
    ],
  },
];

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log("Seeding admin user...");
  try {
    const passwordHash = await bcrypt.hash("admin123", 10);
    await db.insert(schema.users).values({ email: "admin@dealflow.com", passwordHash, role: "ADMIN" });
    console.log("  + admin@dealflow.com (password: admin123)");
  } catch {
    console.log("  = admin user already exists");
  }

  console.log("\nSeeding categories...");
  const catMap: Record<string, string> = {};

  for (const cat of categories) {
    let parentRow;
    try {
      const [row] = await db.insert(schema.categories).values({ name: cat.name, slug: cat.slug }).returning();
      parentRow = row;
      console.log(`  + ${cat.name}`);
    } catch {
      const existing = await db.select().from(schema.categories).where(
        require("drizzle-orm").eq(schema.categories.slug, cat.slug)
      );
      parentRow = existing[0];
      console.log(`  = ${cat.name} (already exists)`);
    }
    catMap[cat.slug] = parentRow.id;

    if (cat.children) {
      for (const child of cat.children) {
        try {
          const [row] = await db.insert(schema.categories).values({
            name: child.name,
            slug: child.slug,
            parentId: parentRow.id,
          }).returning();
          catMap[child.slug] = row.id;
          console.log(`    + ${child.name}`);
        } catch {
          const existing = await db.select().from(schema.categories).where(
            require("drizzle-orm").eq(schema.categories.slug, child.slug)
          );
          if (existing[0]) catMap[child.slug] = existing[0].id;
          console.log(`    = ${child.name} (already exists)`);
        }
      }
    }
  }

  console.log("\nSeeding sample deals...");
  const deals = [
    {
      type: "AFFILIATE",
      title: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
      slug: "sony-wh-1000xm5",
      description: "Industry-leading noise cancellation, exceptional sound quality, and crystal-clear hands-free calling. 30-hour battery life with quick charging.",
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
      originalPrice: "349.99",
      dealPrice: "248.00",
      discountPercent: 29,
      promoCode: "SONY29OFF",
      affiliateLink: "https://amazon.com/dp/example1",
      expirationDate: new Date(Date.now() + 5 * 86400000),
      status: "ACTIVE",
      isFeatured: true,
      categoryId: catMap["headphones"],
      brand: "Sony",
      tags: ["headphones", "audio", "wireless", "noise-canceling"],
    },
    {
      type: "SLOT",
      title: "Garmin Venu 2 Plus GPS Smartwatch",
      slug: "garmin-venu-2-plus",
      description: "Understand your body better with advanced health and fitness features. Make calls from your wrist when paired with your compatible smartphone.",
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
      originalPrice: "449.99",
      dealPrice: "299.99",
      discountPercent: 33,
      promoCode: "EXCLUSIVE-GARMIN",
      affiliateLink: "https://garmin.com/deals",
      expirationDate: new Date(Date.now() + 2 * 86400000),
      status: "ACTIVE",
      isFeatured: true,
      totalSlots: 50,
      remainingSlots: 12,
      categoryId: catMap["gaming-accessories"],
      brand: "Garmin",
      tags: ["smartwatch", "fitness", "GPS"],
    },
    {
      type: "AFFILIATE",
      title: "Adobe Creative Cloud All Apps - 1 Year",
      slug: "adobe-cc-1-year",
      description: "Get the entire collection of 20+ creative apps including Photoshop, Illustrator, Premiere Pro, and more. Best deal of the year.",
      imageUrl: "https://images.unsplash.com/photo-1626785774573-4b7993143a4d?w=600",
      originalPrice: "599.88",
      dealPrice: "359.88",
      discountPercent: 40,
      affiliateLink: "https://adobe.com/deals",
      expirationDate: new Date(Date.now() + 15 * 86400000),
      status: "ACTIVE",
      isFeatured: true,
      categoryId: catMap["computers-tablets"],
      brand: "Adobe",
      tags: ["software", "creative", "design", "subscription"],
    },
    {
      type: "AFFILIATE",
      title: "NordVPN 2-Year Plan + 3 Months Free",
      slug: "nordvpn-deal",
      description: "Secure your digital life with the world's leading VPN service. Fast, private, and secure. 5500+ servers in 60 countries.",
      imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600",
      originalPrice: "285.00",
      dealPrice: "89.00",
      discountPercent: 68,
      affiliateLink: "https://nordvpn.com/deal",
      expirationDate: new Date(Date.now() + 30 * 86400000),
      status: "ACTIVE",
      isFeatured: false,
      categoryId: catMap["phone-accessories"],
      brand: "NordVPN",
      tags: ["vpn", "security", "privacy", "software"],
    },
    {
      type: "SLOT",
      title: "Keychron Q1 Pro Wireless Mechanical Keyboard",
      slug: "keychron-q1-pro",
      description: "A fully customizable mechanical keyboard with QMK/VIA support. CNC aluminum body, double-gasket design, and hot-swappable switches.",
      imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600",
      originalPrice: "199.00",
      dealPrice: "159.00",
      discountPercent: 20,
      promoCode: "MECHKEY20",
      affiliateLink: "https://keychron.com/deals",
      expirationDate: new Date(Date.now() + 1 * 86400000),
      status: "ACTIVE",
      isFeatured: false,
      totalSlots: 20,
      remainingSlots: 5,
      categoryId: catMap["gaming-accessories"],
      brand: "Keychron",
      tags: ["keyboard", "mechanical", "gaming"],
    },
    {
      type: "AFFILIATE",
      title: "Nike Air Max 270 - Limited Edition Colorway",
      slug: "nike-air-max-270",
      description: "The Nike Air Max 270 delivers visible air cushioning and a sleek look. This limited edition colorway won't be available for long.",
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
      originalPrice: "150.00",
      dealPrice: "89.99",
      discountPercent: 40,
      promoCode: "NIKE40",
      affiliateLink: "https://nike.com/deals",
      expirationDate: new Date(Date.now() + 7 * 86400000),
      status: "ACTIVE",
      isFeatured: true,
      categoryId: catMap["shoes"],
      brand: "Nike",
      tags: ["shoes", "sneakers", "fashion", "limited-edition"],
    },
  ];

  for (const deal of deals) {
    try {
      await db.insert(schema.deals).values(deal);
      console.log(`  + ${deal.title}`);
    } catch (e: any) {
      console.log(`  = ${deal.title} (already exists or error: ${e.message?.substring(0, 50)})`);
    }
  }

  console.log("\nSeeding complete!");
  await pool.end();
}

seed().catch(console.error);
