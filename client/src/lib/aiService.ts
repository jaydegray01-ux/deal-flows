export type AiDescriptionResponse = {
  description: string;
  bullets: string[];
};

export type AiSeoResponse = {
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
};

export type AiSocialResponse = {
  scripts: string[];
  captions: string[];
  hashtags: string[];
};

export type AiEmailResponse = {
  subjects: string[];
  previewTexts: string[];
  shortEmail: string;
  longEmail: string;
};

export type AiPushResponse = {
  pushNotifications: string[];
};

export type AiTagResponse = {
  category: string;
  tags: string[];
  slugSuggestions: string[];
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const aiService = {
  generateDescription: async (deal: any): Promise<AiDescriptionResponse> => {
    await delay(1500);
    return {
      description: `Experience the ultimate performance with the ${deal.title || 'this product'}. Designed for those who demand excellence, this item features cutting-edge technology to enhance your daily life. Whether you're at home or on the go, you'll appreciate the durable build and intuitive design. Don't miss out on this limited-time offer to upgrade your setup at an unbeatable price.`,
      bullets: [
        "Premium quality construction for long-lasting durability",
        "Advanced features that streamline your workflow",
        "Compact and lightweight design for portability",
        "Industry-leading performance in its class",
        "Backed by a 100% satisfaction guarantee"
      ]
    };
  },

  generateSeo: async (deal: any): Promise<AiSeoResponse> => {
    await delay(1200);
    return {
      seoTitle: `Save ${deal.discountPercent || 20}% on ${deal.title || 'Product'} - Limited Time Offer`,
      metaDescription: `Get the best deal on ${deal.title || 'this product'}. Only $${deal.dealPrice || '99'} (Reg. $${deal.originalPrice || '120'}). Limited stock available. Shop now at DealFlow!`,
      keywords: ["deal", "discount", "sale", "best price", "offer", "promo code", "savings"]
    };
  },

  generateSocial: async (deal: any): Promise<AiSocialResponse> => {
    await delay(1800);
    return {
      scripts: [
        `[Scene: Person holding product]\n"Guys, you won't believe the deal I just found on ${deal.title}!"\n[Cut to close up]\n"It's normally $${deal.originalPrice} but right now it's only $${deal.dealPrice}!"\n[Text overlay: Link in Bio]`,
        `Stop scrolling! If you've been looking for ${deal.title}, now is the time to buy. We have a verified code for ${deal.discountPercent}% off. Link in bio to grab yours before it sells out!`
      ],
      captions: [
        `HOT DEAL ALERT: Get ${deal.discountPercent}% OFF ${deal.title}! Run, don't walk!`,
        `Why pay full price? Score the ${deal.title} for just $${deal.dealPrice} today. Link in bio!`,
        `Steal of the day! ${deal.title} is at its lowest price ever. Tag a friend who needs this!`
      ],
      hashtags: ["#dealflow", "#discounts", "#sale", "#techdeals", "#musthave", "#shoppinghacks"]
    };
  },

  generateEmail: async (deal: any): Promise<AiEmailResponse> => {
    await delay(1500);
    return {
      subjects: [
        `${deal.discountPercent}% OFF: ${deal.title}`,
        `Price Drop Alert: ${deal.title} is on sale!`,
        `Don't miss this exclusive deal on ${deal.title}`,
        `Your secret code for ${deal.title} is inside...`
      ],
      previewTexts: [
        `Save big on your favorite tech today.`,
        `Limited time offer ending soon.`,
        `Get it for only $${deal.dealPrice} while supplies last.`
      ],
      shortEmail: `Hey there,\n\nWe just spotted a massive price drop on the ${deal.title}.\n\nOriginal Price: $${deal.originalPrice}\nDeal Price: $${deal.dealPrice}\n\nUse code: ${deal.promoCode || 'DEALFLOW'} at checkout.\n\n[Shop Now Button]`,
      longEmail: `Hi Friend,\n\nAre you looking to upgrade your setup? We've got just the thing.\n\nThe ${deal.title} is currently ${deal.discountPercent}% off, bringing the price down to just $${deal.dealPrice}.\n\nWhy we love it:\n- Great value for money\n- Top-rated performance\n- Sleek design\n\nDon't wait too long, this offer won't last forever.\n\nHappy Savings,\nThe DealFlow Team`
    };
  },

  generatePush: async (deal: any): Promise<AiPushResponse> => {
    await delay(1000);
    return {
      pushNotifications: [
        `Flash Sale: ${deal.title} is ${deal.discountPercent}% off!`,
        `Ending Soon: Save on ${deal.title}`,
        `You have a new exclusive deal waiting...`,
        `Price Drop! ${deal.title} is now $${deal.dealPrice}`
      ]
    };
  },

  suggestTags: async (deal: any): Promise<AiTagResponse> => {
    await delay(1200);
    const slugBase = (deal.title || "product").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return {
      category: "Electronics",
      tags: ["tech", "gadgets", "upgrade", "sale", "2024best", "verified"],
      slugSuggestions: [
        slugBase,
        `${slugBase}-deal`,
        `${slugBase}-sale`,
      ]
    };
  }
};
