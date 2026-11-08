export type Service = {
  slug: string;
  title: string;
  icon: "plane" | "clapperboard" | "users" | "laptop";
  short: string;
  intro: string;
  photo: string; // key in lib/media.ts
  offerings: { title: string; text: string }[];
};

export const SERVICES: Service[] = [
  {
    slug: "drone-solutions",
    title: "Drone Solutions",
    icon: "plane",
    short: "Stunning aerial photography and video.",
    intro:
      "Industry leading drone services specialising in high definition aerial imaging for commercial and creative work. Our licensed operators deliver safe, compliant and precise results.",
    photo: "drone",
    offerings: [
      { title: "Aerial photography", text: "Properties, landscapes, developments and events." },
      { title: "Drone cinematography", text: "Cinematic aerial footage for films, adverts and stories." },
      { title: "Aerial documentation", text: "Clear overhead records of sites and progress." },
    ],
  },
  {
    slug: "film-photography",
    title: "Film & Photography",
    icon: "clapperboard",
    short: "Professional shoots for every occasion.",
    intro:
      "From corporate portraits to full commercial productions, we plan, shoot and edit visuals that present your organisation with confidence.",
    photo: "p2",
    offerings: [
      { title: "Corporate photography", text: "Teams, offices, products and brand imagery." },
      { title: "Commercial video production", text: "Promotional films, from concept to final edit." },
      { title: "Professional photography", text: "Portraits and campaign photography." },
      { title: "Documentary production", text: "Long form stories for causes and communities." },
    ],
  },
  {
    slug: "event-coverage",
    title: "Event Coverage",
    icon: "users",
    short: "Capture what matters.",
    intro:
      "We cover events in photo and video so the moments that matter are recorded well and ready to share.",
    photo: "p4",
    offerings: [
      { title: "Corporate events", text: "Launches, award nights and showcases." },
      { title: "Conferences", text: "Speakers, panels, delegates and the room." },
      { title: "Special occasions", text: "Private and community events." },
      { title: "Event videography", text: "Highlight films and live streaming." },
    ],
  },
  {
    slug: "media-consultancy",
    title: "Media Consultancy",
    icon: "laptop",
    short: "Strategic media solutions.",
    intro:
      "We help organisations plan and run media initiatives that reach the right audience with clear objectives.",
    photo: "p14",
    offerings: [
      { title: "Media strategy", text: "Plans tied to your communication goals." },
      { title: "Digital media solutions", text: "Digital and social content for your channels." },
      { title: "Brand communication", text: "Consistent messaging across platforms." },
      { title: "Promotional content", text: "Campaign videos and material." },
    ],
  },
];
export const getService = (slug: string) => SERVICES.find((s) => s.slug === slug);
