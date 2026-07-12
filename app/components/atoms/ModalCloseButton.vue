<template>
  <button
    type="button"
    class="btn-close inline-flex items-center justify-center rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface"
    :aria-label="label"
    @click="$emit('click', $event)"
  >
    <AtomsIcon :path="closeIconPath" :size="size" />
  </button>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: 'Close'
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  }
})

defineEmits(['click'])

const closeIconPath = 'M6 18L18 6M6 6l12 12'
</script>
