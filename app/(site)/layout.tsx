import Header from "@/components/Header";
import Effects from "@/components/Effects";
import Link from "next/link";
import Tracker from "@/components/Tracker";
import { BRAND, SITE } from "@/lib/site";

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
        <p>{BRAND.reach.map((r, i) => (<span key={r.label}>{i > 0 && " | "}<Link href={r.href}>{r.label}</Link></span>))}</p>
        <p><Link href="/terms">Terms of Use</Link> | <Link href="/terms#part-b-privacy-policy">Privacy Policy</Link></p>
        <p>© {new Date().getFullYear()} Elite Hive Kenya Ltd. All Rights Reserved. Nairobi, Kenya.</p>
      </footer>
      <Effects />
      <Tracker />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
