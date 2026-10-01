<template>
  <div ref="el" class="transition-opacity duration-700" :class="calm ? 'opacity-60' : 'opacity-100'" />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  // Matches the accent token (ADE yellow #ffff07).
  color1: { type: Number, default: 0xffff07 },
  color2: { type: Number, default: 0x333333 },
  backgroundColor: { type: Number, default: 0x000000 },
  backgroundAlpha: { type: Number, default: 0 },
  birdSize: { type: Number, default: 0.7 },
  wingSpan: { type: Number, default: 40 },
  quantity: { type: Number, default: 5 },
  speedLimit: { type: Number, default: 4 },
  // Pages you read or work on (not the hero): smaller, fewer, slower birds that don't
  // chase the cursor. Bird size is baked into the geometry, so a change rebuilds the effect.
  calm: { type: Boolean, default: false }
})

const CALM = { birdSize: 0.35, quantity: 4, speedLimit: 2.5, mouseControls: false, touchControls: false }

const el = ref(null)
let effect = null
let BIRDS = null
let THREE = null

async function load() {
  THREE = await import('three')
  window.THREE = THREE
  const mod = await import('vanta/dist/vanta.birds.min')
  BIRDS = [mod.default, mod, window.VANTA?.BIRDS].find((c) => typeof c === 'function') ?? null
}

function start() {
  effect?.destroy()
  effect = null
  if (!BIRDS || !el.value) return

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
    speedLimit: props.speedLimit,
    ...(props.calm ? CALM : {})
  })
}

onMounted(async () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  await load()
  start()
})

watch(() => props.calm, () => start())

onBeforeUnmount(() => {
  effect?.destroy()
  effect = null
})
</script>
