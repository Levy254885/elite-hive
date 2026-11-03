export const SITE = {
  name: "Elite Hive Kenya",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.elitehivekenya.com",
  description:
    "Elite Hive Kenya is a Nairobi based creative production company offering drone photography and cinematography, film and photography, event coverage and media consultancy.",
  phoneDisplay: "+254 713 278 005",
  phoneE164: "+254713278005",
  whatsappNumber: "254713278005",
  email: "elitehivekenya@gmail.com",
  city: "Nairobi",
  country: "Kenya",
  hours: "Monday to Friday, 8am to 5pm",
  mission:
    "To elevate your media presence and help you connect meaningfully with your audience to meet your communication objectives.",
  socials: [
    { label: "Instagram", href: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM ?? "" },
    { label: "Facebook", href: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK ?? "" },
    { label: "YouTube", href: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE ?? "" },
    { label: "LinkedIn", href: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN ?? "" },
  ].filter((s) => s.href),
};

export function whatsappLink(message = "Hello Elite Hive Kenya, I would like to discuss a project.") {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

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
