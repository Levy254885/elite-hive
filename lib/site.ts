export const SITE = {
  name: "Elite Hive Kenya",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.elitehivekenya.com",
  description:
    "Elite Hive is a digital media and creative technology company delivering independent journalism, professional media production, aerial intelligence and innovative digital solutions. Kenya, Africa and the world.",
  email: "elitehivekenya@gmail.com",
  city: "Nairobi",
  country: "Kenya",
  hours: "Monday to Friday, 8am to 5pm",
  mission:
    "To inform, inspire and connect audiences through credible journalism, powerful storytelling and innovative technology.",
  socials: [
    { label: "Instagram", href: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM ?? "" },
    { label: "Facebook", href: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK ?? "" },
    { label: "YouTube", href: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE ?? "" },
    { label: "LinkedIn", href: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN ?? "" },
  ].filter((s) => s.href),
};

/** Every "Request a Quote" button opens an email to the company. */
export const QUOTE_HREF = `mailto:${SITE.email}?subject=${encodeURIComponent("Quote request")}&body=${encodeURIComponent(
  "Hello Elite Hive Kenya,\n\nI would like a quote for:\n\nService:\nDate:\nLocation:\nProject details:\n\nThank you.",
)}`;
export const BRAND = {
  headline: "Beyond Vision. Beyond Limits.",
  verbs: "We Capture. We Create. We Inform.",
  pillars: ["News", "Media", "Technology", "Innovation"],
  reach: ["Kenya", "Africa", "The World"],
};

export const EMAIL_HREF = `mailto:${SITE.email}`;

/** Client logos supplied by Elite Hive Kenya (files in /public/clients). */
export const CLIENTS = [
  { key: "spa", name: "SPA Communications" },
  { key: "rubrina", name: "Rubrina Properties" },
  { key: "rise", name: "RISE Our World Heritage" },
  { key: "citizen", name: "Citizen Television" },
  { key: "auscare", name: "Auscare International College" },
  { key: "mark", name: "Client logo" }, // rename once the client name is confirmed
  { key: "schneider", name: "Schneider Electric" },
  { key: "visions", name: "Visions Digital" },
] as const;
export const STRIP_CLIENTS = ["citizen", "schneider", "visions"] as const;
