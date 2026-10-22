<template>
  <form class="space-y-2" @submit.prevent="submit">
    <!-- Enter sends; Shift+Enter is a new line. -->
    <div @keydown.enter.exact.prevent="submit">
      <MoleculesFormField
        :id="id"
        :model-value="modelValue"
        type="textarea"
        :label="label"
        :rows="rows"
        :placeholder="placeholder"
        autocomplete="off"
        @update:model-value="$emit('update:modelValue', $event)"
      />
    </div>
    <AtomsButton type="submit" :text="submitText" :loading="loading" :disabled="disabled" full-width />
  </form>
</template>

<script setup>
// A textarea with one send button: ask in your own words. Props-driven; the feature decides what a send does.
const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  submitText: { type: String, default: 'Send' },
  rows: { type: Number, default: 2 },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  id: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'submit'])

function submit() {
  if (!props.loading && !props.disabled) emit('submit')
}
</script>
