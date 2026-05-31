<template>
  <div
    class="bg-surface/80 backdrop-blur-xl rounded-xl p-6 border border-border-subtle hover:border-accent-muted transition-all h-full flex flex-col"
  >
    <div class="mb-4">
      <h2 class="text-2xl font-bold text-accent">{{ title }}</h2>
      <p class="text-content-muted mt-2">{{ description }}</p>
    </div>
    <div class="flex-grow">
      <ul class="list-disc list-inside space-y-2 text-content-muted">
        <li v-for="feature in features" :key="feature">{{ feature }}</li>
      </ul>
    </div>
    <button
      @click="$emit('start')"
      :data-umami-event="`Service clicked ${title}`"
      class="w-full mt-6 py-3 bg-accent text-ink rounded-lg hover:bg-accent-hover transition-colors font-bold"
    >
      Get Started
    </button>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  description: String,
  features: Array
})
defineEmits(['start'])
</script>
