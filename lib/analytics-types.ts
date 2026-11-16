export type DayPoint = { date: string; views: number; visitors: number };
export type Slice = { label: string; value: number };
export type PageStat = { path: string; label: string; kind: "home" | "article" | "project" | "page"; views: number };

export type AnalyticsData = {
  range: number;
  generatedAt: string;
  collecting: boolean; // false when the database is not configured
  series: DayPoint[];
  totals: { views: number; visitors: number; contacts: number; emailClicks: number; quoteClicks: number };
  previous: { views: number; visitors: number; contacts: number; emailClicks: number; quoteClicks: number };
  devices: Slice[];
  sources: Slice[];
  countries: Slice[];
  pages: PageStat[];
  topArticles: (PageStat & { category: string })[];
  topProjects: PageStat[];
  content: {
    published: number;
    drafts: number;
    projectsPublished: number;
    projectsDrafts: number;
    byCategory: Slice[];
  };
  system: {
    database: { ok: boolean; ms: number };
    auth: boolean;
    images: boolean;
    email: boolean;
    admins: number;
    deploy: { env: string; commit: string; branch: string; region: string };
  };
};
