<template>
  <MoleculesCard
    as="form"
    class="space-y-6"
    :class="{ 'opacity-50 pointer-events-none': isSubmitting }"
    :aria-busy="isSubmitting"
    @submit.prevent="handleSubmit"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <MoleculesFormField
        v-model="form.name"
        label="Name"
        name="name"
        autocomplete="name"
        required
      />
      <MoleculesFormField
        v-model="form.email"
        label="Email"
        type="email"
        name="email"
        autocomplete="email"
        required
      />
    </div>

    <MoleculesFormField
      v-model="form.message"
      label="Message"
      type="textarea"
      name="message"
      :rows="5"
      :described-by="statusMessage ? 'contact-status' : ''"
      required
    />

    <MoleculesStatusAlert
      v-if="statusMessage"
      id="contact-status"
      :message="statusMessage.text"
      :type="statusMessage.type === 'error' ? 'error' : 'success'"
    />

    <div class="flex justify-end">
      <AtomsButton
        :text="isSubmitting ? 'Sending...' : 'Send Message'"
        type="submit"
        :loading="isSubmitting"
        :disabled="isSubmitting"
      />
    </div>
  </MoleculesCard>
</template>

<script setup>
import { reactive } from 'vue'

const form = reactive({
  name: '',
  email: '',
  message: ''
})

const { isSubmitting, statusMessage, submit } = useSubmitLead('/api/contact')

async function handleSubmit() {
  try {
    await submit({ ...form })
    form.name = ''
    form.email = ''
    form.message = ''
  } catch {
    // Error message is set by useSubmitLead
  }
}
</script>
