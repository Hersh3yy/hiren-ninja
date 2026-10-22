// Gemini Flash over plain REST. The key lives in runtime config (GEMINI_API_KEY), never
// in the browser. Every failure (no key, busy model, bad JSON, deadline) returns null so
// the caller falls back to rules: the planner never shows an error because Gemini is down.

export const isGeminiConfigured = (): boolean => Boolean(useRuntimeConfig().geminiApiKey)

/** Ask for JSON and parse it; one retry on a busy model if the deadline allows. */
export async function askGemini<T>(prompt: string, deadline: number): Promise<T | null> {
  const { geminiApiKey, geminiModel } = useRuntimeConfig()
  if (!geminiApiKey) return null

  for (let attempt = 0; attempt < 2; attempt++) {
    const left = deadline - Date.now()
    if (left < 1_500) return null
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': geminiApiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          // 3.8 Flash thinks by default (9 s+ for a one-line answer); 'minimal' isn't offered for it.
          generationConfig: { responseMimeType: 'application/json', temperature: 0.2, thinkingConfig: { thinkingLevel: 'low' } },
        }),
        signal: AbortSignal.timeout(left),
      })
      if (response.status === 503 || response.status === 429) continue
      if (!response.ok) {
        console.warn(`[ade-planner] Gemini ${response.status}`)
        return null
      }
      const body = await response.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
      const text = body.candidates?.[0]?.content?.parts?.map(part => part.text ?? '').join('') ?? ''
      return JSON.parse(text) as T
    } catch (error) {
      console.warn('[ade-planner] Gemini failed:', (error as Error).message)
      return null
    }
  }
  return null
}
