import Link from "next/link";
import type { CSSProperties } from "react";
import { BadgeCheck, Camera, ChevronRight, Clapperboard, Clock, Laptop, Mail, MapPin, MessageCircle, Phone, Play, Plane, ShieldCheck, Users } from "lucide-react";
import ContactForm from "./ContactForm";
import { bg, bgVar } from "@/lib/media";
import { CLIENTS, SITE, STRIP_CLIENTS, whatsappLink } from "@/lib/site";
import { SERVICES, type Service } from "@/lib/services";
import { CATEGORIES } from "@/lib/projects";

const YT = "https://youtu.be/nXsh9nMZT6w";
const ICONS = { plane: Plane, clapperboard: Clapperboard, users: Users, laptop: Laptop } as const;
export const ServiceIcon = ({ name }: { name: Service["icon"] }) => {
  const I = ICONS[name];
  return <I aria-hidden />;
};
const cssVar = (name: string, value: string) => ({ [name]: value }) as CSSProperties;
const POSTER_OV = "linear-gradient(0deg,#000d,#0000 58%)";
const CARD_OV = "linear-gradient(#0004,#000b)";

const cats = CATEGORIES.map((c) => ({ ...c, href: `/portfolio?category=${encodeURIComponent(c.name)}` }));

export function Hero() {
  return (
    <>
      <section className="hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="art" src="/images/drone.jpg" alt="Elite Hive Kenya drone in flight over the coast" fetchPriority="high" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="art-d" src="/images/photo-10.jpg" alt="Elite Hive cameraman filming a model against the Nairobi skyline" />
        <div className="cap">
          <h1>
            <span className="m">Drone Cinematography<br />Film, Photography &amp; Events</span>
            <span className="d">A new perspective on every story.</span>
          </h1>
          <p className="hs">We create compelling visual experiences through aerial cinematography, photography and strategic media production.</p>
          <p className="hn">Explore <span className="ul">our portfolio</span> and request your quote.</p>
          <Link href="/contact">Request a Quote</Link>
        </div>
      </section>
      <nav className="qb" aria-label="Services">
        {SERVICES.map((s) => (
          <Link key={s.slug} href={`/services/${s.slug}`}>
            <ServiceIcon name={s.icon} />
            <span><b>{s.title}</b><small>{s.short}</small></span>
          </Link>
        ))}
      </nav>
    </>
  );
}

export function ClientStrip() {
  return (
    <section className="st" id="work">
      <h3>Selected Clients &amp; Projects</h3>
      <ul className="sl">
        {STRIP_CLIENTS.map((k) => {
          const c = CLIENTS.find((x) => x.key === k)!;
          // eslint-disable-next-line @next/next/no-img-element
          return <li key={k}><img src={`/clients/${k}.png`} alt={c.name} /></li>;
        })}
      </ul>
    </section>
  );
}

export function Posters() {
  const items = [
    { key: "tirus", tag: "Events", title: "Tirus and Esther Foundation", href: YT, ext: true },
    ...cats.map((c) => ({ key: c.photo, tag: "Category", title: c.name, href: c.href, ext: false })),
  ];
  return (
    <div className="ps">
      {items.map((p) =>
        p.ext ? (
          <a key={p.title} className="pc" style={bg(p.key, POSTER_OV)} href={p.href} target="_blank" rel="noopener noreferrer">
            <div><small>{p.tag}</small><b>{p.title}</b></div>
          </a>
        ) : (
          <Link key={p.title} className="pc" style={bg(p.key, POSTER_OV)} href={p.href}>
            <div><small>{p.tag}</small><b>{p.title}</b></div>
          </Link>
        ),
      )}
    </div>
  );
}

export function About({ id = "about" }: { id?: string }) {
  return (
    <section className="ab" id={id}>
      <div className="in">
        <div className="abp" role="img" aria-label="Elite Hive crew filming on location" style={bg("p3")} />
        <div className="bar" />
        <h2>About Us</h2>
        <p>Elite Hive is a premier provider of drone photography, cinematography and media consultancy solutions. We empower clients across industries to tell compelling visual stories and execute media initiatives with precision and impact.</p>
        <p>Our mission is to elevate your media presence and help you connect meaningfully with your audience to meet your communication objectives. Our pilots and cinematographers are certified to the highest industry standards.</p>
        <Link className="by" href="/contact">Contact Us</Link>
        <div className="bdg">
          <div><Camera aria-hidden />Certified Pilots</div>
          <div><ShieldCheck aria-hidden />Licensed Operators</div>
          <div><BadgeCheck aria-hidden />Insurance Protocols</div>
        </div>
      </div>
    </section>
  );
}

export function Banner() {
  return (
    <>
      <div className="ph3" role="img" aria-label="Aerial view of Nairobi at dusk" style={bg("p1", "linear-gradient(#0002,#0002)")} />
      <div className="ban">Certified Pilots | Licensed Operators | Insurance Protocols</div>
    </>
  );
}

export function Reel() {
  return (
    <section className="rl" id="reel">
      <div className="in">
        <div className="bar" />
        <h2>Cinema Reel</h2>
        <a className="vf" href={YT} target="_blank" rel="noopener noreferrer" style={cssVar("--bgi", bgVar("tirus", "linear-gradient(#0003,#0003)"))} aria-label="Watch Tirus and Esther Foundation Launch Day">
          <span className="pl"><Play aria-hidden /></span>
          <span className="vc">Tirus and Esther Foundation Launch Day</span>
        </a>
        <Link className="bd" href="/portfolio">All Portfolio</Link>
      </div>
    </section>
  );
}

