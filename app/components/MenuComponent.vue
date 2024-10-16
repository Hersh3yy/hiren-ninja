<template>
  <div :class="['relative', { 'w-64': isHomePage }]">
    <button
      v-if="!isHomePage || !isMenuOpen"
      @click="toggleMenu"
      class="bg-transparent p-2 rounded-full focus:outline-none"
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
    <div
      v-if="isMenuOpen"
      :class="[
        'bg-black text-white p-4 rounded shadow-lg',
        isHomePage ? 'w-full text-center' : 'absolute top-full right-0 mt-2',
      ]"
    >
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        @click="closeMenu"
        :to="link.to"
        class="block py-2 hover:text-yellow-300"
      >
        {{ link.text }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute } from "vue-router";

const props = defineProps({
  defaultOpen: {
    type: Boolean,
    default: false,
  },
});

const route = useRoute();
const isMenuOpen = ref(props.defaultOpen);

const isHomePage = computed(() => route.path === "/");

const links = [
  { to: "/", text: "Home" },
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

// Close menu when route changes, except on homepage
watch(
  () => route.path,
  () => {
    if (!isHomePage.value) {
      isMenuOpen.value = false;
    }
  }
);
</script>
