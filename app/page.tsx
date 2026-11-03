import type { Metadata } from "next";
import { About, Banner, ClientStrip, ClientsGrid, Compliance, ContactBlock, CtaBand, FilmCards, Hero, Posters, Reel, ServicesList, Why } from "@/components/Sections";

export const metadata: Metadata = {
  title: { absolute: "Elite Hive Kenya | Drone Cinematography, Film & Photography in Nairobi" },
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <Hero />
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
      <CtaBand />
      <ContactBlock />
    </>
  );
}
