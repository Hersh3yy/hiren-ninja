import { watch, nextTick, onBeforeUnmount, unref } from 'vue'

/**
 * Dialog accessibility: focus trap, Escape, scroll lock, focus restore.
 * Pass a template ref to the dialog root (or a focusable child as initialFocus).
 */
export function useModalA11y({ isOpen, onClose, containerRef, initialFocusRef }) {
  let previousActiveElement = null
  let previousOverflow = ''

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

  function lockScroll() {
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }

  function unlockScroll() {
    document.body.style.overflow = previousOverflow
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
    lockScroll()
    document.addEventListener('keydown', onKeydown)
    await nextTick()
    focusInitial()
  }

  function deactivate() {
    document.removeEventListener('keydown', onKeydown)
    unlockScroll()
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
    if (unref(isOpen)) {
      unlockScroll()
    }
  })

  return {
    getFocusableElements
  }
}
