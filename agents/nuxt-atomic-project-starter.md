# Nuxt 4 Atomic Project Starter

Portable conventions for a **Nuxt 4 marketing / portfolio site** connected to a CMS.
Content- and industry-agnostic — copy this into a new repo (e.g. DJ site) and adapt
tokens + copy, not architecture.

---

## Quick start (new project)

1. **Scaffold:** `npx nuxi@latest init my-site` → Nuxt 4, Vue 3, `<script setup>`.
2. **Copy conventions into the new repo:**
   - `agents/templates/cursor-rule-nuxt-atomic.mdc` → `.cursor/rules/nuxt-atomic-project.mdc`
   - This file → `agents/PROJECT-CONVENTIONS.md` (optional but recommended)
   - `agents/templates/components-README.md` → `app/components/README.md`
3. **Install baseline:** Tailwind v3, `@nuxt/eslint`, CMS client (Apollo/Lighthouse/your pick).
4. **Define design tokens** in `tailwind.config.js` before building UI (see below).
5. **Wire CMS secrets** via `.env` + `.env.example` — never commit tokens.

---

## Mindset

- **Audience first:** copy should speak to humans, not engineers. Jargon belongs in code, not hero text.
- **Props over slots:** atoms are props-only; molecules/organisms may use a slot only for layout shells.
- **Isolate heavy stuff:** animations, 3D, third-party scripts live in dedicated `backgrounds/` or feature folders — never in `layouts/default.vue`.
- **CMS is content, not architecture:** pages consume data; components stay dumb and reusable.
- **Accessibility by default:** skip link, landmarks, focus rings, meaningful labels, decorative images `aria-hidden`.
- **No Geocities energy:** no raw `v-html` embeds, no CDN script tag soup, no GIF text masks in production UI.

---

## Stack defaults

| Layer        | Choice                                      |
| ------------ | --------------------------------------------- |
| Framework    | Nuxt 4 (`future.compatibilityVersion: 4`)      |
| UI           | Vue 3, `<script setup>`                       |
| Styling      | Tailwind CSS v3 + semantic tokens             |
| Lint         | `@nuxt/eslint`, stylistic rules minimal       |
| CMS          | Headless (Hygraph, Sanity, Strapi, etc.)      |
| Secrets      | `.env` (gitignored) + `runtimeConfig` / `process.env` in `nuxt.config` |
| Deploy       | Static/SSR as needed; Netlify/Vercel/etc.     |

---

## Folder structure

```
app/
  assets/css/main.css       # @layer components + token-driven utilities
  components/
    atoms/                  # props-only, no slots
    molecules/              # small compositions
    organisms/              # page sections
    backgrounds/            # client-only effects (Vanta, canvas, video)
  composables/              # shared logic (useXxx)
  layouts/default.vue       # shell only: header, main, footer, background tag
  pages/                    # thin — compose organisms, fetch CMS data here or in organisms
agents/
  PROJECT-CONVENTIONS.md    # this file
  frontend-reviewer.md       # optional local LLM review prompt
.cursor/rules/
  nuxt-atomic-project.mdc   # Cursor agent rules (from templates/)
```

Feature-specific domains (experiments, admin tools) get their own folder under
`components/` — not mixed into atoms/molecules.

---

## Atomic design rules

### Atoms (`app/components/atoms/`)

- Single responsibility: Button, Heading, Icon, Loader, Input, Slider.
- **No `<slot>`**. Pass content via props (`text`, `label`, `path`).
- No business logic, no CMS calls, no routing.

### Molecules (`app/components/molecules/`)

- Compose atoms: Card, NavLink, SkillCard, ProjectCard.
- Props-driven. One default `<slot>` allowed only for true wrappers (e.g. `Card`).

### Organisms (`app/components/organisms/`)

- Page sections: SiteHeader, SiteFooter, LandingHero, SkillsGrid, ProjectsGrid.
- May fetch CMS data or receive it via props from pages — pick one pattern per project and stick to it.
- Slots OK for layout shells (modals, page shells).

### Backgrounds (`app/components/backgrounds/`)

- Self-contained: init in `onMounted`, destroy in `onBeforeUnmount`.
- Dynamic `import()` for heavy libs (three, vanta) — keep out of SSR bundle.
- Global script dependencies (e.g. `window.THREE` for Vanta) stay inside this component.

### Nuxt auto-import names

