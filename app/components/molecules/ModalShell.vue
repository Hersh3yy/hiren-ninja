<template>
  <Teleport to="body">
    <Transition :name="transitionName">
      <div
        v-if="isOpen"
        class="modal-container"
        :class="overlayClass"
        @click.self="emit('close')"
      >
        <div
          ref="dialogRef"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="resolvedTitleId"
          :aria-describedby="describedBy || undefined"
          tabindex="-1"
          class="modal-content outline-none"
          :class="panelClass"
        >
          <slot
            name="header"
            :title-id="resolvedTitleId"
            :close="() => emit('close')"
          >
            <div class="flex justify-between items-center gap-4 mb-6">
              <AtomsHeading
                v-if="title"
                :id="resolvedTitleId"
                :text="title"
                :level="2"
                size="lg"
                class="pr-4"
              />
              <span v-else :id="resolvedTitleId" class="sr-only">{{ closeLabel }}</span>
              <AtomsModalCloseButton :label="closeLabel" @click="emit('close')" />
            </div>
          </slot>

          <slot :title-id="resolvedTitleId" :close="() => emit('close')" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref, useId, toRef } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  titleId: {
    type: String,
    default: ''
  },
  describedBy: {
    type: String,
    default: ''
  },
  closeLabel: {
    type: String,
    default: 'Close dialog'
  },
  panelClass: {
    type: String,
    default: 'w-full max-w-2xl'
  },
  overlayClass: {
    type: String,
    default: ''
  },
  transitionName: {
    type: String,
    default: 'project-modal'
  }
})

const emit = defineEmits(['close'])

const dialogRef = ref(null)
const generatedTitleId = useId()
const resolvedTitleId = computed(() => props.titleId || generatedTitleId)

useModalA11y({
  isOpen: toRef(props, 'isOpen'),
  onClose: () => emit('close'),
  containerRef: dialogRef
})

defineExpose({
  dialogRef,
  titleId: resolvedTitleId
})
</script>
