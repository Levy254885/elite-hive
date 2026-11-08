import Header from "@/components/Header";
import Effects from "@/components/Effects";
import { SITE } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE.url}/#business`,
  name: SITE.name,
  url: SITE.url,
  image: `${SITE.url}/images/logo.png`,
  description: SITE.description,
  email: SITE.email,
  areaServed: "Kenya",
  address: { "@type": "PostalAddress", addressLocality: SITE.city, addressCountry: "KE" },
  openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "17:00" }],
  sameAs: SITE.socials.map((s) => s.href),
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="top">{children}</main>
      <footer>
        <span className="fl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" width={334} height={303} alt="Elite Hive Kenya" />
        </span>
        <p>We Capture. We Create. We Inform.</p>
        <p>Kenya | Africa | The World</p>
        <p>Elite Hive Kenya © {new Date().getFullYear()}. Nairobi, Kenya.</p>
      </footer>
      <Effects />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
