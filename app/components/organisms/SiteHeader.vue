<template>
  <header
    class="fixed top-0 left-0 right-0 flex justify-between items-center p-4 z-50 bg-surface/90 backdrop-blur-md"
  >
    <NuxtLink to="/" class="group flex items-center gap-3" aria-label="Hiren Devs, go to home">
      <img
        src="/hirshi2.svg"
        width="25"
        height="36"
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

      <!-- Native popover: popovertarget toggles it, the browser sets aria-expanded,
           closes it on Escape or a click outside, and hands focus back to the button. -->
      <MoleculesIconButton
        class="lg:hidden"
        :icon-path="isMobileMenuOpen ? ICONS.close : ICONS.menu"
        icon-size="md"
        label="Toggle navigation menu"
        popovertarget="mobile-menu"
      />

      <div
        id="mobile-menu"
        ref="menuRef"
        popover
        class="fixed inset-auto top-[4.25rem] right-0 m-0 w-48 bg-surface/95 text-content backdrop-blur-md lg:hidden rounded-bl-lg border border-border-subtle py-2"
        @toggle="isMobileMenuOpen = $event.newState === 'open'"
      >
        <MoleculesNavLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          :text="link.text"
          class="block px-4 py-2 hover:bg-elevated/50"
        />
      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ICONS } from '~/utils/icons'

// Mirrors the popover's state, only to swap the menu / close icon.
const isMobileMenuOpen = ref(false)
const menuRef = ref(null)

const links = Object.freeze([
  { to: '/about', text: 'About' },
  { to: '/projects', text: 'Projects' },
  { to: '/services', text: 'Services' },
  { to: '/experiments', text: 'Experiments' },
  { to: '/ade-planner', text: 'ADE Planner' }
])

// Client-side navigation doesn't reload the page, so close the menu ourselves.
const route = useRoute()
watch(() => route.path, () => {
  if (menuRef.value?.matches(':popover-open')) menuRef.value.hidePopover()
})
</script>
