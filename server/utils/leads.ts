import type { ClickUpTaskPayload, ContactPayload, ServiceRequestPayload } from '../types/leads'

const SERVICE_TAGS: Record<string, string[]> = {
  website: ['Lead', 'Website'],
  ai: ['Lead', 'AI'],
  automation: ['Lead', 'Automation'],
  backend: ['Lead', 'Backend'],
}

const TIMELINE_PRIORITY: Record<string, number> = {
  urgent: 1,
  soon: 2,
  flexible: 3,
}

function requireFields(
  payload: Record<string, unknown>,
  fields: string[],
): void {
  for (const field of fields) {
    const value = payload[field]
    if (typeof value !== 'string' || value.trim() === '') {
      throw createError({
        statusCode: 400,
        statusMessage: `Missing required field: ${field}`,
      })
    }
  }
}

export function parseServiceRequest(body: unknown): ServiceRequestPayload {
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid request body' })
  }

  const payload = body as Record<string, unknown>
  requireFields(payload, ['name', 'email', 'serviceType', 'timeline', 'description'])

  return {
    name: String(payload.name).trim(),
    email: String(payload.email).trim(),
    serviceType: String(payload.serviceType).trim(),
    timeline: String(payload.timeline).trim(),
    description: String(payload.description).trim(),
  }
}

export function parseContactRequest(body: unknown): ContactPayload {
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid request body' })
  }

  const payload = body as Record<string, unknown>
  requireFields(payload, ['name', 'email', 'message'])

  return {
    name: String(payload.name).trim(),
    email: String(payload.email).trim(),
    message: String(payload.message).trim(),
  }
}

export function buildServiceRequestTask(data: ServiceRequestPayload): ClickUpTaskPayload {
  const description = `
### Contact Details
- **Name:** ${data.name}
- **Email:** ${data.email}

### Service Request Details
- **Service Type:** ${data.serviceType}
- **Timeline:** ${data.timeline}

### Project Description
${data.description}

---
*Submitted via website service form*
  `.trim()

  return {
    name: `[${data.serviceType.toUpperCase()}] ${data.name} - New Lead`,
    markdown_description: description,
    status: 'NEW',
    tags: SERVICE_TAGS[data.serviceType] ?? ['Lead'],
    priority: TIMELINE_PRIORITY[data.timeline] ?? 3,
    notify_all: true,
  }
}

export function buildContactTask(data: ContactPayload): ClickUpTaskPayload {
  const description = `
### Contact Details
- **Name:** ${data.name}
- **Email:** ${data.email}

### Message
${data.message}

---
*Submitted via website contact form*
  `.trim()

  return {
    name: `[CONTACT] ${data.name} - New Lead`,
    markdown_description: description,
    status: 'NEW',
    tags: ['Lead', 'Contact'],
    priority: 3,
    notify_all: true,
  }
}
