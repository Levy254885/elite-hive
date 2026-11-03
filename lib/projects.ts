export const CATEGORIES = [
  { name: "Aerial Photography", photo: "p13" },
  { name: "Film Production", photo: "p5" },
  { name: "Corporate Photography", photo: "p14" },
  { name: "Documentaries", photo: "p11" },
] as const;

export type Project = {
  slug: string;
  title: string;
  category: string;
  description: string;
  youtubeId: string;
  photo: string; // key in lib/media.ts
};

/** Add real projects here. Only the project published on the current website is listed. */
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
export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug);
export const ALL_CATEGORIES = ["Events", ...CATEGORIES.map((c) => c.name)];
