<template>
  <div class="max-w-3xl text-center px-4 my-32">
    <div v-if="spotlight" class="mb-10 flex flex-col items-center gap-3">
      <p class="text-xs uppercase tracking-[0.3em] text-accent">ADE · 21–25 October</p>
      <AtomsButton to="/ade-planner" text="Open the ADE Planner →" size="lg" variant="outline" class="ade-glow" data-umami-event="ade-hero-click" @click="track('ade-hero-click')" />
      <p class="text-sm text-content-muted">Paste a playlist, see who plays when and where. Free parties too.</p>
    </div>
    <p class="text-xs sm:text-sm uppercase tracking-[0.3em] text-content-muted mb-6">
      Software · AI &amp; Automation · For creative businesses
    </p>
    <h1 class="text-3xl md:text-4xl lg:text-5xl text-content leading-tight md:leading-10 lg:leading-none font-semibold pt-8">
      Technology for
      <span class="accent-phrase">creative businesses</span>.
    </h1>
    <p class="mt-6 text-base md:text-lg text-content-muted">
      Websites, software, automation and AI that help artists, designers, agencies and growing businesses work smarter and communicate their ideas better.
    </p>
  </div>
</template>

<script setup>
import { adeSpotlightOn } from '~/utils/adeSpotlight'
import { track } from '~/utils/track'

const spotlight = adeSpotlightOn()
</script>

<style scoped>
.accent-phrase {
  font-weight: 700;
  color: var(--color-accent);
  background-image: linear-gradient(
    to right,
    var(--color-accent),
    var(--color-accent-hover)
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

@supports not (background-clip: text) {
  .accent-phrase {
    color: var(--color-accent);
    background-image: none;
  }
}
</style>
