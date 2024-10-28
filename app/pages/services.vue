<!-- pages/services.vue -->
<template>
  <section class="min-h-screen">
    <!-- Graph paper background with overlay -->
    <div class="absolute inset-0 bg-grid-pattern"></div>

    <!-- Content -->
    <div class="container mx-auto px-4 sm:px-6 py-8 relative z-10">
      <h1 class="text-3xl sm:text-4xl font-bold text-yellow-300 mb-8">
        Services
      </h1>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <!-- Discovery Session Card -->
        <div
          class="bg-black/30 backdrop-blur-xl rounded-lg p-6 border border-yellow-300/20 hover:border-yellow-300/40 transition-all"
        >
          <h2 class="text-2xl font-bold text-yellow-300 mb-4">
            Discovery Session
          </h2>
          <div class="text-white space-y-4">
            <p>
              3 hours of dedicated consultation to understand your IT needs and
              goals.
            </p>
            <ul class="list-disc list-inside space-y-2 text-gray-200">
              <li>In-depth needs analysis</li>
              <li>Technology stack recommendations</li>
              <li>Research and feasibility studies</li>
              <li>Project scope definition</li>
            </ul>
            <div class="flex justify-between items-end mt-6">
              <span class="text-2xl font-bold text-yellow-300">€100</span>
              <span class="text-gray-300">3 hours</span>
            </div>
          </div>
        </div>

        <!-- Website Development Card -->
        <div
          class="bg-black/30 backdrop-blur-xl rounded-lg p-6 border border-yellow-300/20 hover:border-yellow-300/40 transition-all"
        >
          <h2 class="text-2xl font-bold text-yellow-300 mb-4">
            Website Development
          </h2>
          <div class="text-white space-y-4">
            <div class="space-y-2">
              <p class="font-semibold">Simple Website</p>
              <p class="text-gray-200">
                Starting from
                <span class="text-yellow-300 font-bold">€300</span>
              </p>
            </div>
            <div class="space-y-2">
              <p class="font-semibold">Advanced Website</p>
              <p class="text-gray-200">
                Starting from
                <span class="text-yellow-300 font-bold">€1000+</span>
              </p>
            </div>
            <ul class="list-disc list-inside space-y-2 text-gray-200">
              <li>Custom design</li>
              <li>Mobile responsive</li>
              <li>SEO optimization</li>
              <li>Content management system</li>
            </ul>
          </div>
        </div>

        <!-- Web Applications Card -->
        <div
          class="bg-black/30 backdrop-blur-xl rounded-lg p-6 border border-yellow-300/20 hover:border-yellow-300/40 transition-all"
        >
          <h2 class="text-2xl font-bold text-yellow-300 mb-4">
            Web Applications
          </h2>
          <div class="text-white space-y-4">
            <p>Custom web applications tailored to your specific needs.</p>
            <ul class="list-disc list-inside space-y-2 text-gray-200">
              <li>Full-stack development</li>
              <li>Database design</li>
              <li>API integration</li>
              <li>Scalable architecture</li>
            </ul>
            <!-- <div class="mt-6 text-center">
              <NuxtLink
                to="/contact"
                class="inline-block px-6 py-2 bg-yellow-300 text-black rounded-full hover:bg-yellow-400 transition-colors"
              >
                Contact for Discovery Phase
              </NuxtLink>
            </div> -->
          </div>
        </div>

        <!-- Freelance Development Card -->
        <div
          class="bg-black/30 backdrop-blur-xl rounded-lg p-6 border border-yellow-300/20 hover:border-yellow-300/40 transition-all"
        >
          <h2 class="text-2xl font-bold text-yellow-300 mb-4">
            Freelance Development
          </h2>
          <div class="text-white space-y-4">
            <p>Hourly development services with flexible engagement options.</p>
            <div class="space-y-2">
              <p class="text-lg">
                Rate range:
                <span class="text-yellow-300 font-bold">€60-90/hour</span>
              </p>
              <p class="text-gray-200 text-sm">Rate varies based on:</p>
              <ul class="list-disc list-inside space-y-1 text-gray-200 text-sm">
                <li>Hours purchased</li>
                <li>Project complexity</li>
                <li>Decision-making autonomy</li>
                <li>Technical requirements</li>
              </ul>
            </div>
          </div>

          <!-- Contact Form Button -->
          
        </div>
        <!-- <div class="self-center max-w-xl mx-10">
            <button
              @click="showForm = true"
              class="w-full py-3 bg-yellow-300 text-black rounded-lg hover:bg-yellow-400 transition-colors font-bold text-lg"
            >
              Get in Touch
            </button>
          </div>

          <!-- Form Modal -->
          <div
            v-if="showForm"
            class="fixed inset-0 flex items-center justify-center z-50"
          >
            <!-- Modal content from previous example... -->
          </div> -->
      </div>
    </div>
  </section>
</template>

<style scoped>
/* .bg-grid-pattern {
  background-image: linear-gradient(
      rgba(255, 255, 255, 0.1) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  background-color: rgba(0, 0, 0, 0.8);
} */
</style>
