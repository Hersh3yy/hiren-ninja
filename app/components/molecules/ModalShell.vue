<template>
  <!-- Native modal dialog: showModal() puts it in the top layer, makes the rest of the
       page inert, traps focus, closes on Escape (the `cancel` event) and returns focus
       to whatever opened it. No focus-trap code of our own. -->
  <dialog
    ref="dialogRef"
    class="modal-dialog outline-none"
    :class="[bare ? 'modal-dialog--bare' : 'modal-content', panelClass]"
    :aria-labelledby="resolvedTitleId"
    :aria-describedby="describedBy || undefined"
    @cancel.prevent="emit('close')"
    @click="onClick"
  >
    <template v-if="isOpen">
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
    </template>
  </dialog>
</template>

<script setup>
import { computed, onMounted, ref, useId, watch } from 'vue'

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
    default: 'max-w-2xl'
  },
  // No panel chrome (background, border): an image lightbox.
  bare: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const dialogRef = ref(null)
const generatedTitleId = useId()
const resolvedTitleId = computed(() => props.titleId || generatedTitleId)

// The backdrop is part of the <dialog> box for clicks: a click whose target is the
// dialog itself (not its content) landed outside the panel.
function onClick(event) {
  if (event.target === dialogRef.value) emit('close')
}

// flush: 'post' runs after the content has rendered, in the same tick, so a view
// transition that waits on nextTick() sees the dialog open.
function sync(open) {
  const dialog = dialogRef.value
  if (!dialog) return
  if (open && !dialog.open) {
    dialog.showModal()
  } else if (!open && dialog.open) {
    dialog.close()
  }
}

watch(() => props.isOpen, sync, { flush: 'post' })
onMounted(() => sync(props.isOpen))

defineExpose({
  dialogRef,
  titleId: resolvedTitleId
})
</script>
