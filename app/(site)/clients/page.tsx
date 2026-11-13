import type { Metadata } from "next";
import { ClientsGrid, CtaBand, PageHead } from "@/components/Sections";

export const metadata: Metadata = {
  title: "Our Clients",
  description: "Organisations that work with Elite Hive Kenya on drone, film, photography and media projects.",
  alternates: { canonical: "/clients" },
  openGraph: { url: "/clients", title: "Our Clients | Elite Hive Kenya" },
};

export default function ClientsPage() {
  return (
    <>
      <PageHead title="Our Clients" text="We partner with brands, businesses and organisations to tell their stories." photo="p14" crumbs={[{ label: "Home", href: "/" }, { label: "Our Clients" }]} />
      <ClientsGrid />
      <CtaBand />
    </>
  );
}
