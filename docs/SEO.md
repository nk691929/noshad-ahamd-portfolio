# SEO

Everything comes from `/content`, centralised in `src/lib/seo.ts`.

| Feature                                                              | Where                                                                      |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Title, description, keywords, canonical, Open Graph, Twitter, robots | `siteMetadata()` in `lib/seo.ts`, used by `app/layout.tsx`                 |
| Social share image (1200x630, uses your portrait)                    | `app/opengraph-image.tsx`                                                  |
| robots.txt, sitemap.xml                                              | `app/robots.ts`, `app/sitemap.ts`                                          |
| Structured data (Person, WebSite, ProfilePage, project list)         | `structuredData()` rendered by `components/seo/json-ld.tsx`                |
| Tab and home-screen icons, manifest                                  | `app/icon.png`, `app/apple-icon.png`, `app/favicon.ico`, `app/manifest.ts` |

## After deploying

1. Set `NEXT_PUBLIC_SITE_URL=https://www.noshadahmad.com` on Vercel and redeploy.
2. Google Search Console: add the property (`https://www.noshadahmad.com`) and verify. For the HTML-tag method set
   `GOOGLE_SITE_VERIFICATION` (the token only) on Vercel; the site adds the meta tag. Then **Sitemaps -> add `sitemap.xml`**.
3. Check the preview: paste the URL into the LinkedIn Post Inspector and the Facebook Sharing Debugger, and test structured data with Google's Rich Results Test.
4. Keep the real content readable: the headline (h1), About text and project descriptions are server-rendered HTML, so crawlers see them even though the 3D scene is client-side.

## Notes

- The 3D canvas is decorative (`aria-hidden`); all project information exists as normal text and links.
- Add a case-study route later and flip `CASE_STUDY_ROUTES_READY`; the sitemap then lists those pages automatically.
