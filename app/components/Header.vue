<template>
    <header
        class="fixed top-0 left-0 right-0 flex justify-between items-center p-4 z-50 bg-gray-800/90 backdrop-blur-md">
        <!-- Logo - centered on home page, left-aligned elsewhere -->
        <NuxtLink to="/" class="flex items-center">
            <h1 class="text-2xl sm:text-3xl md:text-4xl text-yellow-300 whitespace-nowrap font-['Sixtyfour_Convergence'] font-[400] antialiased"
                :style="{
                    fontVariationSettings: 'BLED 0, SCAN -16, XELA 60, YELA -94'
                }">
                HIREN DEVS
            </h1>
        </NuxtLink>

        <!-- Navigation Menu - Only show if not on home page -->
        <nav class="ml-4">
            <!-- Desktop Menu -->
            <div class="hidden md:flex items-center space-x-8">
                <NuxtLink v-for="link in links" :key="link.to" :to="link.to"
                    class="text-white hover:text-yellow-300 transition-colors duration-200">
                    {{ link.text }}
                </NuxtLink>
            </div>

            <!-- Mobile Menu Button -->
            <button @click="toggleMobileMenu" class="md:hidden text-white focus:outline-none">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 6h16M4 12h16M4 18h16" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <!-- Mobile Menu Dropdown -->
            <div v-show="isMobileMenuOpen"
                class="absolute top-full right-0 w-48 bg-gray-800/90 backdrop-blur-md md:hidden">
                <div class="py-2">
                    <NuxtLink v-for="link in links" :key="link.to" :to="link.to"
                        class="block px-4 py-2 text-white hover:bg-gray-700/50 transition-colors duration-200"
                        @click="closeMobileMenu">
                        {{ link.text }}
                    </NuxtLink>
                </div>
            </div>
        </nav>
    </header>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

const isMobileMenuOpen = ref(false);

const links = [
    { to: "/about", text: "About" },
    { to: "/projects", text: "Projects" },
    { to: "/services", text: "Services" },
];

const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
    isMobileMenuOpen.value = false;
};

// Close menu when route changes
const route = useRoute();
watch(
    () => route.path,
    () => {
        isMobileMenuOpen.value = false;
    },
);
</script>

<style scoped>
/* Optional: Add hover effects for links */
a {
    position: relative;
}

a::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 1px;
    background-color: theme("colors.yellow.300");
    transition: width 0.2s ease;
}

a:hover::after {
    width: 100%;
}

/* Ensure mobile menu dropdown is above other content */
.absolute {
    z-index: 51;
}
</style>