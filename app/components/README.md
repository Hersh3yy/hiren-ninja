# Component Architecture (Atomic Design)

This project uses [Brad Frost's Atomic Design](https://atomicdesign.bradfrost.com/chapter-2/)
with Nuxt 4 auto-imports. Components are organised by complexity, and the folder a
component lives in determines both its responsibilities and its auto-import name.

## Folder taxonomy

```
app/components/
  atoms/         Single-purpose, props-only. No slots. No business logic.
  molecules/     Small compositions of atoms. Props-driven. Slot allowed only for layout shells.
  organisms/     Page-section-sized units. May use slots when acting as a layout shell.
  backgrounds/   Self-contained animated background effects (isolated, client-only).
  LSS/           Feature module: the LED Sculpture experiment (3D, domain-specific).
  Experiments/   Feature module: experiment list UI.
```

`LSS/` and `Experiments/` are intentionally a separate feature domain (the interactive
experiments), not part of the marketing-site design system.

## Auto-import naming (Nuxt prefix convention)

Nuxt concatenates the path segments. We keep the prefix on purpose so the atomic
level is visible at every call site:

| File                                   | Component tag                |
| -------------------------------------- | ---------------------------- |
| `atoms/Button.vue`                     | `<AtomsButton />`            |
| `atoms/Heading.vue`                    | `<AtomsHeading />`           |
| `backgrounds/VantaBirds.vue`           | `<BackgroundsVantaBirds />`  |
| `molecules/SkillCard.vue`              | `<MoleculesSkillCard />`     |
| `organisms/SiteHeader.vue`             | `<OrganismsSiteHeader />`    |

## Shared UI pieces worth knowing

| Component                  | Use it for                                                        |
| -------------------------- | ----------------------------------------------------------------- |
| `AtomsChip`                | Every pill toggle: filters, genres, intents, "My plan". `pressed`, `count`, `removable`, `size` |
| `AtomsBadge`               | Short status labels (Sold out, Free, ADE Pro). `tone`             |
| `MoleculesSegmentedTabs`   | Tab bars and day pickers (`role="tablist"`, v-model)              |
| `MoleculesEventCard`       | Compact event row: time, title, one line, one badge, star. Details belong one level up |
| `MoleculesIconButton`      | Icon-only buttons; `pressed` turns accent, `filled` for a solid icon |

Text colour rule: body text `text-content`, secondary text `text-content-muted`, interactive or highlighted text `text-accent`.

## The slot rule (props over slots)

- **Atoms**: props only. No `<slot>`. Content comes in via props (e.g. `Heading` takes a `text` prop).
- **Molecules**: props-driven. A single default `<slot>` is allowed only for genuine layout
  shells (e.g. `Card.vue` wraps arbitrary content).
- **Organisms**: may use slots when the component is a layout shell.

If you reach for a slot in an atom, it belongs one level up.

## Design tokens

Colours are semantic tokens defined in `tailwind.config.js`. Use tokens, never raw
palette utilities like `bg-gray-700` or `bg-blue-600`.

| Token                | Value (zinc/yellow) | Usage                          |
| -------------------- | ------------------- | ------------------------------ |
| `ink`                | ADE black `#0d0d0d` | page background / dark text    |
| `surface`            | ADE grey `#1c1c1c`  | cards / panels                 |
| `elevated`           | zinc-800 `#27272a`  | raised elements / inputs       |
| `border-subtle`      | zinc-800            | default borders                |
| `border-default`     | zinc-700            | stronger borders / hover       |
| `accent`             | ADE yellow `#ffff07`| brand accent                   |
| `accent-hover`       | `#e6e600`           | accent hover                   |
| `accent-muted`       | ADE yellow @ 40%    | subtle accent borders          |
| `content`            | zinc-100            | primary text                   |
| `content-muted`      | zinc-400            | secondary text                 |
| `success`            | green-300           | success text                   |
| `success-muted`      | green-900 @ 50%     | success surfaces               |
| `danger`             | red-300             | error text                     |
| `danger-muted`       | red-900 @ 50%       | error surfaces                 |

> Note: the darkest surface token is named `ink` (not `base`) to avoid colliding with
> Tailwind's built-in `text-base` font-size utility.

## Shared data & utilities

| Path                         | Role                                      |
| ---------------------------- | ----------------------------------------- |
| `app/data/services.js`       | Single source for services / skills copy  |
| `app/utils/icons.js`         | Shared SVG paths for `AtomsIcon`          |
| `app/utils/escapeHtml.js`    | Escape CMS text before `v-html`           |

Prefer these over duplicating strings or path constants in components.

## File conventions

- Vue SFCs: `PascalCase.vue`. Folders: lowercase.
- `<script setup>` only.
- Typehint props with validators where it adds value.
- No dead code, no `v-html` of third-party embeds, no CDN `<script>` injection.
