# Component Architecture (Atomic Design)

Copy this file to `app/components/README.md` in new projects.

## Taxonomy

```
atoms/         props-only, no slots
molecules/     compose atoms; slot only for layout shells
organisms/     page sections
backgrounds/   isolated client-only effects
```

## Slot rule

Atoms: props only. Molecules/organisms: prefer props; slots for layout shells only.

## Tokens

Use semantic colours from `tailwind.config.js` — never raw `bg-gray-*` / `bg-blue-*`.

## Naming

`atoms/Button.vue` → `<AtomsButton>`. Keep Nuxt path prefixes.
