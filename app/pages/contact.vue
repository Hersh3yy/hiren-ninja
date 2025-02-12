<template>
  <div class="container mx-auto px-4 sm:px-6 py-8">
    <h1 class="text-3xl font-bold text-yellow-300 mb-4">Contact Me</h1>
    <p class="text-gray-300">Feel free to reach out for any inquiries or collaborations.</p>
    <!-- Add your contact form or details here -->
  </div>
</template>

<script setup>
import { useSeoMeta } from '@vueuse/head'

useSeoMeta({
  title: 'Contact Me - Hiren',
  ogTitle: 'Contact Me - Hiren',
  description: 'Get in touch with Hiren for inquiries or collaborations.',
  ogDescription: 'I am available for projects and collaborations. Let's connect!',
  ogImage: '/path/to/contact-image.jpg',
  twitterCard: 'summary_large_image',
})
</script>