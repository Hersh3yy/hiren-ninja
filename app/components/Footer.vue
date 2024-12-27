<template>
  <footer class="w-full py-8 backdrop-blur-xl">
    <div class="container mx-auto px-4">
      <div class="text-center">
        <h2 class="text-xl sm:text-2xl font-semibold text-yellow-300 mb-4">
          Get in touch
        </h2>
        <div class="flex flex-col items-center justify-center space-y-4">
          <a href="mailto:hello@hiren.ninja"
            class="text-white hover:text-yellow-300 transition-colors duration-300 flex items-center group">
            <svg class="w-5 h-5 sm:w-6 sm:h-6 mr-2 group-hover:scale-110 transition-transform" fill="none"
              stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z">
              </path>
            </svg>
            <span class="text-sm sm:text-base">hello@hiren.ninja</span>
          </a>
          <NuxtLink to="/about" class="text-white hover:text-yellow-300 transition-colors duration-300">
            About
          </NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>
