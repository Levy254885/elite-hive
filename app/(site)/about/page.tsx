import type { Metadata } from "next";
import { About, CtaBand, PageHead, Why } from "@/components/Sections";

export const metadata: Metadata = {
  title: "About Us",
  description: "Elite Hive is a digital media and creative technology company delivering independent journalism, professional media production, aerial intelligence and innovative digital solutions.",
  alternates: { canonical: "/about" },
  openGraph: { url: "/about", title: "About Elite Hive Kenya" },
};

export default function AboutPage() {
  return (
    <>
      <PageHead title="About Us" text="Beyond Vision. Beyond Limits. We Capture. We Create. We Inform." photo="p5" crumbs={[{ label: "Home", href: "/" }, { label: "About Us" }]} />
      <About id="story" />
      <Why />
      <CtaBand />
    </>
  );
}
