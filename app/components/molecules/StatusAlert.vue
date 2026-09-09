<template>
  <div
    v-if="message"
    :id="id || undefined"
    role="status"
    aria-live="polite"
    :class="alertClasses"
  >
    {{ message }}
  </div>
</template>

<script setup>
const props = defineProps({
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'error'].includes(value)
  },
  id: {
    type: String,
    default: ''
  }
})

const alertClasses = computed(() => {
  const variants = {
    info: 'bg-elevated text-content',
    success: 'bg-success-muted text-success',
    error: 'bg-danger-muted text-danger'
  }

  return ['p-3 rounded text-sm', variants[props.type]].join(' ')
})
</script>
