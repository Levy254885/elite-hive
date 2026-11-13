import type { Metadata } from "next";

export const metadata: Metadata = { title: "Newsroom admin", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="adm">{children}</div>;
}
