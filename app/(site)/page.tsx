import type { Metadata } from "next";
import { LatestNews } from "@/components/Newsroom";
import { About, Banner, ClientStrip, TagStrip, ClientsGrid, Compliance, ContactBlock, CtaBand, FilmCards, Hero, Posters, Reel, ServicesList, Why } from "@/components/Sections";

export const metadata: Metadata = {
  title: { absolute: "Elite Hive Kenya | Beyond Vision. Beyond Limits." },
  alternates: { canonical: "/" },
};

export const revalidate = 60;

export default function Home() {
  return (
    <>
      <Hero />
      <TagStrip />
      <ClientStrip />
      <Posters />
      <About />
      <Banner />
      <Reel />
      <ClientsGrid />
      <FilmCards />
      <Why />
      <Compliance />
      <ServicesList />
      <LatestNews />
      <CtaBand />
      <ContactBlock />
    </>
  );
}
