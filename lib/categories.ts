export const NEWS_CATEGORIES = [
  { slug: "news", label: "General News" },
  { slug: "kenya", label: "Kenya" },
  { slug: "africa", label: "Africa" },
  { slug: "world", label: "World" },
  { slug: "politics", label: "Politics" },
  { slug: "business", label: "Business" },
  { slug: "technology", label: "Technology" },
  { slug: "innovation", label: "Innovation" },
  { slug: "media", label: "Media" },
  { slug: "entertainment", label: "Entertainment" },
  { slug: "fashion", label: "Fashion" },
  { slug: "lifestyle", label: "Lifestyle" },
  { slug: "music", label: "Music" },
  { slug: "sports", label: "Sports" },
  { slug: "health", label: "Health" },
  { slug: "education", label: "Education" },
  { slug: "science", label: "Science" },
  { slug: "environment", label: "Environment" },
  { slug: "agriculture", label: "Agriculture" },
  { slug: "real-estate", label: "Real Estate" },
  { slug: "travel", label: "Travel and Tourism" },
  { slug: "food", label: "Food and Drink" },
  { slug: "culture", label: "Culture and Heritage" },
  { slug: "automotive", label: "Automotive" },
  { slug: "security", label: "Crime and Security" },
  { slug: "opinion", label: "Opinion" },
] as const;

export type CategorySlug = (typeof NEWS_CATEGORIES)[number]["slug"];
const SLUGS: string[] = NEWS_CATEGORIES.map((c) => c.slug);

export const isCategory = (v: unknown): v is CategorySlug => typeof v === "string" && SLUGS.includes(v);
export const categoryLabel = (slug: string) => NEWS_CATEGORIES.find((c) => c.slug === slug)?.label ?? "General News";
