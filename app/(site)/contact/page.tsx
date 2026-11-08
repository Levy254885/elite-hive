import type { Metadata } from "next";
import { ContactBlock, PageHead } from "@/components/Sections";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact Elite Hive Kenya in Nairobi for drone photography, film, event coverage and media consultancy. Send an enquiry or email us to request a quote.",
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact", title: "Contact Elite Hive Kenya" },
};

export default function ContactPage() {
  return (
    <>
      <PageHead title="Ready to Tell Your Story?" text="Get in touch with us today for your next project." photo="p9" crumbs={[{ label: "Home", href: "/" }, { label: "Contact Us" }]} />
      <ContactBlock />
    </>
  );
}
