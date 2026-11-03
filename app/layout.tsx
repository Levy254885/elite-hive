import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Effects from "@/components/Effects";
import { SITE } from "@/lib/site";

const mont = Montserrat({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-mont", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Elite Hive Kenya | Drone Cinematography, Film & Photography in Nairobi", template: "%s | Elite Hive Kenya" },
  description: SITE.description,
  applicationName: SITE.name,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: SITE.name, locale: "en_KE", title: "Elite Hive Kenya | A New Perspective on Every Story", description: SITE.description, url: "/" },
  twitter: { card: "summary_large_image", title: "Elite Hive Kenya", description: SITE.description },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { themeColor: "#f2f2f2", width: "device-width", initialScale: 1, viewportFit: "cover" };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE.url}/#business`,
  name: SITE.name,
  url: SITE.url,
  image: `${SITE.url}/images/logo.png`,
  description: SITE.description,
  telephone: SITE.phoneE164,
  email: SITE.email,
  areaServed: "Kenya",
  address: { "@type": "PostalAddress", addressLocality: SITE.city, addressCountry: "KE" },
  openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "17:00" }],
  sameAs: SITE.socials.map((s) => s.href),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={mont.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <Header />
        <main id="top">{children}</main>
        <footer>
          <span className="fl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" width={334} height={303} alt="Elite Hive Kenya" />
          </span>
          <p>Elite Hive Kenya © {new Date().getFullYear()}. Nairobi, Kenya.</p>
        </footer>
        <Effects />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
