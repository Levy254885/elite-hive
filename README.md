# Elite Hive Kenya Website

Next.js 15 (App Router) and TypeScript. Plain CSS design system, Lucide icons. No Tailwind.
Pages: Home, About, Our Services (and 4 service pages), Portfolio (and project pages), Our Clients, Contact.

## 1. Extract and open
1. Unzip `elite-hive-kenya.zip`.
2. VS Code: File > Open Folder > choose the `elite-hive-kenya` folder.
3. Open the terminal (Ctrl+`).

## 2. Install and run
Needs Node.js 18.18 or newer (20 or 22 recommended).
```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run build
npm start
```

## 3. Images
All photos are in `public/images`, client logos in `public/clients`. Replace a file with the same name to change it.
`lib/media.ts` lists every photo and its crop focus point (second value, for example `50% 30%` = centre, 30% from the top).

| File | Used for |
| --- | --- |
| `logo.png` | Header and footer logo |
| `drone.jpg` | Mobile hero and Drone Solutions |
| `photo-10.jpg` | Desktop hero |
| `photo-01.jpg` | Wide banner |
| `photo-09.jpg` | Call to action band |
| `photo-02` to `photo-14` | Portfolio categories, services, gallery, contact |

Notes
* Most supplied photos are about 700px wide. Replace the hero, banner and aerial images with larger versions (2000px or more) for a sharper result.
* Several photos are stock or generated images used as category covers, not Elite Hive project work. Replace them with your own shots over time.
* The Tirus and Esther Foundation card uses the film's YouTube thumbnail (needs internet).
* `public/clients/mark.png` is a client logo with no name given. Rename it in `lib/site.ts` once confirmed.

## 4. Edit content
* Business details, clients: `lib/site.ts`
* Services: `lib/services.ts`
* Portfolio projects (YouTube id and category): `lib/projects.ts`

## 5. Environment variables
Copy `.env.example` to `.env.local`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL, sitemap, sharing |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | Contact form email (Resend, verified sender domain needed) |
| `NEXT_PUBLIC_SOCIAL_*` | Social links used in structured data |

Without the Resend values the form shows email, WhatsApp and phone links instead.

## 6. Deploy to Vercel
1. Push to GitHub (`.env.local` is ignored).
2. vercel.com > Add New > Project > import the repo (Next.js is auto detected).
3. Add the environment variables, then Deploy.

## 7. Connect the domain
1. Project > Settings > Domains: add `elitehivekenya.com` and `www.elitehivekenya.com`.
2. At your registrar set the DNS records Vercel shows (usually `A 76.76.21.21` and `CNAME cname.vercel-dns.com`), removing the old Site123 records first.
3. Wait for SSL, set `NEXT_PUBLIC_SITE_URL`, redeploy, and submit `/sitemap.xml` in Google Search Console.
