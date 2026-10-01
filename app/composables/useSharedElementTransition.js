/**
 * Card image -> dialog hero (and back) with the View Transitions API: the browser
 * snapshots the page before and after `update`, and morphs the one element that carries
 * the same view-transition-name in both. No cloned <img>, and it works with <dialog>
 * in the top layer. Without support or with reduced motion it just runs the update.
 */
const NAME = 'project-hero'

function canAnimate() {
  return typeof document !== 'undefined'
    && typeof document.startViewTransition === 'function'
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useSharedElementTransition() {
  /**
   * @param {Element|null} fromEl   element shown now (card cover or dialog hero)
   * @param {() => Promise<void>} update  state change, resolves once the DOM is updated
   * @param {() => Element|null} getToEl  the matching element after the update
   */
  async function morph(fromEl, update, getToEl) {
    if (!fromEl || !canAnimate()) {
      await update()
      return
    }

    fromEl.style.viewTransitionName = NAME
    let toEl = null
    const transition = document.startViewTransition(async () => {
      fromEl.style.viewTransitionName = ''
      await update()
      toEl = getToEl()
      if (toEl) toEl.style.viewTransitionName = NAME
    })

    try {
      await transition.finished
    } catch {
      // Skipped (e.g. tab hidden): the update itself has still run.
    } finally {
      if (toEl) toEl.style.viewTransitionName = ''
    }
  }

  return { morph }
}
