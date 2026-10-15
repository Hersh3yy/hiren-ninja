<template>
  <NuxtLink
    :to="to"
    class="nav-link text-content hover:text-accent transition-colors duration-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-xs"
    :aria-current="isCurrent ? 'page' : undefined"
    :class="{ 'ade-glow': glow }"
  >
    {{ text }}
  </NuxtLink>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  to: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  // A pulsing accent glow to draw the eye (ADE week, see utils/adeSpotlight.js).
  glow: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()
const isCurrent = computed(() => route.path === props.to || route.path.startsWith(`${props.to}/`))
</script>

<style scoped>
.nav-link {
  position: relative;
  cursor: pointer;
}

.nav-link::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background-color: var(--color-accent);
  transition: width 0.2s ease;
  pointer-events: none;
}

.nav-link:hover::after,
.nav-link[aria-current="page"]::after {
  width: 100%;
}

@media (prefers-reduced-motion: reduce) {
  .nav-link::after {
    transition: none;
  }
}
</style>
