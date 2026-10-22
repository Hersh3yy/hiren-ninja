// 6-second Instagram story (1080x1920, 3 slides x 2 s) for the Find events box.
/* eslint-disable no-console -- a terminal tool */
//   node scripts/ig/story.cjs <out-dir>
// Screenshots the live planner on a phone-sized page, draws the slides on a canvas in
// the site's colours and fonts, and records them in Chrome (MediaRecorder, H.264 MP4),
// so no ffmpeg is needed. Also writes each slide as a PNG.
const path = require('path')
const fs = require('fs')
const { chromium } = require(path.join(require('os').homedir(), 'Code/VAMS/node_modules/playwright-core'))

const OUT = path.resolve(process.argv[2] || 'story-out')
const PROMPT = 'Demos in West tomorrow, techno tonight from 8pm'
fs.mkdirSync(OUT, { recursive: true })

async function shots(browser) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true })
  // Staged clicks must not count as real stars or feature use in VAMS.
  await ctx.route(/\/api\/ade-planner\/(favorite|usage|event-action)/, route => route.fulfill({ status: 200, body: '{"ok":true}' }))
  const page = await ctx.newPage()
  await page.goto('https://hiren.ninja/ade-planner', { waitUntil: 'networkidle' })
  // The sticky site header would sit over every scrolled shot.
  await page.addStyleTag({ content: 'header{position:static!important} nuxt-devtools-frame{display:none!important}' })
  const scrollTo = selector => page.evaluate(sel => {
    const el = typeof sel === 'string' ? document.querySelector(sel) : null
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 28)
  }, selector)
  const box = page.locator('#ade-ask-prompt')
  await scrollTo('#ade-ask-heading')
  await box.click()
  await box.pressSequentially(PROMPT, { delay: 15 })
  await box.blur()
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(OUT, 'shot-1-ask.png') })

  await page.getByRole('button', { name: 'Find events', exact: true }).click()
  const groups = page.locator('section[aria-labelledby=ade-ask-heading] h3')
  await page.locator('section[aria-labelledby=ade-ask-heading] article').first().waitFor({ timeout: 20000 })
  await page.waitForTimeout(800)
  await page.evaluate(() => {
    const first = document.querySelector('section[aria-labelledby=ade-ask-heading] h3')
    window.scrollTo(0, first.getBoundingClientRect().top + window.scrollY - 28)
  })
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(OUT, 'shot-2-results.png') })

  // Step 3: the second search (tonight), with its first event starred.
  const last = (await groups.count()) - 1
  await page.evaluate(n => {
    const heading = document.querySelectorAll('section[aria-labelledby=ade-ask-heading] h3')[n]
    window.scrollTo(0, heading.getBoundingClientRect().top + window.scrollY - 28)
  }, last)
  const star = groups.nth(last).locator('xpath=../..').locator('article button[aria-label^="Add"]').first()
  await star.click()
  await page.waitForTimeout(600)
  await page.screenshot({ path: path.join(OUT, 'shot-3-star.png') })
  await ctx.close()
}

const html = (s1, s2, s3) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Sixtyfour&family=Inter:wght@400;600;800;900&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
</head><body style="margin:0;background:#000"><canvas id="c" width="1080" height="1920"></canvas>
<img id="s1" src="${s1}" hidden><img id="s2" src="${s2}" hidden><img id="s3" src="${s3}" hidden>
<script>
const W = 1080, H = 1920, SLIDE = 2000, FADE = 280
const INK = '#0d0d0d', ACCENT = '#ffff07', TEXT = '#f4f4f5', MUTED = '#a1a1aa', EDGE = '#27272a'
const c = document.getElementById('c'), g = c.getContext('2d')
const ease = t => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3)

function grid() {
  g.fillStyle = INK; g.fillRect(0, 0, W, H)
  g.strokeStyle = 'rgba(255,255,7,0.05)'; g.lineWidth = 1
  for (let x = 0; x <= W; x += 54) { g.beginPath(); g.moveTo(x + .5, 0); g.lineTo(x + .5, H); g.stroke() }
  for (let y = 0; y <= H; y += 54) { g.beginPath(); g.moveTo(0, y + .5); g.lineTo(W, y + .5); g.stroke() }
}
function lines(list, x, y, size, lead, colors, weight = 900) {
  g.font = weight + ' ' + size + 'px Inter'
  list.forEach((line, i) => { g.fillStyle = colors[i] || TEXT; g.fillText(line, x, y + i * lead) })
}
function eyebrow(text, y) { g.font = '700 32px "JetBrains Mono"'; g.fillStyle = ACCENT; g.fillText(text, 90, y) }
// Bottom ~250px is under Instagram's reply bar: the footer sits just above it.
function footer() {
  g.font = '800 44px Inter'; g.fillStyle = TEXT; g.fillText('hiren.ninja/ade-planner', 90, H - 290)
  g.font = '30px Sixtyfour'; g.fillStyle = ACCENT
  const brand = 'HIREN DEVS'; g.fillText(brand, W - 90 - g.measureText(brand).width, H - 292)
}
function phone(img, t, cropTop) {
  const pw = 600, ph = 940, px = (W - pw) / 2, py = 600 - (1 - ease(t * 2)) * 50
  g.save()
  g.shadowColor = 'rgba(255,255,7,0.22)'; g.shadowBlur = 90
  g.fillStyle = EDGE; roundRect(px - 16, py - 16, pw + 32, ph + 32, 74); g.fill()
  g.restore()
  g.save(); roundRect(px, py, pw, ph, 60); g.clip()
  const scale = pw / img.naturalWidth
  const zoom = 1 + 0.04 * ease(t)
  g.drawImage(img, 0, cropTop, img.naturalWidth, ph / scale / zoom, px, py, pw, ph)
  g.restore()
}
function roundRect(x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r)
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath()
}

