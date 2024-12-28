<template>
  <div class="max-w-4xl text-center px-4 font-space-grotesk">
    <h1 class="text-2xl md:text-4xl lg:text-5xl text-white leading-relaxed pt-10 min-h-[50vh]">
      I am
      <strong class="fire-text" :class="{ 'scale-up': activeIndex === 0 }">Hiren</strong>,
      a web developer who enjoys
      <span class="fire-text" :class="{ 'scale-up': activeIndex === 1 }">absorbing</span>
      ideas,
      <span class="fire-text" :class="{ 'scale-up': activeIndex === 2 }">visualizing</span>
      them, and
      <span class="fire-text" :class="{ 'scale-up': activeIndex === 3 }">planning</span>
      their completion
    </h1>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const activeIndex = ref(-1);
const totalElements = 5;
let intervalId;

const animate = () => {
  activeIndex.value = (activeIndex.value + 1) % totalElements;
};

onMounted(() => {
  animate();
  intervalId = setInterval(() => {
    animate();
  }, 1337);
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

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

.scale-up {
  transform: scale(1.2);
  text-shadow: 0 0 15px rgba(255, 165, 0, 0.5);
}

.fire-text:hover {
  transform: scale(1.5);
  text-shadow: 0 0 15px rgba(255, 165, 0, 0.5);
}

* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
