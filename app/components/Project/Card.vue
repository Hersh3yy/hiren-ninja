<template>
  <div
    @click="emit('click', project)"
    class="group h-full w-full max-w-[95vw] sm:max-w-[45vw] lg:max-w-[30vw] xl:max-w-[22vw] 2xl:max-w-[18vw] rounded-xl overflow-hidden bg-gradient-to-b from-gray-800/80 to-gray-900/90 border border-gray-800/50 transition-all duration-300 hover:border-gray-700/50 hover:shadow-lg cursor-pointer"
  >
    <div class="aspect-video relative overflow-hidden">
      <img
        v-if="project.image_urls?.length"
        :src="project.image_urls[0]"
        :alt="project.name"
        class="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
      />
      <div
        v-else
        class="w-full h-full bg-gray-700 flex items-center justify-center"
      >
        <span class="text-gray-500">No Image</span>
      </div>

      <div
        v-if="project.for_employer"
        class="absolute top-2 right-2 px-2 py-1 text-xs font-medium bg-blue-500/90 text-white rounded-full"
      >
        Professional
      </div>
    </div>

    <div class="p-4 flex flex-col flex-grow">
      <div class="flex items-start justify-between gap-2 mb-2">
        <h2
          class="text-base sm:text-lg font-semibold text-white/90 line-clamp-1 break-words"
        >
          {{ project.name }}
        </h2>
        <span class="text-xs sm:text-sm text-gray-400 whitespace-nowrap">
          {{ project.year }}
        </span>
      </div>

      <p
        class="text-xs sm:text-sm text-gray-300/80 mb-4 line-clamp-2 break-words"
      >
        {{ project.description }}
      </p>

      <div class="flex flex-wrap gap-1.5 mt-auto">
        <span
          v-for="tag in project.tech_tags"
          :key="tag.id"
          class="px-2 py-0.5 text-xs font-medium bg-gray-700/50 text-gray-300 rounded-full"
        >
          {{ tag.name }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(["click"]);

defineProps({
  project: {
    type: Object,
    required: true,
  },
});
</script>
