<template>
  <div class="max-w-4xl text-center px-4 my-32">
    <p class="text-sm uppercase tracking-[0.3em] text-content-muted mb-6">
      AI &amp; Automation Systems Engineer
    </p>
    <h1 class="text-2xl md:text-4xl lg:text-5xl text-content leading-relaxed font-semibold pt-12 md:pt-16">
      I build
      <span :class="['accent-phrase', { 'scale-110': activeIndex === 0 }]">high-performance backend systems</span>,
      <span :class="['accent-phrase', { 'scale-110': activeIndex === 1 }]">custom AI integrations</span>,
      and
      <span :class="['accent-phrase', { 'scale-110': activeIndex === 2 }]">automated business workflows</span>.
    </h1>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const activeIndex = ref(0)
const totalElements = 3
let intervalId

onMounted(() => {
  intervalId = setInterval(() => {
    activeIndex.value = (activeIndex.value + 1) % totalElements
  }, 1800)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>
.accent-phrase {
  display: inline-block;
  font-weight: 700;
  background-image: linear-gradient(to right, #fde047, #f59e0b);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  transition: transform 0.5s ease;
  transform-origin: center;
}
</style>