// Three steps; the story UI covers ~250px top and bottom, so copy starts at 290.
function step(n, title, accent) {
  eyebrow('ADE 2026 · SEARCH WITH AI', 300)
  g.font = '900 150px Inter'; g.fillStyle = ACCENT; g.fillText(String(n), 82, 490)
  lines([title, accent], 210, 420, 64, 76, [TEXT, ACCENT], 900)
  // Progress: three bars, the current one lit.
  for (let i = 0; i < 3; i++) { g.fillStyle = i < n ? ACCENT : EDGE; g.fillRect(90 + i * 304, 540, 290, 8) }
}
const slides = [
  t => { grid(); step(1, 'Type what', 'you want.'); phone(document.getElementById('s1'), t, 0); footer() },
  t => { grid(); step(2, 'AI splits it', 'into a short list.'); phone(document.getElementById('s2'), t, 0); footer() },
  t => { grid(); step(3, 'Star it.', 'Go dance.'); phone(document.getElementById('s3'), t, 0); footer() },
]

function frame(ms) {
  const i = Math.min(Math.floor(ms / SLIDE), slides.length - 1)
  const t = (ms - i * SLIDE) / SLIDE
  slides[i](t)
  // Crossfade into the next slide over its first FADE ms.
  const into = ms - (i * SLIDE)
  if (i > 0 && into < FADE) {
    const snapshot = g.getImageData(0, 0, W, H)
    slides[i - 1](1)
    const previous = g.getImageData(0, 0, W, H)
    g.putImageData(snapshot, 0, 0)
    g.globalAlpha = 1 - into / FADE
    const tmp = new OffscreenCanvas(W, H); tmp.getContext('2d').putImageData(previous, 0, 0)
    g.drawImage(tmp, 0, 0); g.globalAlpha = 1
  }
}

window.still = (i) => { slides[i](0.9); return c.toDataURL('image/png') }

window.record = async () => {
  const type = ['video/mp4;codecs=avc1.640028', 'video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9'].find(t => MediaRecorder.isTypeSupported(t))
  const stream = c.captureStream(30)
  const rec = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 14_000_000 })
  const chunks = []
  rec.ondataavailable = e => e.data.size && chunks.push(e.data)
  const done = new Promise(r => { rec.onstop = r })
  frame(0); rec.start()
  const start = performance.now()
  await new Promise(resolve => {
    const tick = () => {
      const ms = performance.now() - start
      frame(Math.min(ms, 5999))
      if (ms < 6000) requestAnimationFrame(tick); else resolve()
    }
    requestAnimationFrame(tick)
  })
  rec.stop(); await done
  const blob = new Blob(chunks, { type })
  const buf = new Uint8Array(await blob.arrayBuffer())
  let bin = ''; for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000))
  return { type, data: btoa(bin) }
}
</script></body></html>`

;(async () => {
  const browser = await chromium.launch({ channel: 'chrome' })
  await shots(browser)
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } })
  const dataUrl = file => 'data:image/png;base64,' + fs.readFileSync(path.join(OUT, file)).toString('base64')
  await page.setContent(html(dataUrl('shot-1-ask.png'), dataUrl('shot-2-results.png'), dataUrl('shot-3-star.png')), { waitUntil: 'networkidle' })
  await page.evaluate(async () => {
    await Promise.all(['900 150px Inter', '800 44px Inter', '700 32px "JetBrains Mono"', '30px Sixtyfour'].map(f => document.fonts.load(f)))
    await Promise.all([...document.images].map(img => img.decode()))
  })
  for (const i of [0, 1, 2]) {
    const png = await page.evaluate(n => window.still(n), i)
    fs.writeFileSync(path.join(OUT, `slide-${i + 1}.png`), Buffer.from(png.split(',')[1], 'base64'))
  }
  const { type, data } = await page.evaluate(() => window.record())
  const file = path.join(OUT, type.includes('mp4') ? 'ade-story.mp4' : 'ade-story.webm')
  fs.writeFileSync(file, Buffer.from(data, 'base64'))
  console.log(type, file)
  await browser.close()
})()
