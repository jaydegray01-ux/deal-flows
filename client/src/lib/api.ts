import { queryClient } from "./queryClient";

const API_BASE = "/api";

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }
  return res.json();
}

export const api = {
  getCategories: () => apiFetch<any[]>("/categories"),
  getCategoryTree: () => apiFetch<any[]>("/categories?tree=true"),
  getCategoryBySlug: (slug: string) => apiFetch<any>(`/categories/${slug}`),

  getDeals: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<{ deals: any[]; total: number }>(`/deals${qs}`);
  },
  getTrendingDeals: () => apiFetch<any[]>("/deals/trending"),
  getFeaturedDeals: () => apiFetch<any[]>("/deals/featured"),
  getDealBySlug: (slug: string) => apiFetch<any>(`/deals/by-slug/${slug}`),

  logClick: (dealId: string) => apiFetch<any>("/clicks", { method: "POST", body: JSON.stringify({ dealId }) }),

  subscribe: (email: string) => apiFetch<any>("/subscribe", { method: "POST", body: JSON.stringify({ email }) }),

  reportDeal: (dealId: string, reason: string) => apiFetch<any>("/reports", { method: "POST", body: JSON.stringify({ dealId, reason }) }),

  voteDeal: (dealId: string, voteType: "WORKED" | "FAILED") =>
    apiFetch<{ workedCount: number; failedCount: number; failRate: number }>(`/deals/${dealId}/vote`, {
      method: "POST",
      body: JSON.stringify({ voteType }),
    }),
  getDealVotes: (dealId: string) =>
    apiFetch<{ workedCount: number; failedCount: number; failRate: number; userVote: string | null }>(`/deals/${dealId}/votes`),

  getReferralDashboard: () => apiFetch<any>("/referral/dashboard"),
  getRaffleInfo: () => apiFetch<any>("/raffle/info"),

  getAdminDeal: (id: string) => apiFetch<any>(`/admin/deals/${id}`),
  getAdminStats: () => apiFetch<any>("/admin/stats"),
  getAdminDeals: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<{ deals: any[]; total: number }>(`/admin/deals${qs}`);
  },
  createDeal: (deal: any) => apiFetch<any>("/admin/deals", { method: "POST", body: JSON.stringify(deal) }),
  updateDeal: (id: string, deal: any) => apiFetch<any>(`/admin/deals/${id}`, { method: "PATCH", body: JSON.stringify(deal) }),
  deleteDeal: (id: string) => apiFetch<any>(`/admin/deals/${id}`, { method: "DELETE" }),
  createCategory: (cat: any) => apiFetch<any>("/admin/categories", { method: "POST", body: JSON.stringify(cat) }),

  scrapeProduct: (url: string) => apiFetch<any>("/admin/scrape-product", { method: "POST", body: JSON.stringify({ url }) }),

  drawRaffle: () => apiFetch<any>("/admin/raffle/draw", { method: "POST" }),
  getRaffleWinners: () => apiFetch<any[]>("/admin/raffle/winners"),
  getRaffleEntries: () => apiFetch<any>("/admin/raffle/entries"),
};
