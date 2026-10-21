// IG carousel for the ADE Planner launch: node shots.cjs <dir> and mapshot.cjs <dir> grab live screenshots, render.cjs <dir> turns slides.html into 1080x1350 PNGs (run from this folder, dir = this folder).
const { chromium } = require(require('path').join(require('os').homedir(), 'Documents/koala/VAMS/node_modules/playwright-core'))
const DIR = process.argv[2]
;(async () => {
  const b = await chromium.launch({ channel: 'chrome' })
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 })
  await p.goto('file://' + DIR + '/slides.html', { waitUntil: 'networkidle' })
  await p.evaluate(() => document.fonts.ready)
  for (const id of ['s1', 's2', 's3']) await p.locator('#' + id).screenshot({ path: `${DIR}/ade-planner-ig-${id.slice(1)}.png` })
  await b.close()
})()
