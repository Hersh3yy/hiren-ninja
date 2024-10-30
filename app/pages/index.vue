<!-- pages/index.vue -->
<template>
  <div
    class="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] gap-12"
  >
    <!-- Introduction Text -->
    <div class="max-w-4xl text-center px-4 font-space-grotesk">
      <h1 class="text-2xl md:text-3xl lg:text-4xl text-white leading-relaxed pt-10">
        I am <em class="fire-text font-bold">Hiren</em>, a web developer who
        enjoys <em class="fire-text font-bold">absorbing</em> ideas,
        <em class="fire-text font-bold">visualizing</em> them, and
        <em class="fire-text font-bold">planning</em> their completion
      </h1>
    </div>

    <!-- Menu -->
    <MenuComponent :defaultOpen="true" />
  </div>
</template>

<style scoped>
.fire-text {
  background-image: url(https://media.tenor.com/wKseAxJMZAgAAAAM/jolteon-pokemon.gif);
  background-size: cover;
  color: transparent;
  -moz-background-clip: text;
  -webkit-background-clip: text;
  text-shadow: 0 0 10px rgba(255, 165, 0, 0.3);
  display: inline-block;
  padding: 0 0.2em;
  transition: all 0.3s ease;
}

/* Optional hover effect */
.fire-text:hover {
  transform: scale(1.05);
  text-shadow: 0 0 15px rgba(255, 165, 0, 0.5);
}

/* Ensure better text rendering */
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