Keep path prefixes: `atoms/Button.vue` → `<AtomsButton>`, `organisms/SiteHeader.vue` → `<OrganismsSiteHeader>`.

---

## Design tokens (Tailwind v3)

Define semantic colours in `tailwind.config.js` — **never** sprinkle `bg-gray-700` / `bg-blue-600` in components.

Example palette (adapt accent hue per brand — yellow for hiren.ninja, maybe magenta/cyan for DJ site):

```js
// tailwind.config.js — theme.extend.colors
ink: '#09090b',           // page bg (NOT "base" — clashes with text-base)
surface: '#18181b',       // cards
elevated: '#27272a',      // inputs, raised
'border-subtle': '#27272a',
'border-default': '#3f3f46',
accent: { DEFAULT: '#fde047', hover: '#facc15', muted: 'rgb(253 224 71 / 0.4)' },
content: { DEFAULT: '#f4f4f5', muted: '#a1a1aa' },
```

Reusable utilities in `app/assets/css/main.css`:

```css
@layer components {
  .page-title { @apply text-3xl sm:text-4xl font-bold text-accent mb-8; }
  .card { @apply bg-surface/80 backdrop-blur-xl rounded-xl p-6 border border-border-subtle; }
  .btn-primary { @apply px-4 py-2 rounded-lg bg-accent text-ink hover:bg-accent-hover font-bold; }
}
```

Dark zinc + one accent colour. High contrast. Subtle borders, not thick `border-4`.

---

## Layout contract

`layouts/default.vue` should only:

- Render background component(s)
- Site header / footer organisms
- `<NuxtPage />` inside `<main id="main-content">`
- Global SEO via `useHead` (no animation scripts)

```vue
<template>
  <div class="bg-ink min-h-screen flex flex-col relative">
    <BackgroundsVantaBirds class="fixed inset-0 z-0" aria-hidden="true" />
    <OrganismsSiteHeader class="z-20" />
    <main id="main-content" class="flex-grow z-10 mt-16 w-full">
      <NuxtPage />
    </main>
    <OrganismsSiteFooter class="mt-auto z-10" />
  </div>
</template>
```

**Avoid** `min-h-screen` on individual pages unless you truly need full viewport content — it forces scroll past the footer on short pages.

---

## CMS integration

- **Secrets:** `CMS_TOKEN`, `CMS_ENDPOINT` in `.env`; document in `.env.example`.
- **Queries:** colocate GraphQL/gql in organisms or `composables/useProjects.ts`, not in atoms.
- **Content shape:** CMS fields map to props — organisms don't parse HTML unless sanitized and intentional.
- **Swap-friendly:** keep CMS module config in `nuxt.config.ts` only; components consume composables.

When swapping CMS next round, you should only touch config + composables + query strings.

---

## Copy & UX voice

- Hero: one idea, one accent phrase — not a skill checklist.
- Skills/services: benefit language for non-technical clients; details live in conversation, not subtext.
- Design + UX + customer-facing work are part of the story, not only "AI/backend."
- SEO meta per page via `useSeoMeta`.

---

## ESLint (non-intrusive)

- `@nuxt/eslint` with `stylistic: false` in nuxt.config.
- Warn on: `vue/no-v-html`, `no-console`, PascalCase components in templates.
- Auto-fix once: `vue/attributes-order`, `vue/html-self-closing`.
- Leave noisy line-wrapping rules off until the codebase is stable.

Scripts: `"lint": "eslint ."`, `"lint:fix": "eslint . --fix"`.

---

## Checklist before first deploy

- [ ] No hardcoded CMS tokens in repo
- [ ] All pages render without console errors
- [ ] Theme audit: no raw `bg-gray-*` / `bg-blue-*` in `app/components` and `app/pages`
- [ ] Atoms contain no `<slot>`
- [ ] Background effects destroy cleanly on route change
- [ ] Skip link + main landmark present
- [ ] `npm run build` and `npm run lint` pass

---

## Adapting for your DJ site

Change only:

- **Accent tokens** (e.g. neon, club colours)
- **Fonts** (display + body in layout / tailwind config)
- **Copy & CMS content types** (gigs, mixes, releases)
- **Background** (keep isolated component — swap Vanta for video/canvas/shader)

Do **not** change: atomic folders, props-over-slots, layout shell pattern, env-based secrets, eslint setup.
