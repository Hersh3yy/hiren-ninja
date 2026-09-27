# Ticket — Migrate hiren-ninja content from Hygraph → VAMS

**Status:** ready (VAMS side verified) · **Repos:** `hiren-ninja` (this) + `VAMS` (source)

## Why
Content should come from **VAMS** (the in-house Laravel CMS) instead of **Hygraph**. Bonus: it retires the leaked Hygraph JWT (`nuxt.config.ts:52`) that currently ships to the browser.

## Surface is tiny — only ONE model is CMS-backed today
Audit finding: despite the "projects/services/skills" framing, **only `projects` comes from Hygraph**. `services` are a hardcoded array in `app/composables/useServices.js`, `skills` a hardcoded array in `app/components/About/Skills.vue`. So the entire migration footprint is:

| File:line | Hygraph today | Change |
|---|---|---|
| `nuxt.config.ts:29-30` | `@nuxtjs/apollo` module | remove module + drop `@nuxtjs/apollo`, `graphql` deps |
| `nuxt.config.ts:46-56` | `apollo.clients.default` + JWT | delete; add `runtimeConfig` (`apiUrl`, private `apiKey`) |
| `app/composables/useProjects.js:10-34` | inline `gql GetProjects` | rewrite as REST + field remap |
| `app/composables/useProjects.js:36` | `useAsyncQuery(query)` | `useAsyncData` + a `useApi().fetchApi` call |

`pages/projects.vue` and `Project/*` don't change if `useProjects()` keeps its return shape.

## VAMS side — VERIFIED (2026-09-09, live prod DB)
- User `info@hiren.ninja` exists (id `9f185773-…`), **has an `api_key`** (64 chars, on `users.api_key`).
- Entry-type **slug = `projects`** (name "Project") exists. `field_config` (10 fields): `shortDescription` (textarea, req), `fullDescription` (textarea, req), `year` (text), `url` (text), `projectType` (text), `slug` (text, req), `coverImage` (image_collection), `screenshots` (image_collection), `externalId` (text), `videoLink` (text).
- **2 published project entries already exist** under Hiren ("Doctor Mesi", "Itamar Gilboa's website bob") with exactly those `content` keys.

## The GraphQL → REST shape mismatch
- **Endpoint:** `GET https://app.use-vams.me/api/entries/by-type/projects` (no `/v1`; set as `VAMS_API_URL`), header **`X-API-Key`** (Hiren's key), throttled 60/min.
- **Envelope:** `{ entries: [...], entry_type: {...} }`. Each entry is flat — `{ id, title, content, status, published_at, order, created_at, updated_at }` — with **all domain fields inside `content` (a JSON blob)**.
- **Field mapping** (Hygraph → VAMS): `title` → `entry.title` (native); `stage` → `entry.status`; `publishedAt/updatedAt/createdAt` → `published_at/updated_at/created_at`; everything else → `entry.content.*` (`shortDescription`, `fullDescription`, `year`, `url`, `projectType`, `slug`, `coverImage`, `screenshots`). Note `coverImage`/`screenshots` are `image_collection` in VAMS, not GraphQL asset objects — read the URL(s) out of the content value (confirm the exact JSON shape of an `image_collection` value against a live entry before wiring).
- `year` must stay numeric for the year filter (`useProjects.js:49` `Number(filter) === project.year`).

## Concrete steps in hiren-ninja
1. Remove `@nuxtjs/apollo` from `modules` + delete the `apollo` block in `nuxt.config.ts`; uninstall `@nuxtjs/apollo` + `graphql`.
2. Add `runtimeConfig` with `apiUrl` (public ok) + a **private** `apiKey` (server-only). Prefer a Nitro proxy route (`server/api/projects.get.ts`) so the key never reaches the client — mirrors the recommended Hygraph-token fix.
3. Port `shawneyyy.portfolio/app/composables/useApi.ts` (already does `X-API-Key`, status→message, envelope unwrap).
4. Rewrite `useProjects.js`: `useAsyncData('projects', () => useApi().fetchApi('/entries/by-type/projects'))` + a `transformEntryToProject(entry)` mapper (pattern: `shawneyyy useCases.ts:transformCmsEntryToCase`). Keep the public return shape (`projects`, `years`, `filteredProjects`, modal fns) identical → zero change in `pages/projects.vue` / `Project/*`.
5. Migrate the 2 existing test entries' data or re-enter the real projects; delete the Hygraph project data once parity is confirmed.

## Acceptance
- `/projects` renders from VAMS with no Apollo/Hygraph dependency; the JWT is gone from the repo.
- Year + type filters still work; images render from the `image_collection` URLs.
- The VAMS API key is not exposed in the client bundle (private runtimeConfig / server proxy).

_services + skills stay hardcoded (out of scope). If they should be CMS-driven later, add `service`/`skill` entry-types in VAMS — net-new, not a migration._
