<template>
  <div>
    <label v-if="label" class="block text-content-muted mb-2" :for="inputId">
      {{ label }}
    </label>

    <textarea
      v-if="type === 'textarea'"
      :id="inputId"
      :value="modelValue"
      :name="name || undefined"
      :rows="rows"
      :required="required"
      :placeholder="placeholder || undefined"
      :autocomplete="autocomplete || undefined"
      :aria-describedby="describedBy || undefined"
      :class="fieldClasses"
      @input="emit('update:modelValue', $event.target.value)"
    />

    <select
      v-else-if="type === 'select'"
      :id="inputId"
      :value="modelValue"
      :name="name || undefined"
      :required="required"
      :aria-describedby="describedBy || undefined"
      :class="fieldClasses"
      @change="emit('update:modelValue', $event.target.value)"
    >
      <option v-if="placeholder" value="">{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>

    <input
      v-else
      :id="inputId"
      :value="modelValue"
      :type="type"
      :name="name || undefined"
      :required="required"
      :placeholder="placeholder || undefined"
      :autocomplete="autocomplete || undefined"
      :aria-describedby="describedBy || undefined"
      :class="fieldClasses"
      @input="emit('update:modelValue', $event.target.value)"
    >
  </div>
</template>

<script setup>
import { useId } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'email', 'textarea', 'select'].includes(value)
  },
  name: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  autocomplete: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  rows: {
    type: Number,
    default: 3
  },
  options: {
    type: Array,
    default: () => []
  },
  describedBy: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const generatedId = useId()
const inputId = computed(() => props.id || generatedId)

const fieldClasses = 'w-full bg-elevated text-content rounded p-3 border border-border-default focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none'
</script>
