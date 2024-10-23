<template>
  <div class="bg-black min-h-screen flex flex-col relative overflow-x-hidden">
    <FractalClockBackground />
    <header
      class="fixed top-0 left-0 right-0 flex justify-between items-center p-4 z-20 bg-opacity-80 backdrop-blur-md"
    >
      <h1
        class="text-4xl font-bold text-yellow-300 sixtyfour-convergence-title"
      >
        HIREN DEVS
      </h1>
      <MenuComponent v-if="$route.path !== '/'" :defaultOpen="false" />
    </header>
    <main
      class="flex-grow flex justify-center items-start z-10 mt-16 w-full max-w-full overflow-x-hidden"
    >
      <NuxtPage />
    </main>
    <div class="fixed bottom-4 left-4 z-10">
      <MusicControls />
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";

const route = useRoute();
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

body {
  overflow-x: hidden;
}
</style>
