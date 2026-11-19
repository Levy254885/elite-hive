import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { CtaBand, PageHead } from "@/components/Sections";
import { headingId, renderMarkdown } from "@/lib/markdown";

export const metadata: Metadata = {
  title: "Terms of Use and Privacy Policy",
  description: "The Terms of Use and Privacy Policy of Elite Hive Kenya Ltd, including how we handle personal data under the Kenya Data Protection Act, 2019.",
  alternates: { canonical: "/terms" },
  openGraph: { url: "/terms", title: "Terms of Use and Privacy Policy | Elite Hive Kenya" },
};

const SOURCE = fs.readFileSync(path.join(process.cwd(), "content", "terms-and-privacy.md"), "utf8");

export default function TermsPage() {
  const parts = [...SOURCE.matchAll(/^# (.+)$/gm)].map((m) => m[1]);
  const sections = [...SOURCE.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  return (
    <>
      <PageHead title="Terms of Use and Privacy Policy" text="Elite Hive Kenya Ltd. Effective 15 November 2026." photo="p6" crumbs={[{ label: "Home", href: "/" }, { label: "Terms and Privacy" }]} />
      <section className="pg legal">
        <nav className="toc" aria-label="Contents">
          <h2>Contents</h2>
          <p className="parts">{parts.map((p) => (<a key={p} href={`#${headingId(p)}`}>{p.replace(/^PART [A-Z]: /, "")}</a>))}</p>
          <ol>{sections.map((s) => (<li key={s}><a href={`#${headingId(s)}`}>{s.replace(/^\d+\.\s*/, "")}</a></li>))}</ol>
        </nav>
        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(SOURCE) }} />
      </section>
      <CtaBand />
    </>
  );
}
