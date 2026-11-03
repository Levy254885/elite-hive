import type { Metadata } from "next";
import { About, CtaBand, PageHead, Why } from "@/components/Sections";

export const metadata: Metadata = {
  title: "About Us",
  description: "Elite Hive Kenya is a Nairobi based creative production company offering drone photography, cinematography and media consultancy.",
  alternates: { canonical: "/about" },
  openGraph: { url: "/about", title: "About Elite Hive Kenya" },
};

export default function AboutPage() {
  return (
    <>
      <PageHead title="About Us" text="Creativity. Innovation. Impact." photo="p5" crumbs={[{ label: "Home", href: "/" }, { label: "About Us" }]} />
      <About id="story" />
      <Why />
      <CtaBand />
    </>
  );
}
