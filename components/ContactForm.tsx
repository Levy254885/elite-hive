"use client";

import { useState } from "react";
import { SITE, whatsappLink } from "@/lib/site";

type State = { s: "idle" | "loading" | "ok" | "err"; msg?: string; fallback?: boolean };

export default function ContactForm() {
  const [st, setSt] = useState<State>({ s: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setSt({ s: "loading" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => ({}))) as { message?: string };
      if (res.ok) {
        form.reset();
        setSt({ s: "ok", msg: "Thank you. We will reply to your enquiry on the next working day." });
      } else if (res.status === 503) {
        setSt({ s: "err", fallback: true, msg: "Online enquiries are temporarily unavailable. Please reach us directly:" });
      } else {
        setSt({ s: "err", msg: json.message ?? "Something went wrong. Please check your details and try again." });
      }
    } catch {
      setSt({ s: "err", msg: "We could not send your message. Check your connection and try again." });
    }
  }

  return (
    <form onSubmit={onSubmit} aria-busy={st.s === "loading"}>
      <input name="name" placeholder="Name" required minLength={2} maxLength={100} autoComplete="name" aria-label="Name" />
      <input name="email" type="email" placeholder="Email" required maxLength={150} autoComplete="email" aria-label="Email" />
      <input name="phone" type="tel" placeholder="Phone" maxLength={30} autoComplete="tel" aria-label="Phone" />
      <textarea name="message" placeholder="Message" required minLength={10} maxLength={3000} aria-label="Message" />
      <div className="hidden" aria-hidden style={{ display: "none" }}>
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className={`fm ${st.s === "err" ? "err" : st.s === "ok" ? "ok" : ""}`} role={st.s === "err" ? "alert" : "status"}>
        {st.msg}
        {st.fallback && (
          <>
            {" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>, <a href={whatsappLink()}>WhatsApp</a>, <a href={`tel:${SITE.phoneE164}`}>{SITE.phoneDisplay}</a>
          </>
        )}
      </div>
      <button className="sb" type="submit" disabled={st.s === "loading"}>
        {st.s === "loading" ? "Sending..." : "Submit"}
      </button>
    </form>
  );
}
