<template>
  <button
    v-if="interactive"
    type="button"
    :class="tagClasses"
    @click="$emit('click')"
  >
    {{ label }}
  </button>
  <span v-else :class="tagClasses">{{ label }}</span>
</template>

<script setup>
const props = defineProps({
  label: {
    type: [String, Number],
    required: true
  },
  active: {
    type: Boolean,
    default: false
  },
  interactive: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

const tagClasses = computed(() => {
  const baseClasses = 'px-3 py-1 rounded-full text-xs sm:text-sm transition-colors duration-200'
  const stateClasses = props.active
    ? 'bg-accent text-ink'
    : 'bg-elevated text-content hover:bg-border-default'

  return [baseClasses, stateClasses].join(' ')
})
</script>
