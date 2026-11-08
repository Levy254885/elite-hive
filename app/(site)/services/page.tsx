import type { Metadata } from "next";
import { CtaBand, PageHead, ServicesList } from "@/components/Sections";

export const metadata: Metadata = {
  title: "Our Services",
  description: "Drone solutions, film and photography, event coverage and media consultancy from Elite Hive Kenya in Nairobi.",
  alternates: { canonical: "/services" },
  openGraph: { url: "/services", title: "Our Services | Elite Hive Kenya" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHead title="Our Services" text="From the air to the ground, we bring your vision to life with creativity and precision." photo="p8" crumbs={[{ label: "Home", href: "/" }, { label: "Our Services" }]} />
      <ServicesList />
      <CtaBand />
    </>
  );
}
