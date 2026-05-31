<template>
  <footer class="w-full py-8 backdrop-blur-xl">
    <div class="container mx-auto px-4">
      <div class="text-center">
        <h2 class="text-xl sm:text-2xl font-semibold text-accent mb-4">
          Get in touch
        </h2>
        <div class="flex flex-col items-center justify-center space-y-4">
          <MoleculesSocialLink
            href="mailto:hello@hiren.ninja"
            label="hello@hiren.ninja"
            :icon-path="mailIconPath"
          />
          <NuxtLink to="/about" class="text-content hover:text-accent transition-colors duration-300">
            About
          </NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
const mailIconPath = 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
</script>
