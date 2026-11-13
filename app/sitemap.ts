import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { SERVICES } from "@/lib/services";
import { allProjects } from "@/lib/projects-db";
import { listPublished } from "@/lib/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const routes = ["", "/about", "/services", "/portfolio", "/newsroom", "/clients", "/contact"];
  const posts = await listPublished(500);
  const projects = await allProjects();
  return [
    ...routes.map((r) => ({ url: `${SITE.url}${r}`, lastModified: now, changeFrequency: "monthly" as const, priority: r === "" ? 1 : 0.8 })),
    ...SERVICES.map((s) => ({ url: `${SITE.url}/services/${s.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...projects.map((p) => ({ url: `${SITE.url}/portfolio/${p.slug}`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.6 })),
    ...posts.map((p) => ({ url: `${SITE.url}/newsroom/${p.slug}`, lastModified: new Date(p.updatedAt || now), changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
