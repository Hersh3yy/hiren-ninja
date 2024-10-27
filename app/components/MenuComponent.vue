<template>
  <div>
    <!-- Homepage centered menu -->
    <div
      v-if="isHomePage"
      class="flex flex-col items-center justify-center w-80 sm:w-96"
    >
      <div
        class="w-full rounded-xl shadow-2xl overflow-hidden bg-gradient-to-b from-white via-gray-500 to-black"
      >
        <div class="py-6">
          <NuxtLink
            v-for="(link, index) in links"
            :key="link.to"
            :to="link.to"
            class="block px-8 py-5 text-2xl sm:text-3xl text-center transition-colors duration-200"
            :class="[
              'hover:bg-white/10',
              index === 0
                ? 'text-black'
                : index === links.length - 1
                ? 'text-white'
                : 'text-gray-100',
            ]"
          >
            {{ link.text }}
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Hamburger menu for other pages -->
    <div v-else class="relative">
      <button
        @click="toggleMenu"
        class="bg-transparent p-2 rounded-full hover:bg-gray-700/50 transition-colors duration-300 focus:outline-none"
      >
        <svg
          class="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          ></path>
        </svg>
      </button>

      <!-- Dropdown menu -->
      <div
        v-if="isMenuOpen"
        class="absolute top-full right-0 mt-2 w-48 rounded-lg shadow-lg overflow-hidden bg-gradient-to-b from-white via-gray-500 to-black"
      >
        <NuxtLink
          v-for="(link, index) in links"
          :key="link.to"
          :to="link.to"
          @click="closeMenu"
          class="block px-4 py-2 transition-colors duration-200 text-lg"
          :class="[
            'hover:bg-white/10',
            index === 0
              ? 'text-black'
              : index === links.length - 1
              ? 'text-white'
              : 'text-gray-100',
          ]"
        >
          {{ link.text }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const isMenuOpen = ref(false);
const isHomePage = computed(() => route.path === "/");

const links = [
  { to: "/about", text: "About" },
  { to: "/projects", text: "Projects" },
  { to: "/blog", text: "Blog" },
  { to: "/contact", text: "Contact" },
];

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  if (!isHomePage.value) {
    isMenuOpen.value = false;
  }
};

// Close menu when route changes
watch(
  () => route.path,
  () => {
    if (!isHomePage.value) {
      isMenuOpen.value = false;
    }
  }
);
</script>
