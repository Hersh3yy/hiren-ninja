<!-- pages/index.vue -->
<template>
  <div
    class="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] gap-12"
  >
    <!-- Using the new AnimatedIntro component -->
    <LandingIntroText />

    <!-- Menu -->
    <MenuComponent :defaultOpen="true" />
  </div>
</template>