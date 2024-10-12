<template>
  <div class="bg-black min-h-screen flex flex-col relative">
    <FractalClockBackground ref="fractalClock" />
    <!-- <HeaderMenu v-if="!isIndexPage" class="z-10" /> -->
    <div class="max-w-screen-xl w-full mx-auto my-8 flex-grow z-10">
      <NuxtPage />
    </div>
    <div class="fixed bottom-4 left-4 z-10">
      <MusicControls />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const isIndexPage = computed(() => route.path === "/");
const fractalClock = ref(null);

onMounted(() => {
  if (fractalClock.value) {
    let direction = 1;
    const animate = () => {
      if (fractalClock.value.fractalClock) {
        fractalClock.value.fractalClock.settings.scale += 0.01 * direction;
        if (
          fractalClock.value.fractalClock.settings.scale >= 1.5 ||
          fractalClock.value.fractalClock.settings.scale <= 0.5
        ) {
          direction *= -1;
        }
      }
      requestAnimationFrame(animate);
    };
    animate();
  }
});
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Sixtyfour+Convergence:SCAN,XELA,YELA@-16,60,-94&display=swap");

.sixtyfour-convergence-title {
  font-family: "Sixtyfour Convergence", sans-serif;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
  font-variation-settings: "BLED" 0, "SCAN" -16, "XELA" 60, "YELA" -94;
}
</style>
