<!-- components/blog/BlogPost.vue -->
<template>
  <article class="bg-black/70 rounded-lg overflow-hidden shadow-lg mb-8">
    <img
      v-if="image"
      :src="image"
      :alt="title"
      class="w-full h-48 object-cover"
    />
    <div class="p-6">
      <h2 class="text-2xl font-bold text-yellow-300 mb-4">{{ title }}</h2>
      <div class="text-white prose prose-invert">
        {{ content }}
      </div>
      <div class="mt-4 flex gap-2">
        <span
          v-for="tag in tags"
          :key="tag"
          class="px-3 py-1 bg-yellow-300/20 text-yellow-300 rounded-full text-sm"
        >
          {{ tag }}
        </span>
      </div>
    </div>
  </article>
</template>

<script setup>
defineProps({
  title: String,
  content: String,
  image: String,
  tags: Array,
});
</script>
