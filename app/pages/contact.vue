<template>
  <div class="container mx-auto px-4 sm:px-6 py-8 max-w-2xl">
    <h1 class="page-title">Contact Me</h1>
    <p class="text-content-muted mb-8">
      Have a project in mind? Whether it's a new website, a tool powered by AI, or just
      removing the busywork from your day — send a note and I'll get back to you.
    </p>

    <form class="card space-y-6" :class="{ 'opacity-50 pointer-events-none': isSubmitting }" @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-content-muted mb-2" for="contact-name">Name</label>
          <input
            id="contact-name"
            v-model="form.name"
            type="text"
            required
            class="w-full bg-elevated text-content rounded p-3 border border-border-default focus:border-accent focus:ring-1 focus:ring-accent"
          >
        </div>
        <div>
          <label class="block text-content-muted mb-2" for="contact-email">Email</label>
          <input
            id="contact-email"
            v-model="form.email"
            type="email"
            required
            class="w-full bg-elevated text-content rounded p-3 border border-border-default focus:border-accent focus:ring-1 focus:ring-accent"
          >
        </div>
      </div>

      <div>
        <label class="block text-content-muted mb-2" for="contact-message">Message</label>
        <textarea
          id="contact-message"
          v-model="form.message"
          rows="5"
          required
          class="w-full bg-elevated text-content rounded p-3 border border-border-default focus:border-accent focus:ring-1 focus:ring-accent"
        />
      </div>

      <div v-if="statusMessage" :class="[
        'p-3 rounded text-sm',
        statusMessage.type === 'error' ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'
      ]">
        {{ statusMessage.text }}
      </div>

      <div class="flex justify-end">
        <button type="submit" class="btn-primary flex items-center gap-2" :disabled="isSubmitting">
          <span v-if="isSubmitting"
            class="w-4 h-4 border-2 border-ink border-t-transparent rounded-full animate-spin"/>
          {{ isSubmitting ? 'Sending...' : 'Send Message' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

useSeoMeta({
  title: 'Contact - Hiren',
  ogTitle: 'Contact - Hiren',
  description: 'Get in touch with Hiren — websites, AI tools, automation and digital products for creative businesses.',
  ogDescription: 'Available for projects and collaborations. Let\'s connect!',
  twitterCard: 'summary_large_image'
})

const form = reactive({
  name: '',
  email: '',
  message: ''
})

const { isSubmitting, statusMessage, submit } = useSubmitLead('/api/contact')

const handleSubmit = async () => {
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
