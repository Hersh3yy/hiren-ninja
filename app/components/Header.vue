<template>
  <header
    class="fixed top-0 left-0 right-0 flex justify-between items-center p-4 z-20 bg-gray-800/90 backdrop-blur-md"
  >
    <NuxtLink
      to="/"
      :class="[
        'flex items-center',
        $route.path === '/' ? 'w-full justify-center' : '',
      ]"
    >
      <h1
        class="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-300 whitespace-nowrap font-['Sixtyfour_Convergence'] font-[400] antialiased"
        style="
          font-variation-settings: 'BLED' 0, 'SCAN' -16, 'XELA' 60, 'YELA' -94;
        "
      >
        HIREN DEVS
      </h1>
    </NuxtLink>
    <MenuComponent
      v-if="$route.path !== '/'"
      :defaultOpen="false"
      class="ml-4"
    />
  </header>
</template>
