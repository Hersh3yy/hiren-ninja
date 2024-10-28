<template>
  <div class="bg-black min-h-screen flex flex-col relative">
    <FractalClockBackground />
    <Header />

    <main
      class="flex-grow flex justify-center items-start z-10 mt-16 w-full max-w-full"
    >
      <NuxtPage />
    </main>

    <div class="fixed bottom-4 left-4 z-10">
      <MusicControls />
    </div>

    <Footer class="mt-auto" />
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
const route = useRoute();
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Sixtyfour+Convergence:SCAN,XELA,YELA@-16,60,-94&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600&display=swap");
</style>
