<template>
  <div class="relative w-full h-screen overflow-hidden">
    <FractalClockBackground ref="fractalClock" />
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <h1
        class="text-6xl font-bold mb-8 text-yellow-300 z-10 sixtyfour-convergence-title"
      >
        HIREN DEVS
      </h1>
      <Menu class="w-64 z-10" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import FractalClockBackground from "~/components/FractalClockBackground.vue";

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
