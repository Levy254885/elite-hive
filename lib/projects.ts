export const CATEGORIES = [
  { name: "Aerial Photography", photo: "p13" },
  { name: "Film Production", photo: "p5" },
  { name: "Corporate Photography", photo: "p14" },
  { name: "Documentaries", photo: "p11" },
] as const;

/** Categories offered in the admin dashboard and the portfolio filter. */
export const ALL_CATEGORIES: string[] = ["Events", ...CATEGORIES.map((c) => c.name)];

export type Project = {
  slug: string;
  title: string;
  category: string;
  description: string;
  client?: string;
  youtubeId?: string;
  /** Key in lib/media.ts (built in photos) */
  photo?: string;
  /** Cloudinary or other https image */
  coverUrl?: string;
  gallery?: string[];
};

/** Project saved in Firestore by the admin dashboard. */
export type ProjectRecord = Omit<Project, "gallery"> & {
  id: string;
  gallery: string[];
  coverId: string;
  galleryIds: string[];
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

/** Built in projects. Projects added in /admin appear before these. */
export const PROJECTS: Project[] = [
  {
    slug: "tirus-and-esther-foundation-launch-day",
    title: "Tirus and Esther Foundation Launch Day",
    category: "Events",
    description: "Video coverage of the launch day of the Tirus and Esther Foundation.",
    youtubeId: "nXsh9nMZT6w",
    photo: "tirus",
  },
];

/** Accepts a full YouTube link or an 11 character video id. Returns "" if it is not valid. */
export function youtubeIdFrom(input: string): string {
  const v = input.trim();
  if (!v) return "";
  if (/^[\w-]{11}$/.test(v)) return v;
  const m = v.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
  return m ? m[1] : "";
}
