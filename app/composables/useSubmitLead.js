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
        text: 'Request submitted successfully! We\'ll be in touch soon.',
      }

      return result
    } catch (error) {
      console.error(`Error submitting to ${endpoint}:`, error)
      statusMessage.value = {
        type: 'error',
        text: 'Failed to submit request. Please try again or contact us directly.',
      }
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
