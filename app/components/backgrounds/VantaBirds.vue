<template>
  <div ref="el" />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  // Original site used 0xfffe00 — brighter than design-token yellow-300 (0xfde047)
  color1: { type: Number, default: 0xfffe00 },
  color2: { type: Number, default: 0x333333 },
  backgroundColor: { type: Number, default: 0x000000 },
  backgroundAlpha: { type: Number, default: 0 },
  birdSize: { type: Number, default: 0.7 },
  wingSpan: { type: Number, default: 40 },
  quantity: { type: Number, default: 5 },
  speedLimit: { type: Number, default: 4 }
})

const el = ref(null)
let effect = null

onMounted(async () => {
  const THREE = await import('three')
  if (typeof window !== 'undefined') {
    window.THREE = THREE
  }

  const mod = await import('vanta/dist/vanta.birds.min')
  const BIRDS = mod.default || mod

  effect = BIRDS({
    el: el.value,
    THREE,
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200,
    minWidth: 200,
    scale: 1,
    scaleMobile: 1,
    color1: props.color1,
    color2: props.color2,
    backgroundColor: props.backgroundColor,
    backgroundAlpha: props.backgroundAlpha,
    birdSize: props.birdSize,
    wingSpan: props.wingSpan,
    quantity: props.quantity,
    speedLimit: props.speedLimit
  })
})

onBeforeUnmount(() => {
  effect?.destroy()
  effect = null
})
</script>
