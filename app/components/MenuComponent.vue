<!-- components/Menu.vue -->
<template>
  <div class="bg-gradient-to-b from-yellow-900 to-black p-4 h-64 flex flex-col">
    <div class="relative">
      <button
        @click="toggleMenu"
        class="bg-green-500 p-2 w-full flex items-center justify-between"
      >
        Menu
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>
      <div
        v-if="isMenuOpen"
        class="absolute top-full left-0 right-0 bg-white text-black"
      >
        <NuxtLink to="/about" class="block p-2 hover:bg-gray-100"
          >About</NuxtLink
        >
        <NuxtLink to="/projects" class="block p-2 hover:bg-gray-100"
          >Projects</NuxtLink
        >
        <NuxtLink to="/blog" class="block p-2 hover:bg-gray-100">Blog</NuxtLink>
        <NuxtLink to="/contact" class="block p-2 hover:bg-gray-100"
          >Contact</NuxtLink
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};
</script>
