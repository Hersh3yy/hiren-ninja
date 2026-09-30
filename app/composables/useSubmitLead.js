import { track } from '../utils/track'
export function useSubmitLead(endpoint) {
  const isSubmitting = ref(false)
  const statusMessage = ref(null)

  async function submit(payload) {
    isSubmitting.value = true
    statusMessage.value = null

    try {
      const result = await $fetch(endpoint, {
        method: 'POST',
        body: payload,
      })

      statusMessage.value = {
        type: 'success',
        text: 'Thanks, I got your message and will get back to you within two working days.',
      }
      track('lead-submit', { form: endpoint.replace('/api/', ''), ok: true, service: payload?.serviceType })

      return result
    } catch (error) {
      console.error(`Error submitting to ${endpoint}:`, error)
      statusMessage.value = {
        type: 'error',
        text: 'That didn\'t go through. Please try again, or email me at hello@hiren.ninja.',
      }
      track('lead-submit', { form: endpoint.replace('/api/', ''), ok: false, status: error?.statusCode ?? error?.status ?? 0 })
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  function clearStatus() {
    statusMessage.value = null
  }

  return {
    isSubmitting,
    statusMessage,
    submit,
    clearStatus,
  }
}
