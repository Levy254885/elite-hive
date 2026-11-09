# Elite Hive Kenya Website
Next.js 15 (App Router) and TypeScript. Plain CSS design system, Lucide icons.
Firebase (Authentication and Firestore) and Cloudinary power the newsroom and its admin dashboard.

Pages: Home, About, Our Services (and 4 service pages), Portfolio (and project pages), Newsroom (news and blogs), Our Clients, Contact, and the private `/admin` dashboard.

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
Copy `.env.example` to `.env.local` and fill it in (sections 4 to 6). The public site works without Firebase and Cloudinary; the newsroom simply shows no articles until they are set up.

## 3. Mobile hero video
The hero video is already included at **`public/videos/hero-mobile.mp4`** (compressed from your 92 second original to about 5 MB, audio removed). It autoplays muted and loops on phones and tablets. To change it, replace the file with the same name. `public/videos/hero-mobile-poster.jpg` is the picture shown while it loads. Details are in `public/videos/README.txt`.

## 4. Firebase setup (database and sign in)
1. https://console.firebase.google.com > Add project.
2. Build > Authentication > Get started > enable **Email/Password**. Then Users > Add user: create the admin account(s).
3. Build > Firestore Database > Create database (production mode). Then open the Rules tab and paste the contents of `firestore.rules` (blocks all direct browser access; the server uses the Admin key).
4. Project settings > General > Your apps > add a **Web app**. Copy the config into `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`.
5. Project settings > Service accounts > Generate new private key. From the downloaded JSON copy `project_id`, `client_email` and `private_key` into `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (keep the quotes and the `\n` characters).
6. Set `ADMIN_EMAILS` to the emails allowed to use the dashboard (comma separated). They must also exist in Firebase Authentication.

## 5. Cloudinary setup (news images)
1. https://cloudinary.com > Dashboard. Copy Cloud name, API Key and API Secret into `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
2. Images upload from the dashboard to the folder `elite-hive/newsroom`. Deleting a post or replacing its cover also removes the old image.

## 6. Contact form email (optional)
The contact form sends through Resend: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` (a sender on a domain you verified in Resend). Without them the form shows the company email address instead. All "Request a Quote" buttons open an email to elitehivekenya@gmail.com. No phone number is shown anywhere on the site.

## 7. Using the dashboard
1. Go to `/admin` and sign in.
2. New post: choose News or Blog, write a title and summary, upload a cover image, write the article. Toolbar: heading, bold, italic, list, link, **Add image** (uploads to Cloudinary and inserts it), Preview.
3. Save as draft, or Publish. Published posts appear on `/newsroom`, on the home page (latest three) and in the sitemap within about a minute.
4. The posts list lets you edit, publish or unpublish, view and delete.

Article writing format: a blank line between paragraphs, `## Heading`, `**bold**`, `*italic*`, `- list item`, `[link text](https://...)`.

## 8. Edit content
* Business details, clients: `lib/site.ts`
* Services: `lib/services.ts`
* Portfolio projects (YouTube id and category): `lib/projects.ts`
* Photos: `public/images`, crop focus points in `lib/media.ts`. Client logos: `public/clients`.
* `public/clients/mark.png` is a client logo with no name given. Rename it in `lib/site.ts` once confirmed.

## 9. Deploy to Vercel
1. Push to GitHub (`.env.local` is ignored by git).
2. vercel.com > Add New > Project > import the repository (Next.js is auto detected).
3. Settings > Environment Variables: add every variable from `.env.example`. For `FIREBASE_PRIVATE_KEY` paste the whole value including the `\n` sequences.
4. Deploy. In Firebase Authentication > Settings > Authorized domains, add your Vercel and production domains.

## 10. Connect the domain
1. Project > Settings > Domains: add `elitehivekenya.com` and `www.elitehivekenya.com`.
2. At your registrar set the DNS records Vercel shows (usually `A 76.76.21.21` and `CNAME cname.vercel-dns.com`), removing the old Site123 records first.
3. Wait for SSL, set `NEXT_PUBLIC_SITE_URL`, redeploy, and submit `/sitemap.xml` in Google Search Console.
