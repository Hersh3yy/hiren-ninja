<!--
  PROJECT.md — the living map of this repo. One file to open and know where things stand.
  Maintained by the `project-map` skill. The assessment (status/issues/roadmap) is refreshed
  each session; the Diary at the bottom only grows. App-code changes need a green light;
  main is merged to only when sure.
-->
<!-- clickup_list: not linked yet -->

# hiren.ninja — map

**What it is** · Hiren's personal portfolio at [hiren.ninja](https://hiren.ninja): a landing page, a filterable **projects** gallery, a **services** page (with a request form), an **about** page, a blog stub, and interactive **experiments** (a Three.js LED-sculpture generator).
**Stack** · Nuxt 4 · Vue 3 · Tailwind 3 · `@nuxtjs/apollo` (Hygraph GraphQL) · `motion-v` (animation) · Three.js + Vanta · Umami analytics · Netlify function for the contact form · deployed on Netlify from GitHub (`Hersh3yy/hiren-ninja`).
**Content** · `projects` from **Hygraph** (moving to **VAMS** — see ticket) · `services` + `skills` are **hardcoded** · the service-request form → a **ClickUp** task via a Netlify function.
**Status** · 🟢 `main` builds again (rework commits since 2026-09-09). Packages updated to latest safe versions on branch **`experiment/ade-radar`** (Nuxt 4.5.2), build + dev verified. Branch `fix/build-sitemap` is still unmerged and now diverged from `main`. Secrets and the SEO/perf/a11y backlog below were assessed on 2026-09-09 and not re-checked.
**Repo** · `koala/hiren-ninja` · GitHub `Hersh3yy/hiren-ninja` · working branch **`experiment/ade-radar`**; `main` is sacred.
**Current experiment** · **ADE Radar**: match your music against the Amsterdam Dance Event 2026 lineup. Plan: [`docs/experiments/ade-radar-plan.md`](docs/experiments/ade-radar-plan.md).
**Package manager** · **npm** (only `package-lock.json` exists; the `packageManager: yarn` field is misleading — there's no `yarn.lock`).
**ClickUp** · not linked yet (needs a list id + the token in the env).
**Last assessed** · 2026-09-27

---

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # nuxt build (server)   — green on branch fix/build-sitemap
npm run generate   # static
```
Gotchas: **`main` HEAD does not build** — `motion-v` 1.10.3 renamed `Presence`→`AnimatePresence` (fixed on the branch). Content needs the Hygraph endpoint (baked into the client today). The mixed lockfile means use **npm**, not yarn.

## Status

A genuinely characterful portfolio — real interactive Three.js work, tasteful `motion-v` animation, a thoughtful `Base/CONVENTIONS.md`. But it's mid-refactor and rough at the edges: the build was broken at HEAD, there are two committed secrets, sitewide-broken OG images, a 2.4 MB hero image with no image pipeline, WebGL leaks, and a large a11y gap. None of it is deep architectural breakage — it's a backlog. There's also **staged WIP** on `main` (a `nuxt-mcp` + About-section refactor) preserved as its own commit on the branch.

## Issues

Worst first. Grounded in two fan-out audits (frontend; integrations/security). Secrets cited by location only.

| Sev | Issue | Where |
|---|---|---|
| ~~critical~~ **fixed** | ~~Build broken~~ — `motion-v` `Presence`→`AnimatePresence` rename (branch `fix/build-sitemap`) | `Project/Modal.vue` · `pages/projects.vue` |
| critical | **Hygraph Bearer JWT hardcoded and shipped to the browser.** It's in the Apollo *client* config, so it's in the client bundle; its `aud` includes `management-next.graphcms.com` (looks management-scoped, not read-only). **Rotate it.** (Hiren will rotate + env-ize the keys himself.) | `nuxt.config.ts:52` |
| high | **ClickUp token hardcoded** in the Netlify function (server-side, but committed → in history), and the endpoint is CORS `*` with no auth/rate-limit → open spam vector. Rotate + env. | `netlify/functions/service-request.ts:4,65` |
| ~~serious~~ **fixed** | ~~Sitemap disabled~~ — replaced the commented-out `nuxt-simple-sitemap` with `@nuxtjs/sitemap` v8; `/sitemap.xml` verified serving all 6 public routes (branch) | `nuxt.config.ts` |
| serious | **OG images 404 sitewide** — every page sets `ogImage: '/path/to/…jpg'` placeholders that don't exist; `apple-touch-icon.png` missing too. Social/link previews broken. | `index/about/services/contact/projects.vue` · `layouts/default.vue:34` |
| serious | **2.4 MB `mugshot.jpg`** rendered at ≤256px, `@nuxt/image` not installed, all images raw `<img>`. And **two full Three.js runtimes ship** (CDN r134 for Vanta + npm 0.180) with Vanta double-initialised. | `Bio.vue:7` · `layouts/default.vue:38,41-85` |
| serious | **Three.js WebGL leaks** — geometries/materials rebuilt each param change but never `.dispose()`d; `onUnmounted` disposes only the renderer, no `forceContextLoss()` → a leaked GL context per `/experiments` visit. | `LSS/Viewer.vue:175,206,354` |
| warning | **Accessibility gap** — no `prefers-reduced-motion` anywhere (heavy motion); modals lack `role=dialog`/focus-trap/Escape (Service modal); `TypeFilter` radios are `display:none` (keyboard-unreachable); collapsible is a clickable `<div>`; icon buttons without labels; form labels unassociated. `@nuxt/a11y` is a dev auditor only. | many (see audit) |
| warning | **Dead code + unused deps** — `MenuComponent`, `BlogPost`, `Background/Fireworks`, `FractalClock`, `Service/Steps/ProjectInfo`, `utils/experiments/curvemath.js`; deps `motion`, `howler`, `axios` unused. | — |
| warning | **service-request double-submits** — the modal POSTs *and* emits to a stub `handleSubmit` that alerts success even on failure; no input validation in the function. | `Service/Modal.vue:148,169` · `useServices.js:59` |
| note | **Atomic design is aspirational** — only `BaseCard` is used; `Base/Button/Section/Slider/Loader` are unused and off-theme (blue vs the yellow identity); `CategoryCard` violates the slot rule in `Base/CONVENTIONS.md`; `Base/Card` `variant` has no validator. | `components/Base/*` |
| note | CSS duplication (`page-title`/`section-title`/`bg-grid-pattern` defined 2–3×), `!important` cursor hacks, robots vs page-meta contradiction on `/experiments`, README is a generic starter, stray `#` markdown lines atop 2 SFCs. | — |

## Guide

- **Routing:** `layouts/default.vue` (Vanta birds bg + header/footer) → pages `index`, `projects`, `services`, `about`, `blog` (stub), `contact` (stub), `experiments/*`.
- **Data:** `@nuxtjs/apollo` → **one** Hygraph query, `useProjects.js` `GetProjects` (title, descriptions, year, url, projectType, slug, coverImage, screenshots). **`services` and `skills` are hardcoded arrays**, not CMS. Projects open in a **modal** (no `/projects/[slug]` route).
- **Contact form:** `Service/Modal.vue` → `POST /.netlify/functions/service-request` → creates a **ClickUp** task (maps serviceType→tags, timeline→priority).
- **Experiments:** `pages/experiments/led-sculpture-generator` → `LSS/Viewer.vue` (Three.js/WebGL) driven by `useLEDSculpture.js` (seeded, debounced) + `useExporter.js` (PNG/JSON). See `EXPERIMENTS.md`.
- **Components:** feature-foldered (`About/`, `Project/`, `Service/`, `Landing/`, `LSS/`, `Experiments/`) over a `Base/` set governed by `Base/CONVENTIONS.md` (props-over-slots, wrapper composition) — good intent, partially applied.

## Hard parts

### A CMS token in `httpLinkOptions` ships to the browser
🔭 `@nuxtjs/apollo` serialises each client's config — endpoint **and headers** — into the app so the client can run in the browser. Putting `Authorization: Bearer <jwt>` on the `default` client (`nuxt.config.ts:52`) therefore hands that token to every visitor (devtools → Network). There's no `runtimeConfig`, no server-only split, no proxy.
⚖️ Only a **read-only, published-content-scoped** key belongs on a public client — and even then a Nitro `server/api` proxy that reads a **private** `runtimeConfig` key is safer (the browser never sees it). This is also the natural shape for the VAMS migration.
🗣️ *"Apollo client headers are public; a CMS write/management token there is a full compromise — move it behind a server route with a private runtime key."*

### GraphQL (Hygraph) → REST (VAMS) shape mismatch
🔭 Hygraph returns each field first-class (`year`, `coverImage.url`); VAMS returns a **flat entry** with only `id/title/status/order/timestamps` promoted and **everything else inside a JSON `content` blob** — so it's `entry.content.year`, `entry.content.coverImage`, etc., and `image_collection` values aren't GraphQL asset objects. Verified live: the `projects` type + Hiren's 2 entries exist. Full mapping in [`docs/vams-migration-ticket.md`](docs/vams-migration-ticket.md).
🗣️ *"VAMS packs domain fields into a `content` JSON column, so the migration is a field-remap in one composable, not a rewrite."*

### `motion-v` renamed the exit wrapper
🔭 `motion-v` 1.10.3 exports **`AnimatePresence`**, not `Presence`; the old import silently broke `build` (Rollup: "Presence is not exported"). A moving API surface on a young lib — pin versions and read the changelog on minor bumps.

## Roadmap — near future

- [x] Fix the build: `motion-v` `Presence`→`AnimatePresence` <!-- id:n1 -->
- [x] Working sitemap via `@nuxtjs/sitemap` (Nuxt 4), drop dead `nuxt-simple-sitemap` <!-- id:n2 -->
- [ ] **Rotate + env-ize both secrets** (Hiren): Hygraph JWT → private `runtimeConfig`/server proxy + a read-only content key; ClickUp token → Netlify env; lock the function's CORS + add basic abuse protection <!-- id:n3 -->
- [ ] Fix the sitewide broken **OG images** + `apple-touch-icon.png`; a real 1200×630 default in the layout, absolute URLs; standardise on `useSeoMeta`; add canonical + JSON-LD <!-- id:n4 -->
- [ ] **Perf:** install `@nuxt/image`, `<NuxtImg>` everywhere, compress `mugshot.jpg` (2.4 MB → ~40 KB); drop the CDN Three.js + double Vanta init (one npm `three`) <!-- id:n5 -->
- [ ] **a11y pass:** `prefers-reduced-motion` gate; modal `role=dialog`/focus-trap/Escape; `TypeFilter` `sr-only` not `hidden`; collapsible as a real button; icon-button labels; associate form labels <!-- id:n6 -->
- [ ] Remove dead code + unused deps (`motion`, `howler`, `axios`; `MenuComponent`, `BlogPost`, `Fireworks`, `FractalClock`, `ProjectInfo`, `curvemath.js`) <!-- id:n7 -->

### ADE Radar experiment (plan: [`docs/experiments/ade-radar-plan.md`](docs/experiments/ade-radar-plan.md))
- [ ] Refine the plan: public vs personal, design direction, VAMS yes/no <!-- id:a0 -->
- [ ] Scaffold: `pages/experiments/ade-radar/`, atomic components, `server/api/ade-radar/`, GSAP, Vitest <!-- id:a1 -->
- [ ] ADE data layer: sync the hidden `/api/program/filter` JSON (artists + events), cache, snapshot fallback, parser tests <!-- id:a2 -->
- [ ] MVP: paste a list of artist names, matcher, day-by-day results <!-- id:a3 -->
- [ ] Public playlist link input: Spotify embed page, Apple Music page (spike first, grey-area scraping) <!-- id:a4 -->
- [ ] Discovery: Last.fm similar artists, co-billed artists, genres, clash warnings, `.ics` export <!-- id:a5 -->
- [ ] Optional logins: Spotify (5-user dev limit), Apple Music ($99/yr developer account) <!-- id:a6 -->

## Roadmap — far future

- [ ] **Hygraph → VAMS migration** (VAMS side verified ready): swap the one `useProjects` composable + config to VAMS REST (`/entries/by-type/projects`, `X-API-Key`); retires the Hygraph JWT. Ticket: [`docs/vams-migration-ticket.md`](docs/vams-migration-ticket.md) <!-- id:f1 -->
- [ ] Fix `LSS/Viewer.vue` WebGL disposal (dispose geometry/material on rebuild; full teardown + `forceContextLoss()` on unmount) <!-- id:f2 -->
- [ ] Fix service-request double-submit (let the modal own submission, delete the stub) + add input validation to the function <!-- id:f3 -->
- [ ] Atomic-design cleanup: either delete the unused `Base` set or re-theme it (yellow) and route sliders/buttons through it; add the missing `variant` validator; fix the `CategoryCard` slot violation <!-- id:f4 -->
- [ ] Real content for `blog` + `contact` stubs (or noindex them); CSS de-dup; README rewrite (it's a generic starter) <!-- id:f5 -->
- [ ] Major upgrades, each behind build check (robots 6 done): Tailwind 4, `nuxt-site-config` 4, `graphql` 17, ESLint 10; `three` stuck at 0.134 because of `vanta`. Also resolve the mixed package manager (commit to npm, drop the misleading `packageManager: yarn`) <!-- id:f6 -->
- [ ] Link a ClickUp list + sync this roadmap <!-- id:f7 -->

---

## Diary

### 2026-09-27 — package update + ADE Radar experiment planned
- Branch `experiment/ade-radar` from `origin/main`. `npm update`: Nuxt 4.3.1 to 4.5.2, vue 3.5.43, axios 1.20, autoprefixer 10.6.1 and other patch/minor bumps. `npm run build` green, dev server serves `/`, `/experiments`, `/about`, `/projects` with no console errors.
- Tried `three` 0.186: npm ERESOLVE because `vanta` needs 0.134. Left `three` alone. Majors (Tailwind 4, robots 6, site-config 4, graphql 17, ESLint 10) not done, listed in far future.
- Researched and planned ADE Radar: ADE has an undocumented JSON API (3,355 artists, ~1,100 events). Spotify API (Feb 2026) blocks reading tracks of playlists you don't own, so public links need the embed page. Plan in `docs/experiments/ade-radar-plan.md`. PROJECT.md copied over from `fix/build-sitemap`.
- Merged to `main` (fast-forward). Fixed `/services` 500: `useModalA11y.js` immediate watcher used `document` during SSR. Upgraded `@nuxtjs/robots` 5 to 6, build + all 7 routes 200.
- Branch triage: old local `main` commit `a691e6e` superseded by the atomic rework, dropped locally (still on `fix/build-sitemap`). `fix/build-sitemap` built on old structure: salvage `@nuxtjs/sitemap` + `docs/vams-migration-ticket.md`, then delete. `rework/atomic-design-system` has 1 unmerged commit `e235622` (2026-09-09, 46 files) that merges cleanly.
- Landed `e235622` on `main` as cherry-pick `9016ce6` (atomic design round 3: `app/data/services.js`, `ModalShell`/`FormField`/`IconButton`/`StatusAlert`/`ContactForm`, semantic Tailwind tokens, stacked-modal a11y). Verified: build, 7 routes 200, service modal open/inert/Escape. Fixed pre-existing `BIRDS is not a function` (Vanta UMD export sits on `window.VANTA`). Deleted `rework/atomic-design-system`. Note: `EXPERIMENTS.md` still describes a `/experiments/led-sculpture-generator` route that doesn't exist; the experiment is embedded on `/experiments`.
- Check: in dev, `/experiments` renders `robots: index, follow` despite the `routeRules` `robots: false`; verify on a production build.

### 2026-09-09 — first map + build/sitemap fix + VAMS verification
- **Renew:** two fan-out audits (frontend; integrations/security). Found the build broken at HEAD, two committed secrets, and a real SEO/perf/a11y backlog.
- **Green-lit fixes (branch `fix/build-sitemap`, pushed to GitHub, PR open):** (1) `motion-v` `Presence`→`AnimatePresence` — build now green; (2) working sitemap via `@nuxtjs/sitemap` v8, verified `/sitemap.xml` serves all 6 public routes. Preserved the pre-existing staged WIP (`nuxt-mcp` + About refactor) as its own commit. **Did NOT touch the hardcoded keys** — Hiren rotates those himself.
- **VAMS verified (live prod DB, read-only):** `info@hiren.ninja` exists with a 64-char `api_key`; the `projects` entry-type exists (slug is **`projects`**, plural) with a matching `field_config`; 2 published project entries already present. Migration surface is tiny — only `projects` is CMS-backed (services/skills are hardcoded). Wrote [`docs/vams-migration-ticket.md`](docs/vams-migration-ticket.md).
- Left for Hiren: rotate the two secrets; then the SEO/perf/a11y backlog and the VAMS swap. `main` still red at HEAD until the branch merges.
