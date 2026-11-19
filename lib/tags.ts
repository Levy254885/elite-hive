/** Turns a tag such as "Drone Filming" into a web friendly slug: "drone-filming". */
export const tagSlug = (t: string) =>
  t.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const tagHref = (t: string) => `/newsroom?tag=${encodeURIComponent(tagSlug(t))}`;
