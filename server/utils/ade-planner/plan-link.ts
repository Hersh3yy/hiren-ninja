// A shared plan lives in the link, not in a database: each event id (a UUID) packed into
// 22 URL-safe base64 characters, back to back. Ten events make a ~220 character link.
const CODE_LENGTH = 22
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const MAX_SHARED_EVENTS = 60

function uuidToCode(id: string): string {
  const hex = id.replace(/-/g, '')
  const bytes = String.fromCharCode(...Array.from({ length: 16 }, (_, i) => Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16)))
  return btoa(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function codeToUuid(code: string): string {
  const hex = Array.from(atob(code.replace(/-/g, '+').replace(/_/g, '/')), char => char.charCodeAt(0).toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

/** Saved event ids -> the `plan` query value. Ids that aren't UUIDs are left out. */
export function encodePlan(ids: string[]): string {
  return [...new Set(ids)].filter(id => UUID.test(id)).slice(0, MAX_SHARED_EVENTS).map(uuidToCode).join('')
}

/** The `plan` query value -> event ids; anything malformed is dropped, never thrown. */
export function decodePlan(plan: string): string[] {
  if (!/^[A-Za-z0-9_-]*$/.test(plan)) return []
  const ids: string[] = []
  for (let at = 0; at + CODE_LENGTH <= plan.length && ids.length < MAX_SHARED_EVENTS; at += CODE_LENGTH) {
    ids.push(codeToUuid(plan.slice(at, at + CODE_LENGTH)))
  }
  return [...new Set(ids)]
}
