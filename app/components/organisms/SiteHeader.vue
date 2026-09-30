<template>
  <header
    class="fixed top-0 left-0 right-0 flex justify-between items-center p-4 z-50 bg-surface/90 backdrop-blur-md"
  >
    <NuxtLink to="/" class="group flex items-center gap-3" aria-label="Hiren Devs, go to home">
      <img
        src="/hirshi2.svg"
        alt=""
        aria-hidden="true"
        class="h-9 w-auto transition-transform duration-700 ease-in-out motion-safe:group-hover:rotate-[360deg]"
      >
      <span
        class="text-2xl sm:text-3xl md:text-4xl text-accent whitespace-nowrap font-sixtyfour font-normal antialiased"
        :style="{ fontVariationSettings: 'BLED 0, SCAN -16, XELA 60, YELA -94' }"
      >
        HIREN DEVS
      </span>
    </NuxtLink>

    <nav class="ml-4" aria-label="Main navigation">
      <div class="hidden lg:flex items-center space-x-8">
        <MoleculesNavLink v-for="link in links" :key="link.to" :to="link.to" :text="link.text" />
      </div>

      <button
        ref="menuButtonRef"
        class="lg:hidden text-content rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        :aria-expanded="isMobileMenuOpen"
        aria-controls="mobile-menu"
        aria-label="Toggle navigation menu"
        @click="toggleMobileMenu"
      >
        <AtomsIcon :path="isMobileMenuOpen ? ICONS.close : ICONS.menu" size="md" />
      </button>

      <div
        v-show="isMobileMenuOpen"
        id="mobile-menu"
        class="absolute top-full right-0 w-48 bg-surface/95 backdrop-blur-md lg:hidden rounded-b-lg z-[51] border border-border-subtle py-2"
      >
        <MoleculesNavLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          :text="link.text"
          class="block px-4 py-2 hover:bg-elevated/50"
          @click="closeMobileMenu"
        />
      </div>
    </nav>
  </header>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ICONS } from '~/utils/icons'

const isMobileMenuOpen = ref(false)
const menuButtonRef = ref(null)

const links = Object.freeze([
  { to: '/about', text: 'About' },
  { to: '/projects', text: 'Projects' },
  { to: '/services', text: 'Services' },
  { to: '/experiments', text: 'Experiments' },
  { to: '/ade-planner', text: 'ADE Planner' }
])

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

function onDocumentKeydown(event) {
  if (!isMobileMenuOpen.value) return
  if (event.key === 'Escape') {
    event.preventDefault()
    closeMobileMenu()
    menuButtonRef.value?.focus()
  }
}

watch(isMobileMenuOpen, (open) => {
  if (open) {
    document.addEventListener('keydown', onDocumentKeydown)
  } else {
    document.removeEventListener('keydown', onDocumentKeydown)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onDocumentKeydown)
})

const route = useRoute()
watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false
  }
)
</script>
