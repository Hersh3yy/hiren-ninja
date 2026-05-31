<template>
  <header
    class="fixed top-0 left-0 right-0 flex justify-between items-center p-4 z-50 bg-surface/90 backdrop-blur-md"
  >
    <NuxtLink to="/" class="group flex items-center gap-3" aria-label="Hiren Devs, go to home">
      <img
        src="/hirshi2.svg"
        alt=""
        aria-hidden="true"
        class="h-9 w-auto transition-transform duration-700 ease-in-out group-hover:rotate-[360deg]"
      >
      <span
        class="text-2xl sm:text-3xl md:text-4xl text-accent whitespace-nowrap font-sixtyfour font-normal antialiased"
        :style="{ fontVariationSettings: 'BLED 0, SCAN -16, XELA 60, YELA -94' }"
      >
        HIREN DEVS
      </span>
    </NuxtLink>

    <nav class="ml-4">
      <div class="hidden md:flex items-center space-x-8">
        <MoleculesNavLink v-for="link in links" :key="link.to" :to="link.to" :text="link.text" />
      </div>

      <button
        class="md:hidden text-content rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        :aria-expanded="isMobileMenuOpen"
        aria-controls="mobile-menu"
        aria-label="Toggle navigation menu"
        @click="toggleMobileMenu"
      >
        <AtomsIcon :path="isMobileMenuOpen ? closeIconPath : menuIconPath" size="md" />
      </button>

      <div
        v-show="isMobileMenuOpen"
        id="mobile-menu"
        class="absolute top-full right-0 w-48 bg-surface/95 backdrop-blur-md md:hidden rounded-b-lg z-[51]"
      >
        <div class="py-2">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="block px-4 py-2 text-content hover:bg-elevated/50 transition-colors duration-200"
            @click="closeMobileMenu"
          >
            {{ link.text }}
          </NuxtLink>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const menuIconPath = 'M4 6h16M4 12h16M4 18h16'
const closeIconPath = 'M6 18L18 6M6 6l12 12'

const isMobileMenuOpen = ref(false)

const links = [
  { to: '/about', text: 'About' },
  { to: '/projects', text: 'Projects' },
  { to: '/services', text: 'Services' },
  { to: '/experiments', text: 'Experiments' }
]

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const route = useRoute()
watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false
  }
)
</script>
