import { watch, nextTick, onBeforeUnmount, unref } from 'vue'

/** Stack so only the topmost dialog handles Escape / Tab. */
const modalStack = []

function setBackgroundInert(inert) {
  if (typeof document === 'undefined') return

  const targets = [
    document.querySelector('header'),
    document.getElementById('main-content'),
    document.querySelector('footer')
  ].filter(Boolean)

  for (const el of targets) {
    if (inert) {
      el.setAttribute('inert', '')
      el.setAttribute('aria-hidden', 'true')
    } else {
      el.removeAttribute('inert')
      el.removeAttribute('aria-hidden')
    }
  }
}

function lockBodyScroll() {
  if (modalStack.length === 1) {
    document.body.dataset.modalPrevOverflow = document.body.style.overflow || ''
    document.body.style.overflow = 'hidden'
    setBackgroundInert(true)
  }
}

function unlockBodyScroll() {
  if (modalStack.length === 0) {
    document.body.style.overflow = document.body.dataset.modalPrevOverflow || ''
    delete document.body.dataset.modalPrevOverflow
    setBackgroundInert(false)
  }
}

/**
 * Dialog accessibility: focus trap, Escape, scroll lock, focus restore, inert backdrop.
 * Supports stacked modals (e.g. lightbox over project dialog).
 */
export function useModalA11y({ isOpen, onClose, containerRef, initialFocusRef }) {
  const instanceId = Symbol('modal')
  let previousActiveElement = null

  function getFocusableElements(container) {
    if (!container) return []

    const selector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ')

    return [...container.querySelectorAll(selector)].filter(
      (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true'
    )
  }

  function focusInitial() {
    const container = unref(containerRef)
    const preferred = unref(initialFocusRef)
    if (preferred && typeof preferred.focus === 'function') {
      preferred.focus()
      return
    }

    const focusable = getFocusableElements(container)
    if (focusable.length > 0) {
      focusable[0].focus()
      return
    }

    container?.focus?.()
  }

  function onKeydown(event) {
    if (!unref(isOpen)) return
    if (modalStack[modalStack.length - 1] !== instanceId) return

    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }

    if (event.key !== 'Tab') return

    const container = unref(containerRef)
    const focusable = getFocusableElements(container)
    if (focusable.length === 0) {
      event.preventDefault()
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement

    if (event.shiftKey && active === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  async function activate() {
    previousActiveElement = document.activeElement
    if (!modalStack.includes(instanceId)) {
      modalStack.push(instanceId)
    }
    lockBodyScroll()
    document.addEventListener('keydown', onKeydown)
    await nextTick()
    focusInitial()
  }

  function deactivate() {
    document.removeEventListener('keydown', onKeydown)
    const index = modalStack.indexOf(instanceId)
    if (index >= 0) {
      modalStack.splice(index, 1)
    }
    unlockBodyScroll()
    if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
      previousActiveElement.focus()
    }
    previousActiveElement = null
  }

  watch(
    () => unref(isOpen),
    (open) => {
      if (import.meta.server) return
      if (open) {
        activate()
      } else {
        deactivate()
      }
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKeydown)
    const index = modalStack.indexOf(instanceId)
    if (index >= 0) {
      modalStack.splice(index, 1)
      unlockBodyScroll()
    }
  })

  return {
    getFocusableElements
  }
}
