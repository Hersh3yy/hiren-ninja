// Tell Bing (and other IndexNow engines; Google doesn't use it) about the ADE Planner
// pages right away instead of waiting for a crawl. Run after a deploy:
//   node scripts/indexnow.mjs
// The key file public/d92045225aeda48d6b8303a4e5edb30b.txt proves we own hiren.ninja.
const KEY = 'd92045225aeda48d6b8303a4e5edb30b'
const SITE = 'https://hiren.ninja'

const pages = await (await fetch(`${SITE}/api/__sitemap__/ade-planner`)).json()
const urlList = [`${SITE}/`, `${SITE}/ade-planner`, ...pages.map(page => SITE + page.loc)]
for (let i = 0; i < urlList.length; i += 10000) {
  const response = await fetch('https://www.bing.com/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: 'hiren.ninja', key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: urlList.slice(i, i + 10000) }),
  })
  console.log(`IndexNow: ${Math.min(i + 10000, urlList.length)} of ${urlList.length} URLs, HTTP ${response.status}`)
}
