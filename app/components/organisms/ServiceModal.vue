<template>
  <MoleculesModalShell
    :is-open="isOpen"
    :title="serviceTitle"
    close-label="Close service request form"
    panel-class="w-full max-w-2xl p-6 shadow-xl"
    @close="close"
  >
    <form
      class="space-y-6"
      :class="{ 'opacity-50 pointer-events-none': isSubmitting }"
      :aria-busy="isSubmitting"
      @submit.prevent="handleSubmit"
    >
      <MoleculesFormField
        v-model="formData.description"
        label="Project Description"
        type="textarea"
        :placeholder="placeholderText"
        :rows="3"
        required
      />

      <MoleculesFormField
        v-model="formData.timeline"
        :label="timelineLabel"
        type="select"
        :placeholder="`Select ${timelineLabel.toLowerCase()}`"
        :options="timelineOptions"
        required
      />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MoleculesFormField
          v-model="formData.name"
          label="Full Name"
          name="name"
          autocomplete="name"
          required
        />
        <MoleculesFormField
          v-model="formData.email"
          label="Email"
          type="email"
          name="email"
          autocomplete="email"
          required
        />
      </div>

      <MoleculesStatusAlert
        v-if="statusMessage"
        :message="statusMessage.text"
        :type="statusMessage.type === 'error' ? 'error' : 'success'"
      />

      <div class="flex justify-end gap-4">
        <AtomsButton text="Cancel" variant="outline" @click="close" />
        <AtomsButton
          :text="isSubmitting ? 'Sending...' : 'Send Request'"
          type="submit"
          :loading="isSubmitting"
          :disabled="isSubmitting"
        />
      </div>
    </form>
  </MoleculesModalShell>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { getServiceById } from '~/data/services'

const SUCCESS_CLOSE_DELAY_MS = 2000

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  serviceType: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'submit'])

const { isSubmitting, statusMessage, submit, clearStatus } = useSubmitLead('/api/service-request')

const formData = ref({
  description: '',
  timeline: '',
  name: '',
  email: '',
  serviceType: props.serviceType
})

function close() {
  emit('close')
  formData.value = {
    description: '',
    timeline: '',
    name: '',
    email: '',
    serviceType: props.serviceType
  }
  clearStatus()
}

const service = computed(() => getServiceById(props.serviceType))

const serviceTitle = computed(() => service.value?.title || 'Service Request')

const placeholderText = computed(
  () => service.value?.modalPlaceholder || 'Please describe your project'
)

const timelineLabel = 'Timeline'

const timelineOptions = Object.freeze([
  { value: 'urgent', label: 'Urgent (1-2 weeks)' },
  { value: 'soon', label: 'Standard (1-2 months)' },
  { value: 'flexible', label: 'Flexible (2+ months)' }
])

watch(() => props.serviceType, (newType) => {
  formData.value.serviceType = newType
}, { immediate: true })

async function handleSubmit() {
  try {
    await submit(formData.value)

    window.setTimeout(() => {
      emit('submit', formData.value)
      close()
    }, SUCCESS_CLOSE_DELAY_MS)
  } catch {
    // Error message is set by useSubmitLead
  }
}
</script>
