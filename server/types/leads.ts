export interface ServiceRequestPayload {
  name: string
  email: string
  serviceType: string
  timeline: string
  description: string
}

export interface ContactPayload {
  name: string
  email: string
  message: string
}

export interface ClickUpTaskPayload {
  name: string
  /** ClickUp renders this as markdown; plain `description` shows the raw ### and ** */
  markdown_description: string
  status: string
  tags: string[]
  priority?: number
  notify_all?: boolean
}

export interface ClickUpTaskResponse {
  id: string
}
