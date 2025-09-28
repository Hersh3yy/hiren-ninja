<template>
  <div class="space-y-4">
    <!-- Experiment Layout -->
    <div class="flex flex-col xl:flex-row gap-6">
      <!-- Parameter Panel - Mobile: full width, Desktop: fixed width -->
      <div class="w-full xl:w-96 xl:flex-shrink-0">
        <LSSParameterPanel 
          :parameters="parameters"
          @randomize="randomizeParameters"
          @reset="resetParameters"
        />
      </div>
      
      <!-- 3D Viewer - maintains aspect ratio -->
      <div class="flex-1 min-w-0">
        <div class="aspect-[4/3] w-full max-w-full min-h-[500px]">
          <LSSViewer 
            :curve-data="curveData"
            :parameters="parameters"
            :loading="loading"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLEDSculpture } from '~/composables/experiments/useLEDSculpture.js'

// Use the composable
const { 
  parameters, 
  curveData, 
  loading,
  randomizeParameters,
  resetParameters
} = useLEDSculpture()
</script>
