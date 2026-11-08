import type { CSSProperties } from "react";

type Photo = { src: string; pos: string };

/** Every photo used by the site. Replace a file in /public/images to change it. */
export const PHOTOS: Record<string, Photo> = {
  p1: { src: "/images/photo-01.jpg", pos: "50% 55%" },
  p2: { src: "/images/photo-02.jpg", pos: "62% 50%" },
  p3: { src: "/images/photo-03.jpg", pos: "55% 55%" },
  p4: { src: "/images/photo-04.jpg", pos: "50% 38%" },
  p5: { src: "/images/photo-05.jpg", pos: "50% 50%" },
  p6: { src: "/images/photo-06.jpg", pos: "45% 45%" },
  p7: { src: "/images/photo-07.jpg", pos: "35% 40%" },
  p8: { src: "/images/photo-08.jpg", pos: "50% 62%" },
  p9: { src: "/images/photo-09.jpg", pos: "50% 55%" },
  p10: { src: "/images/photo-10.jpg", pos: "66% 30%" },
  p11: { src: "/images/photo-11.jpg", pos: "50% 50%" },
  p12: { src: "/images/photo-12.jpg", pos: "50% 22%" },
  p13: { src: "/images/photo-13.jpg", pos: "50% 50%" },
  p14: { src: "/images/photo-14.jpg", pos: "55% 40%" },
  drone: { src: "/images/drone.jpg", pos: "50% 48%" },
  // Real frame from the Tirus and Esther Foundation film (YouTube thumbnail)
  tirus: { src: "https://i.ytimg.com/vi/nXsh9nMZT6w/hqdefault.jpg", pos: "50% 50%" },
};

const NONE = "linear-gradient(#0000,#0000)";

export function bg(key: string, overlay: string = NONE): CSSProperties {
  const p = PHOTOS[key];
  return { background: `${overlay},url(${p.src}) ${p.pos}/cover`, backgroundColor: "#222" };
}

/** CSS variable value used by video cards and the reel frame. */
export function bgVar(key: string, overlay: string = NONE) {
  const p = PHOTOS[key];
  return `${overlay},url(${p.src}) ${p.pos}/cover`;
}

/** Background style for any image URL (for example a Cloudinary cover image). */
export function bgUrl(url: string, overlay: string = NONE): CSSProperties {
  return { background: `${overlay},url(${url}) 50% 50%/cover`, backgroundColor: "#222" };
}

/** Adds Cloudinary delivery optimisation (automatic format and quality, limited width). */
export function cld(url: string, width = 1200): string {
  return url.includes("res.cloudinary.com") ? url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`) : url;
}
