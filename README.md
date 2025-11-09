# KOC Cricket Website

Astro + Decap CMS starter tailored for the Koç University Cricket Club. It ships with news, schedule, gallery,
and about pages plus free integrations for comments (giscus), Google Calendar embeds, and social media iframes.

## Stack

- [Astro](https://astro.build) static site (ideal for GitHub Pages)
- Content collections powered by `src/content` + Markdown
- [Decap CMS](https://decapcms.org/) for editing via `/admin`
- [giscus](https://giscus.app) comments mapped to GitHub Discussions
- Google Calendar + Instagram/YouTube embeds for zero-cost media

## Getting started

```bash
npm install
npm run dev
```

The dev server runs at http://localhost:4321. Edit Markdown inside `src/content` or publish via `/admin` (requires
running `npx decap-server` locally for auth-free testing).

## Content model

| Collection | Location               | Purpose                          |
|----------- |----------------------- |----------------------------------|
| `news`     | `src/content/news`     | Weekly posts, match reports      |
| `matches`  | `src/content/matches`  | Fixtures w/ calendar links       |
| `gallery`  | `src/content/gallery`  | Instagram/YouTube/photo embeds   |

Every entry can be created in Markdown (frontmatter + body) or via Decap CMS.

## CMS setup

1. Create a GitHub Personal Access Token (classic) with `repo` scope and keep it in the Decap auth modal.
2. Update `public/admin/config.yml` with your GitHub username/repo if different.
3. Commit and push to `main`, then open `/admin` on the deployed site to publish content.

`public/uploads` is the default media folder referenced by Decap, so add custom assets there.

## giscus configuration

1. Visit https://giscus.app and pick the repo + category to back comments.
2. Copy the repo ID + category ID into `.env` (see `.env.example`).
3. Deploy; the news article pages will render the widget automatically.

## Deployment (GitHub Pages)

1. Push the repo to GitHub, then open **Settings → Pages**.
2. Choose **Deploy from a branch** and select `main` + `/ (root)`.
3. Update `astro.config.mjs` `site` + `base` if your username or repo name differs.

Optional GUI deploys (Netlify/Vercel) also work—just map the build command `npm run build` and output `dist/`.

## Social media tips

- Instagram: post match-day stories + reels, use the same handle handle (`@koccricket`).
- LinkedIn Page: highlight leadership, academics, and match recaps weekly.
- Embed Google Calendar on `/schedule` so visitors can add reminders instantly.
