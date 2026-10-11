// "My ADE timetable" as a 1080x1920 story image (Instagram, WhatsApp status): five day
// columns like a school timetable, each saved event as a block in order. Drawn on a
// canvas in the planner's own yellow-on-black, with the link at the bottom.

const W = 1080
const H = 1920
const INK = '#0d0d0d'
const SURFACE = '#1c1c1c'
const YELLOW = '#ffff07'
const TEXT = '#f4f4f5'
const MUTED = '#a1a1aa'
const FONT = '"Inter Tight", "Helvetica Neue", Arial, sans-serif'

function wrap(ctx, text, maxWidth, maxLines) {
  const words = String(text).split(/\s+/)
  const lines = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width <= maxWidth) {
      line = next
    } else {
      if (line) lines.push(line)
      line = word
      if (lines.length === maxLines) break
    }
  }
  if (lines.length < maxLines && line) lines.push(line)
  if (lines.length === maxLines && words.join(' ') !== lines.join(' ')) {
    let last = lines[maxLines - 1]
    while (ctx.measureText(`${last}…`).width > maxWidth && last.length > 1) last = last.slice(0, -1)
    lines[maxLines - 1] = `${last}…`
  }
  return lines
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ label: string, items: { time: string, title: string, venue: string, party: boolean }[] }[]} days
 */
export function drawPlanStory(canvas, days) {
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = INK
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = YELLOW
  ctx.font = `700 34px ${FONT}`
  ctx.fillText('ADE 2026 · 21-25 OCTOBER', 64, 120)
  ctx.font = `800 104px ${FONT}`
  ctx.fillText('MY ADE', 64, 230)
  ctx.fillStyle = TEXT
  ctx.fillText('TIMETABLE', 64, 330)

  const top = 400
  const bottom = H - 190
  const gap = 12
  const colW = (W - 128 - gap * (days.length - 1)) / days.length
  days.forEach((day, i) => {
    const x = 64 + i * (colW + gap)
    ctx.fillStyle = YELLOW
    ctx.font = `800 34px ${FONT}`
    ctx.fillText(day.label.toUpperCase(), x, top)

    const shown = day.items.slice(0, 6)
    const blockH = shown.length ? Math.min(230, (bottom - top - 30 - gap * (shown.length - 1)) / shown.length) : 0
    shown.forEach((item, j) => {
      const y = top + 30 + j * (blockH + gap)
      ctx.fillStyle = SURFACE
      ctx.fillRect(x, y, colW, blockH)
      ctx.fillStyle = item.party ? YELLOW : MUTED
      ctx.fillRect(x, y, 6, blockH)
      ctx.fillStyle = YELLOW
      ctx.font = `700 26px ${FONT}`
      ctx.fillText(item.time, x + 18, y + 40)
      ctx.fillStyle = TEXT
      ctx.font = `700 25px ${FONT}`
      const lines = wrap(ctx, item.title, colW - 28, Math.max(1, Math.floor((blockH - 90) / 30)))
      lines.forEach((line, k) => ctx.fillText(line, x + 18, y + 76 + k * 30))
      ctx.fillStyle = MUTED
      ctx.font = `400 21px ${FONT}`
      ctx.fillText(wrap(ctx, item.venue || '', colW - 28, 1)[0] ?? '', x + 18, y + blockH - 18)
    })
    if (day.items.length > shown.length) {
      ctx.fillStyle = MUTED
      ctx.font = `400 22px ${FONT}`
      ctx.fillText(`+${day.items.length - shown.length} more`, x, bottom + 4)
    }
    if (!day.items.length) {
      ctx.fillStyle = MUTED
      ctx.font = `400 26px ${FONT}`
      ctx.fillText('Free day', x, top + 70)
    }
  })

  ctx.fillStyle = YELLOW
  ctx.fillRect(64, H - 150, W - 128, 4)
  ctx.fillStyle = TEXT
  ctx.font = `700 40px ${FONT}`
  ctx.fillText('Plan yours from your playlist', 64, H - 90)
  ctx.fillStyle = YELLOW
  ctx.font = `800 44px ${FONT}`
  ctx.fillText('hiren.ninja/ade-planner', 64, H - 36)
}

/** Share the image where the device can (phone share sheet), otherwise download it. */
export async function shareCanvas(canvas, filename) {
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
  const file = new File([blob], filename, { type: 'image/png' })
  // Phones get the share sheet (straight into a story); computers just download it.
  const touch = window.matchMedia?.('(pointer: coarse)').matches
  if (touch && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'My ADE timetable' })
      return 'shared'
    } catch {
      // Cancelled: fall through to a download.
    }
  }
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(link.href), 1000)
  return 'downloaded'
}
