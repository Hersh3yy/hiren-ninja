<template>
    <div
        class="bg-black/30 backdrop-blur-xl rounded-lg p-6 border-4 border-yellow-300/20 hover:border-yellow-300/40 transition-all h-full flex flex-col">
        <div class="mb-4">
            <h2 class="text-2xl font-bold text-yellow-300">{{ title }}</h2>
            <p class="text-gray-200 mt-2">{{ description }}</p>
        </div>
        <div class="flex-grow">
            <ul class="list-disc list-inside space-y-2 text-gray-200">
                <li v-for="feature in features" :key="feature">{{ feature }}</li>
            </ul>
        </div>
        <button @click="$emit('start')"
        :data-umami-event="`Service clicked ${title}`"
            class="w-full mt-6 py-3 bg-yellow-300 text-black rounded-lg hover:bg-yellow-400 transition-colors font-bold">
            Get Started
        </button>
    </div>
</template>

<script setup>
defineProps({
    title: String,
    description: String,
    features: Array
});
defineEmits(['start']);
</script>