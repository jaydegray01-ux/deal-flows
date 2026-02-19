import { addDays, subDays, subHours } from "date-fns";

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type DealType = "AFFILIATE" | "SLOT";
export type DealStatus = "ACTIVE" | "EXPIRED" | "SOLD_OUT" | "FLAGGED" | "DISABLED";

export type Deal = {
  id: string;
  type: DealType;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  originalPrice: number;
  dealPrice: number;
  discountPercent: number;
  promoCode?: string;
  affiliateLink: string;
  expirationDate: Date;
  status: DealStatus;
  isFeatured: boolean;
  totalSlots?: number;
  remainingSlots?: number;
  createdAt: Date;
  categoryId: string;
  views: number;
  clicks: number;
};

export const CATEGORIES: Category[] = [
  { id: "1", name: "Electronics", slug: "electronics" },
  { id: "2", name: "Fashion", slug: "fashion" },
  { id: "3", name: "Home & Garden", slug: "home-garden" },
  { id: "4", name: "Software", slug: "software" },
  { id: "5", name: "Health", slug: "health" },
];

export const DEALS: Deal[] = [
  {
    id: "1",
    type: "AFFILIATE",
    title: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
    slug: "sony-wh-1000xm5",
    description: "Industry-leading noise cancellation, exceptional sound quality, and crystal-clear hands-free calling. The best headphones on the market right now with a massive discount.",
    imageUrl: "/src/assets/products/headphones.jpg",
    originalPrice: 349.99,
    dealPrice: 248.00,
    discountPercent: 29,
    promoCode: "SONY29OFF",
    affiliateLink: "https://amazon.com",
    expirationDate: addDays(new Date(), 5),
    status: "ACTIVE",
    isFeatured: true,
    createdAt: subHours(new Date(), 2),
    categoryId: "1",
    views: 1250,
    clicks: 340,
  },
  {
    id: "2",
    type: "SLOT",
    title: "Garmin Venu 2 Plus GPS Smartwatch",
    slug: "garmin-venu-2-plus",
    description: "Understand your body better with advanced health and fitness features. Make calls from your wrist when paired with your compatible smartphone.",
    imageUrl: "/src/assets/products/smartwatch.jpg",
    originalPrice: 449.99,
    dealPrice: 299.99,
    discountPercent: 33,
    promoCode: "EXCLUSIVE-GARMIN",
    affiliateLink: "https://garmin.com",
    expirationDate: addDays(new Date(), 2),
    status: "ACTIVE",
    isFeatured: true,
    totalSlots: 50,
    remainingSlots: 12,
    createdAt: subDays(new Date(), 1),
    categoryId: "1",
    views: 890,
    clicks: 450,
  },
  {
    id: "3",
    type: "AFFILIATE",
    title: "Herman Miller Aeron Ergonomic Chair",
    slug: "herman-miller-aeron",
    description: "The benchmark for ergonomic seating. Remastered design with 8Z Pellicle suspension and PostureFit SL back support.",
    imageUrl: "/src/assets/products/chair.jpg",
    originalPrice: 1250.00,
    dealPrice: 999.00,
    discountPercent: 20,
    affiliateLink: "https://hermanmiller.com",
    expirationDate: addDays(new Date(), 10),
    status: "ACTIVE",
    isFeatured: false,
    createdAt: subDays(new Date(), 3),
    categoryId: "3",
    views: 450,
    clicks: 120,
  },
  {
    id: "4",
    type: "SLOT",
    title: "Keychron Q1 Pro Wireless Mechanical Keyboard",
    slug: "keychron-q1-pro",
    description: "A fully customizable mechanical keyboard with QMK/VIA support. CNC aluminum body, double-gasket design, and hot-swappable switches.",
    imageUrl: "/src/assets/products/keyboard.jpg",
    originalPrice: 199.00,
    dealPrice: 159.00,
    discountPercent: 20,
    promoCode: "MECHKEY20",
    affiliateLink: "https://keychron.com",
    expirationDate: addDays(new Date(), 1),
    status: "SOLD_OUT",
    isFeatured: false,
    totalSlots: 20,
    remainingSlots: 0,
    createdAt: subDays(new Date(), 5),
    categoryId: "1",
    views: 2100,
    clicks: 800,
  },
  {
    id: "5",
    type: "AFFILIATE",
    title: "Adobe Creative Cloud All Apps - 1 Year",
    slug: "adobe-cc-1-year",
    description: "Get the entire collection of 20+ creative apps including Photoshop, Illustrator, Premiere Pro, and more.",
    imageUrl: "https://images.unsplash.com/photo-1626785774573-4b7993143a4d?q=80&w=2070&auto=format&fit=crop",
    originalPrice: 599.88,
    dealPrice: 359.88,
    discountPercent: 40,
    affiliateLink: "https://adobe.com",
    expirationDate: addDays(new Date(), 15),
    status: "ACTIVE",
    isFeatured: true,
    createdAt: subHours(new Date(), 5),
    categoryId: "4",
    views: 670,
    clicks: 230,
  },
  {
    id: "6",
    type: "AFFILIATE",
    title: "NordVPN 2-Year Plan + 3 Months Free",
    slug: "nordvpn-deal",
    description: "Secure your digital life with the world's leading VPN service. Fast, private, and secure.",
    imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070&auto=format&fit=crop",
    originalPrice: 285.00,
    dealPrice: 89.00,
    discountPercent: 68,
    affiliateLink: "https://nordvpn.com",
    expirationDate: addDays(new Date(), 30),
    status: "ACTIVE",
    isFeatured: false,
    createdAt: subDays(new Date(), 2),
    categoryId: "4",
    views: 3200,
    clicks: 1500,
  }
];

// Mock API Functions
export const getDeals = async () => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate latency
  return DEALS;
};

export const getDealBySlug = async (slug: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return DEALS.find(d => d.slug === slug);
};

export const getTrendingDeals = async () => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return [...DEALS].sort((a, b) => b.clicks - a.clicks).slice(0, 4);
};

export const getFeaturedDeals = async () => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return DEALS.filter(d => d.isFeatured);
};
