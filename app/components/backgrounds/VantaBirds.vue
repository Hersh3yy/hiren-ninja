<template>
  <div ref="el" />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  color1: { type: Number, default: 0xfde047 }, // accent yellow
  color2: { type: Number, default: 0x070707 },
  backgroundColor: { type: Number, default: 0x000000 },
  birdSize: { type: Number, default: 0.7 },
  wingSpan: { type: Number, default: 40 },
  quantity: { type: Number, default: 3 }
})

const el = ref(null)
let effect = null

onMounted(async () => {
  // Dynamic imports keep three.js + vanta out of the SSR bundle and the
  // critical render path. Vanta manages its own resize listener and tears it
  // down on destroy(), so no manual cleanup beyond destroy() is required.
  const [THREE, { default: BIRDS }] = await Promise.all([
    import('three'),
    import('vanta/dist/vanta.birds.min')
  ])

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
    birdSize: props.birdSize,
    wingSpan: props.wingSpan,
    quantity: props.quantity
  })
})

onBeforeUnmount(() => {
  effect?.destroy()
  effect = null
})
</script>
