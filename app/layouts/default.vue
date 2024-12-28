<template>
  <div class="bg-black min-h-screen flex flex-col relative font-space-grotesk">
    <!-- Grid background with low z-index -->
    <div
      class="fixed inset-0 bg-grid-pattern opacity-50"
      style="z-index: 1"
    ></div>
    <!-- Choose which background to show -->
    <!-- <BackgroundFlames /> -->
    <!-- or -->
    <!-- <BackgroundFireworks /> -->
    <!-- Fractal background -->
    <BackgroundFractalClock />
    <!-- Fireworks background -->
    <!-- <BackgroundFlames /> -->
    <!-- Rest of the content with higher z-index -->
    <Header class="z-20" />
    <main
      class="flex-grow flex justify-center items-start z-10 mt-16 w-full max-w-full font-space-grotesk"
    >
      <NuxtPage />
    </main>
    <Footer class="mt-auto z-10 font-space-grotesk" />
  </div>
</template>
<style>
@import url("https://fonts.googleapis.com/css2?family=Sixtyfour+Convergence:SCAN,XELA,YELA@-16,60,-94&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600&display=swap");

/* Add these global styles */
.page-title {
  @apply text-3xl sm:text-4xl font-bold text-yellow-300 mb-8;
}

.section-title {
  @apply text-2xl font-bold text-yellow-300 mb-4;
}

.bg-grid-pattern {
  background-image: linear-gradient(
      rgba(255, 255, 255, 0.35) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba(255, 255, 255, 0.3) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
}
</style>
