import Link from "next/link";

export default function NotFound() {
  return (
    <section className="pgh" style={{ minHeight: "70vh", paddingTop: 200 }}>
      <h1>Page not found</h1>
      <p>The link may be old or mistyped.</p>
      <p><Link className="by" href="/" style={{ marginTop: 24 }}>Back to home</Link></p>
    </section>
  );
}
