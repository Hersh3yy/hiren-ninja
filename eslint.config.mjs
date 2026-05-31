// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

// Non-intrusive project ruleset. The goal is to nudge towards atomic-design,
// TypeScript and Nuxt 4 best practices without drowning the editor in red.
// Hard correctness issues are errors; conventions are warnings.
export default withNuxt({
  rules: {
    // --- Atomic design friendliness ---
    // Atoms like Button/Tag/Icon are intentionally single-word.
    'vue/multi-word-component-names': 'off',
    // Components should be referenced in PascalCase (AtomsButton, OrganismsSiteHeader).
    'vue/component-name-in-template-casing': ['warn', 'PascalCase', {
      registeredComponentsOnly: false
    }],

    // --- Silence purely-stylistic formatting noise (kept non-intrusive) ---
    'vue/html-self-closing': 'off',
    'vue/first-attribute-linebreak': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/attributes-order': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/require-default-prop': 'off',

    // --- Hygiene (matches the conventions in app/components/README.md) ---
    // We removed all third-party embeds; flag any reintroduction.
    'vue/no-v-html': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'warn',

    // --- TypeScript: encourage, don't enforce ---
    // The codebase is migrating towards TS; keep these as gentle warnings so
    // JS files still lint cleanly today.
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }]
  }
}, {
  // The LED Sculpture experiment binds directly to a shared reactive parameters
  // object (intentional two-way binding in a self-contained prototype). Keep the
  // rule strong everywhere else, but don't block on this experiment-domain pattern.
  files: ['app/components/LSS/**/*.vue'],
  rules: {
    'vue/no-mutating-props': 'warn'
  }
})