export function ClientsGrid() {
  return (
    <section className="tg">
      <h3>Trusted By</h3>
      <ul className="cg">
        {CLIENTS.map((c) => (
          // eslint-disable-next-line @next/next/no-img-element
          <li key={c.key}><img src={`/clients/${c.key}.png`} alt={c.name} /></li>
        ))}
      </ul>
    </section>
  );
}

export function FilmCards() {
  const cards = [
    { key: "tirus", title: "Tirus and Esther Foundation Launch Day", href: YT, ext: true },
    { key: "p8", title: "Aerial Photography", href: cats[0].href, ext: false },
    { key: "p2", title: "Film Production", href: cats[1].href, ext: false },
    { key: "p4", title: "Corporate Photography", href: cats[2].href, ext: false },
    { key: "p3", title: "Documentaries", href: cats[3].href, ext: false },
  ];
  return (
    <section className="ft">
      <div className="in">
        <h3>Film, Events, Photography &amp; Aerial</h3>
        <p>Elite Hive Kenya’s aerial drone cinematography, photography and event services help organisations tell their stories across film, commercials and live events.<br /><Link href="/portfolio">See Our Full Portfolio</Link></p>
      </div>
      <div className="vl">
        {cards.map((c) =>
          c.ext ? (
            <a key={c.title} className="v" style={cssVar("--bg", bgVar(c.key, CARD_OV))} href={c.href} target="_blank" rel="noopener noreferrer">
              <span>{c.title}</span><span className="pl"><Play aria-hidden /></span>
            </a>
          ) : (
            <Link key={c.title} className="v" style={cssVar("--bg", bgVar(c.key, CARD_OV))} href={c.href}>
              <span>{c.title}</span><em>Enquire</em>
            </Link>
          ),
        )}
      </div>
    </section>
  );
}

const GALLERY = [
  ["p13", "Aerial photography"], ["p8", "Drone cinematography"], ["p12", "Corporate photography"], ["p5", "Commercial video"],
  ["p6", "Conferences"], ["p11", "Documentaries"], ["p7", "Event videography"], ["p10", "Promotional content"],
] as const;

export function Why() {
  return (
    <section className="dk">
      <h2>Why Work With Us</h2>
      <div className="gd">
        {GALLERY.map(([k, label]) => (
          <div key={label} style={bg(k, "linear-gradient(0deg,#000d,#0000 62%)")}>{label}</div>
        ))}
        <ChevronRight className="nx" aria-hidden />
      </div>
      <p className="in">Elite Hive Kenya combines expert pilots and cinematographers, tailored packages, strict safety and compliance, and a collaborative approach with dedicated account management.</p>
    </section>
  );
}

export function Compliance() {
  return (
    <section className="pm">
      <div className="pmp" role="img" aria-label="Aerial view of a river valley at sunrise" style={bg("p13")} />
      <h2>Safety and Compliance</h2>
      <p className="it">Planned, regulated and insured operations</p>
      <p>We follow regulatory requirements, run risk assessments and apply insurance protocols on every operation. <Link href="/contact">Ask us about your shoot.</Link></p>
      <ShieldCheck aria-hidden />
    </section>
  );
}

export function ServicesList() {
  return (
    <section className="dp" id="services">
      <div className="in">
        <h2>Our Services</h2>
        {SERVICES.map((s) => (
          <div className="sv" key={s.slug}>
            <div className="im p" role="img" aria-label={`${s.title} photo`} style={bg(s.photo)} />
            <div>
              <h3><Link href={`/services/${s.slug}`}>{s.title}</Link></h3>
              <ul>
                {s.offerings.slice(0, 3).map((o) => (<li key={o.title}><b>{o.title}:</b> {o.text.toLowerCase().replace(/\.$/, "")}</li>))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="cb" style={bg("p9", "linear-gradient(90deg,#000d,#0008)")}>
      <div className="in">
        <h2>Ready to Tell Your Story?</h2>
        <p>Get in touch with us today for your next project.</p>
        <a className="by" href={whatsappLink()} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
      </div>
    </section>
  );
}

export function ContactBlock() {
  return (
    <section className="ct" id="contact">
      <div className="bar" />
      <h2>Contact</h2>
      <address>
        <MapPin aria-hidden />Based in {SITE.city}, {SITE.country}<br /><br />
        <Phone aria-hidden /><b>Tel:</b> <a href={`tel:${SITE.phoneE164}`}>{SITE.phoneDisplay}</a><br />
        <Mail aria-hidden /><b>Email:</b> <a href={`mailto:${SITE.email}`}>{SITE.email}</a><br />
        <MessageCircle aria-hidden /><a href={whatsappLink()} target="_blank" rel="noopener noreferrer">WhatsApp Link</a><br />
        <Clock aria-hidden /><i>{SITE.hours}</i>
      </address>
      <div className="ctp" role="img" aria-label="Contact Elite Hive Kenya" style={bg("p12")} />
      <ContactForm />
    </section>
  );
}

export function PageHead({ title, text, photo, crumbs }: { title: string; text?: string; photo: string; crumbs: { label: string; href?: string }[] }) {
  return (
    <section className="pgh" style={bg(photo, "linear-gradient(#000a,#000c)")}>
      <nav className="crumbs" aria-label="Breadcrumb">
        {crumbs.map((c, i) => (
          <span key={c.label}>{c.href ? <Link href={c.href}>{c.label}</Link> : c.label}{i < crumbs.length - 1 ? " / " : ""}</span>
        ))}
      </nav>
      <h1>{title}</h1>
      {text && <p>{text}</p>}
    </section>
  );
}
