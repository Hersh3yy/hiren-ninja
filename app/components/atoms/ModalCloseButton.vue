<template>
  <button
    type="button"
    class="btn-close inline-flex items-center justify-center rounded-full p-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
    :aria-label="label"
    @click="$emit('click', $event)"
  >
    <AtomsIcon :path="ICONS.close" :size="size" />
  </button>
</template>

<script setup>
import { ICONS } from '~/utils/icons'

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
</script>
