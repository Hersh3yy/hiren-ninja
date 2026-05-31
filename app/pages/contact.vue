<template>
  <div class="container mx-auto px-4 sm:px-6 py-8 max-w-2xl">
    <h1 class="page-title">Contact Me</h1>
    <p class="text-content-muted mb-8">
      Have a project in mind - AI integration, automation, or a backend that needs to scale?
      Send a note and I'll get back to you.
    </p>

    <form class="card space-y-6" @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-content-muted mb-2" for="contact-name">Name</label>
          <input
            id="contact-name"
            v-model="form.name"
            type="text"
            required
            class="w-full bg-elevated text-content rounded p-3 border border-border-default focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>
        <div>
          <label class="block text-content-muted mb-2" for="contact-email">Email</label>
          <input
            id="contact-email"
            v-model="form.email"
            type="email"
            required
            class="w-full bg-elevated text-content rounded p-3 border border-border-default focus:border-accent focus:ring-1 focus:ring-accent"
          />
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
        ></textarea>
      </div>

      <div class="flex justify-end">
        <button type="submit" class="btn-primary">Send Message</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

useSeoMeta({
  title: 'Contact Me - Hiren',
  ogTitle: 'Contact Me - Hiren',
  description: 'Get in touch with Hiren for AI integration, automation, and backend engineering projects.',
  ogDescription: 'Available for projects and collaborations. Let\'s connect!',
  twitterCard: 'summary_large_image'
})

const form = reactive({
  name: '',
  email: '',
  message: ''
})

// Stub: composes a mailto until a dedicated contact endpoint is wired up.
const handleSubmit = () => {
  const subject = encodeURIComponent(`Project enquiry from ${form.name}`)
  const body = encodeURIComponent(`${form.message}\n\nFrom: ${form.name} <${form.email}>`)
  window.location.href = `mailto:hello@hiren.ninja?subject=${subject}&body=${body}`
}
</script>
