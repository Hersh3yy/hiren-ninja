<template>
  <footer class="w-full py-8 backdrop-blur-xl" aria-label="Site footer">
    <div class="container mx-auto px-4">
      <div class="text-center">
        <p class="text-xl sm:text-2xl font-semibold text-accent mb-4">
          Get in touch
        </p>
        <div class="flex flex-col items-center justify-center space-y-4">
          <MoleculesSocialLink
            href="mailto:hello@hiren.ninja"
            label="hello@hiren.ninja"
            :icon-path="ICONS.mail"
          />
          <MoleculesNavLink to="/about" text="About" />
          <MoleculesNavLink to="/contact" text="Contact" />
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ICONS } from '~/utils/icons'
</script>
