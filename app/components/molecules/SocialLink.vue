<template>
  <a
    :href="href"
    class="text-content hover:text-accent transition-colors duration-300 flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
  >
    <AtomsIcon
      v-if="iconPath"
      :path="iconPath"
      size="sm"
      class="mr-2 group-hover:scale-110 transition-transform"
    />
    <span class="text-sm sm:text-base">{{ label }}</span>
  </a>
</template>

<script setup>
defineProps({
  href: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  iconPath: {
    type: String,
    default: null
  }
})
</script>
