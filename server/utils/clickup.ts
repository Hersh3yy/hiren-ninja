import type { ClickUpTaskPayload, ClickUpTaskResponse } from '../types/leads'

const CLICKUP_API_BASE = 'https://api.clickup.com/api/v2'

export async function createClickUpTask(taskData: ClickUpTaskPayload): Promise<ClickUpTaskResponse> {
  const config = useRuntimeConfig()

  if (!config.clickupApiKey || !config.clickupListId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'ClickUp is not configured. Set CLICKUP_API_KEY and CLICKUP_LIST_ID.',
    })
  }

  const response = await fetch(`${CLICKUP_API_BASE}/list/${config.clickupListId}/task`, {
    method: 'POST',
    headers: {
      Authorization: config.clickupApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw createError({
      statusCode: 502,
      statusMessage: `ClickUp API error: ${response.status} - ${errorText}`,
    })
  }

  return response.json() as Promise<ClickUpTaskResponse>
}
