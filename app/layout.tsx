import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";

const mont = Montserrat({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-mont", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Elite Hive Kenya | Beyond Vision. Beyond Limits.", template: "%s | Elite Hive Kenya" },
  description: SITE.description,
  applicationName: SITE.name,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: SITE.name, locale: "en_KE", title: "Elite Hive Kenya | Beyond Vision. Beyond Limits.", description: SITE.description, url: "/" },
  twitter: { card: "summary_large_image", title: "Elite Hive Kenya", description: SITE.description },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { themeColor: "#f2f2f2", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={mont.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
