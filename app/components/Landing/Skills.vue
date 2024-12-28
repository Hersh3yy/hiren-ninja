<template>
  <div class="skills-section mt-12 px-4 sm:px-8">
    <h2 class="section-title">My Skills</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div class="card">
        <div class="bg-yellow-500 h-32 w-full rounded-lg mb-2"></div>
        <h3 class="text-xl font-semibold text-white">Web Development</h3>
        <p class="text-gray-300">Custom websites for small businesses and individuals.</p>
      </div>
      <div class="skill-card border border-white p-4 rounded-lg">
        <div class="bg-gray-500 h-32 w-full rounded-lg mb-2"></div>
        <h3 class="text-xl font-semibold text-white">Data Visualization</h3>
        <p class="text-gray-300">Communicate complex data effectively.</p>
      </div>
      <div class="skill-card border border-white p-4 rounded-lg">
        <div class="bg-yellow-500 h-32 w-full rounded-lg mb-2"></div>
        <h3 class="text-xl font-semibold text-white">Data-Dependent Applications</h3>
        <p class="text-gray-300">Build applications that rely on data.</p>
      </div>
      <div class="skill-card border border-white p-4 rounded-lg">
        <div class="bg-gray-500 h-32 w-full rounded-lg mb-2"></div>
        <h3 class="text-xl font-semibold text-white">Website Maintenance & Renewal</h3>
        <p class="text-gray-300">Maintain live websites and renew old projects.</p>
      </div>
    </div>
    <NuxtLink to="/services" class="mt-6 inline-block text-yellow-300 hover:text-yellow-400">Learn more about my services</NuxtLink>
  </div>
</template>