<template>
  <div class="p-4 space-y-4">
    <h3 class="text-lg font-semibold text-content mb-4">LED Sculpture Parameters</h3>

    <div>
      <label class="block text-sm font-medium text-content-muted mb-2" for="lss-loop-length">
        Loop Length: {{ parameters.loopLength }}m
      </label>
      <input
        id="lss-loop-length"
        v-model.number="parameters.loopLength"
        type="range"
        min="10"
        max="50"
        step="1"
        :aria-valuetext="`${parameters.loopLength} meters`"
        class="w-full h-2 bg-elevated rounded-lg appearance-none cursor-pointer"
      >
    </div>

    <div>
      <label class="block text-sm font-medium text-content-muted mb-2" for="lss-bend-count">
        Number of Bends: {{ parameters.bendCount }}
      </label>
      <input
        id="lss-bend-count"
        v-model.number="parameters.bendCount"
        type="range"
        min="3"
        max="16"
        step="1"
        class="w-full h-2 bg-elevated rounded-lg appearance-none cursor-pointer"
      >
    </div>

    <div>
      <label class="block text-sm font-medium text-content-muted mb-2" for="lss-bend-intensity">
        Bend Intensity: {{ parameters.bendIntensity }}
      </label>
      <input
        id="lss-bend-intensity"
        v-model.number="parameters.bendIntensity"
        type="range"
        min="0.1"
        max="3.0"
        step="0.1"
        class="w-full h-2 bg-elevated rounded-lg appearance-none cursor-pointer"
      >
    </div>

    <div>
      <label class="block text-sm font-medium text-content-muted mb-2" for="lss-vertical-complexity">
        Vertical Complexity: {{ parameters.verticalComplexity }}
        <span class="text-xs text-content-muted">(loops & winding)</span>
      </label>
      <input
        id="lss-vertical-complexity"
        v-model.number="parameters.verticalComplexity"
        type="range"
        min="0.1"
        max="3.0"
        step="0.1"
        class="w-full h-2 bg-elevated rounded-lg appearance-none cursor-pointer"
      >
    </div>

    <div>
      <label class="block text-sm font-medium text-content-muted mb-2" for="lss-twist-factor">
        Twist Factor: {{ parameters.twistFactor }}
        <span class="text-xs text-content-muted">(self-intersection)</span>
      </label>
      <input
        id="lss-twist-factor"
        v-model.number="parameters.twistFactor"
        type="range"
        min="0.1"
        max="3.0"
        step="0.1"
        class="w-full h-2 bg-elevated rounded-lg appearance-none cursor-pointer"
      >
    </div>

    <div>
      <label class="block text-sm font-medium text-content-muted mb-2" for="lss-random-seed">
        Variation Seed: {{ parameters.randomSeed }}
      </label>
      <input
        id="lss-random-seed"
        v-model.number="parameters.randomSeed"
        type="range"
        min="1"
        max="9999"
        step="1"
        class="w-full h-2 bg-elevated rounded-lg appearance-none cursor-pointer"
      >
    </div>

    <div>
      <label class="block text-sm font-medium text-content-muted mb-2" for="lss-glow-intensity">
        LED Glow: {{ parameters.glowIntensity }}
      </label>
      <input
        id="lss-glow-intensity"
        v-model.number="parameters.glowIntensity"
        type="range"
        min="0.1"
        max="2.0"
        step="0.1"
        class="w-full h-2 bg-elevated rounded-lg appearance-none cursor-pointer"
      >
    </div>

    <div class="space-y-2 pt-4">
      <button
        type="button"
        class="w-full px-4 py-2 bg-accent text-ink font-medium rounded hover:bg-accent-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        @click="$emit('randomize')"
      >
        Randomize
      </button>
      <button
        type="button"
        class="w-full px-4 py-2 bg-elevated text-content rounded hover:bg-border-default transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        @click="$emit('reset')"
      >
        Reset
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  parameters: {
    type: Object,
    required: true
  }
})

defineEmits(['randomize', 'reset'])
</script>
