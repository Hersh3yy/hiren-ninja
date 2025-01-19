<template>
    <Teleport to="body">
        <div v-if="isOpen" class="fixed inset-0 z-50">
            <div class="absolute inset-0 bg-black/70" @click="close"></div>

            <div class="relative min-h-full p-4 flex items-center justify-center">
                <div class="w-full max-w-2xl bg-black/95 rounded-xl p-6 shadow-xl border-4 border-yellow-300/20">
                    <!-- Header -->
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-yellow-300">{{ serviceTitle }}</h2>
                        <button @click="close" class="text-gray-400 hover:text-white">✕</button>
                    </div>

                    <!-- Form -->
                    <form @submit.prevent="handleSubmit" class="space-y-6"
                        :class="{ 'opacity-50 pointer-events-none': isSubmitting }">
                        <div>
                            <label class="block text-gray-200 mb-2">Project Description</label>
                            <textarea v-model="formData.description" rows="3"
                                class="w-full bg-gray-800 text-white rounded p-3 border border-gray-700 focus:border-yellow-300 focus:ring-1 focus:ring-yellow-300"
                                :placeholder="placeholderText" required></textarea>
                        </div>

                        <div>
                            <label class="block text-gray-200 mb-2">{{ timelineLabel }}</label>
                            <select v-model="formData.timeline"
                                class="w-full bg-gray-800 text-white rounded p-3 border border-gray-700 focus:border-yellow-300 focus:ring-1 focus:ring-yellow-300"
                                required>
                                <option value="">Select {{ timelineLabel.toLowerCase() }}</option>
                                <option v-for="option in timelineOptions" :key="option.value" :value="option.value">
                                    {{ option.label }}
                                </option>
                            </select>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-gray-200 mb-2">Full Name</label>
                                <input v-model="formData.name" type="text"
                                    class="w-full bg-gray-800 text-white rounded p-3 border border-gray-700 focus:border-yellow-300 focus:ring-1 focus:ring-yellow-300"
                                    required>
                            </div>
                            <div>
                                <label class="block text-gray-200 mb-2">Email</label>
                                <input v-model="formData.email" type="email"
                                    class="w-full bg-gray-800 text-white rounded p-3 border border-gray-700 focus:border-yellow-300 focus:ring-1 focus:ring-yellow-300"
                                    required>
                            </div>
                        </div>

                        <!-- Status Message -->
                        <div v-if="statusMessage" :class="[
                            'p-3 rounded text-sm',
                            statusMessage.type === 'error' ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'
                        ]">
                            {{ statusMessage.text }}
                        </div>

                        <div class="flex justify-end gap-4">
                            <button type="button" @click="close"
                                class="px-6 py-2 border border-yellow-300 text-yellow-300 rounded hover:bg-yellow-300/10">
                                Cancel
                            </button>
                            <button type="submit"
                                class="px-6 py-2 bg-yellow-300 text-black rounded hover:bg-yellow-400 flex items-center gap-2"
                                :disabled="isSubmitting">
                                <span v-if="isSubmitting"
                                    class="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                                {{ isSubmitting ? 'Sending...' : 'Send Request' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
    isOpen: Boolean,
    serviceType: String
});

const emit = defineEmits(['close', 'submit']);

const isSubmitting = ref(false);
const statusMessage = ref(null);

const serviceTitle = computed(() => {
    const titles = {
        discovery: 'Discovery & Consultation',
        website: 'Website Development',
        application: 'Web Applications',
        maintenance: 'Maintenance & Support'
    };
    return titles[props.serviceType] || 'Service Request';
});

const placeholderText = computed(() => {
    const placeholders = {
        discovery: "Describe your business goals and technical challenges. What specific outcomes would define success for this project?",
        website: "Share your vision for the website, including key features, target audience, and any specific technical requirements.",
        application: "Detail your application needs - whether joining an existing project or starting fresh. Include current pain points and desired functionality.",
        maintenance: "Outline your current system status and specific areas requiring support or improvement."
    };
    return placeholders[props.serviceType] || "Please describe your project requirements";
});

const timelineLabel = computed(() =>
    props.serviceType === 'discovery' ? 'Preferred Meeting Time' : 'Timeline'
);

const timelineOptions = computed(() => {
    if (props.serviceType === 'discovery') {
        return [
            { value: 'morning', label: 'Morning (9AM - 12PM CET)' },
            { value: 'afternoon', label: 'Afternoon (1PM - 5PM CET)' },
            { value: 'evening', label: 'Evening (6PM - 8PM CET)' }
        ];
    }
    return [
        { value: 'urgent', label: 'Urgent (1-2 weeks)' },
        { value: 'soon', label: 'Standard (1-2 months)' },
        { value: 'flexible', label: 'Flexible (2+ months)' }
    ];
});

const formData = ref({
    description: '',
    timeline: '',
    name: '',
    email: '',
    serviceType: props.serviceType
});

watch(() => props.serviceType, (newType) => {
    formData.value.serviceType = newType;
}, { immediate: true });

const handleSubmit = async () => {
    try {
        isSubmitting.value = true;
        statusMessage.value = null;

        const response = await fetch('/.netlify/functions/service-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData.value)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to submit request');
        }

        statusMessage.value = {
            type: 'success',
            text: 'Request submitted successfully! We\'ll be in touch soon.'
        };

        // Close modal after a brief delay to show success message
        setTimeout(() => {
            emit('submit', formData.value);
            close();
        }, 2000);

    } catch (error) {
        console.error('Error submitting form:', error);
        statusMessage.value = {
            type: 'error',
            text: 'Failed to submit request. Please try again or contact us directly.'
        };
    } finally {
        isSubmitting.value = false;
    }
};

const close = () => {
    emit('close');
    formData.value = {
        description: '',
        timeline: '',
        name: '',
        email: '',
        serviceType: props.serviceType
    };
    statusMessage.value = null;
};
</script>