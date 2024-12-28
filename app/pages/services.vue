<!-- pages/services.vue -->
<template>
  <section class="min-h-screen">
    <div class="absolute inset-0 bg-grid-pattern"></div>

    <div class="container mx-auto px-4 sm:px-6 py-8 relative z-10">
      <h1 class="page-title">Services</h1>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Discovery Session Card -->
        <div class="card">
          <div class="service-title">
            <h2 class="text-yellow-300">Discovery Session</h2>
          </div>
          <div class="service-content">
            <p>
              3 hours of dedicated consultation to understand your IT needs and
              goals.
            </p>
            <ul class="service-list">
              <li>In-depth needs analysis</li>
              <li>Technology stack recommendations</li>
              <li>Research and feasibility studies</li>
              <li>Project scope definition</li>
            </ul>
            <div class="flex justify-between items-end mt-6">
              <span class="price">€100</span>
              <span class="duration">3 hours</span>
            </div>
            <button @click="openInquiryForm('Discovery Session')" class="service-button">Inquire</button>
          </div>
        </div>

        <!-- Website Development Card -->
        <div class="card">
          <div class="service-title">
            <h2>Website Development</h2>
          </div>
          <div class="service-content">
            <div class="space-y-2">
              <p class="service-subtitle">Simple Website</p>
              <p class="text-gray-200">
                Starting from
                <span class="price-inline">€300</span>
              </p>
            </div>
            <div class="space-y-2">
              <p class="service-subtitle">Advanced Website</p>
              <p class="text-gray-200">
                Starting from
                <span class="price-inline">€1000+</span>
              </p>
            </div>
            <ul class="service-list">
              <li>Custom design</li>
              <li>Mobile responsive</li>
              <li>SEO optimization</li>
              <li>Content management system</li>
            </ul>
          </div>
        </div>

        <!-- Web Applications Card -->
        <div class="card">
          <div class="service-title">
            <h2>Web Applications</h2>
          </div>
          <div class="service-content">
            <p>Custom web applications tailored to your specific needs.</p>
            <ul class="service-list">
              <li>Full-stack development</li>
              <li>Database design</li>
              <li>API integration</li>
              <li>Scalable architecture</li>
            </ul>
          </div>
        </div>

        <!-- Freelance Development Card -->
        <div class="card">
          <div class="service-title">
            <h2>Freelance Development</h2>
          </div>
          <div class="service-content">
            <p>Hourly development services with flexible engagement options.</p>
            <div class="space-y-2">
              <p class="text-lg">
                Rate range:
                <span class="price-inline">€60-90/hour</span>
              </p>
              <p class="text-gray-200 text-sm">Rate varies based on:</p>
              <ul class="service-list text-sm">
                <li>Hours purchased</li>
                <li>Project complexity</li>
                <li>Decision-making autonomy</li>
                <li>Technical requirements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Inquiry Form Modal -->
      <div v-if="showInquiryForm" class="inquiry-form-modal">
        <h2 class="text-yellow-300">Inquiry Form</h2>
        <form @submit.prevent="submitInquiry">
          <label for="name">Name:</label>
          <input type="text" v-model="inquiryData.name" required />

          <label for="email">Email:</label>
          <input type="email" v-model="inquiryData.email" required />

          <label for="service">Service:</label>
          <input type="text" v-model="inquiryData.service" readonly />

          <label for="message">Message:</label>
          <textarea v-model="inquiryData.message" required></textarea>

          <button type="submit" class="submit-button">Send Inquiry</button>
          <button @click="showInquiryForm = false" type="button" class="cancel-button">Cancel</button>
        </form>
      </div>

      <!-- Contact Button -->
      <div class="mt-12 max-w-xl mx-auto">
        <button @click="showInquiryForm = true" class="inquiry-button">
          Send Inquiry
        </button>
      </div>

      <!-- Contact Form Modal -->
      <ContactForm v-model="showContactForm" :prefill="prefillData" />
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';

const showInquiryForm = ref(false);
const inquiryData = ref({
  name: '',
  email: '',
  service: '',
  message: ''
});

const openInquiryForm = (service) => {
  inquiryData.value.service = service; // Prefill the service field
  showInquiryForm.value = true;
};

const submitInquiry = () => {
  // Handle form submission logic here
  console.log('Inquiry submitted:', inquiryData.value);
  showInquiryForm.value = false; // Close the form after submission
};
</script>

<style scoped>
.bg-grid-pattern {
  background-image: linear-gradient(
      rgba(255, 255, 255, 0.1) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  background-color: rgba(0, 0, 0, 0.8);
}

.page-title {
  @apply text-3xl sm:text-4xl font-bold text-yellow-300 mb-8;
}

.service-card {
  @apply bg-black/30 backdrop-blur-xl rounded-lg p-6 border-4 border-yellow-300/20 hover:border-yellow-300/40 transition-all;
}

.service-card h2 {
  @apply text-2xl font-bold text-yellow-300 mb-4;
}

.service-content {
  @apply text-white space-y-4;
}

.service-list {
  @apply list-disc list-inside space-y-2 text-gray-200;
}

.service-subtitle {
  @apply font-semibold text-white;
}

.price {
  @apply text-2xl font-bold text-yellow-300;
}

.price-inline {
  @apply text-yellow-300 font-bold;
}

.duration {
  @apply text-gray-300;
}

.inquiry-button {
  @apply w-full py-3 bg-yellow-300 text-black rounded-lg hover:bg-yellow-400 transition-colors font-bold text-lg;
}

.service-title h2 {
  @apply text-yellow-300;
}

.inquiry-form-modal {
  /* Add styles for the modal */
  background: rgba(0, 0, 0, 0.8);
  padding: 20px;
  border-radius: 8px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
  color: white;
}

.inquiry-form-modal input,
.inquiry-form-modal textarea {
  width: 100%;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.submit-button,
.cancel-button {
  margin-top: 10px;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-button {
  background-color: #4caf50; /* Green */
  color: white;
}

.cancel-button {
  background-color: #f44336; /* Red */
  color: white;
}
</style>
