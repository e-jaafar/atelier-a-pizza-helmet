import { chromium } from 'playwright'

const url = process.env.QA_URL || 'http://127.0.0.1:5173/'
const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
})

const results = {}
const errors = []

for (const setup of [
  { name: 'desktop', viewport: { width: 1440, height: 1000 }, isMobile: false },
  { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true },
]) {
  const context = await browser.newContext({ viewport: setup.viewport, isMobile: setup.isMobile, hasTouch: setup.isMobile })
  const page = await context.newPage()
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`${setup.name}: console: ${message.text()}`) })
  page.on('pageerror', (error) => errors.push(`${setup.name}: page: ${error.message}`))
  await page.goto(url, { waitUntil: 'networkidle' })

  const metrics = await page.evaluate(() => ({
    title: document.title,
    lang: document.documentElement.lang,
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    heroHeight: Math.round(document.querySelector('.hero').getBoundingClientRect().height),
    viewportHeight: window.innerHeight,
    h1: document.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim(),
    buttons: [...document.querySelectorAll('a.button')].map((a) => ({ text: a.textContent.trim(), href: a.href })),
    sectionIds: [...document.querySelectorAll('section[id]')].map((s) => s.id),
  }))

  if (setup.isMobile) {
    await page.getByRole('button', { name: /ouvrir le menu/i }).click()
    const menuVisible = await page.locator('#mobile-nav').isVisible()
    const bodyLocked = await page.evaluate(() => document.body.style.overflow === 'hidden')
    await page.waitForTimeout(350)
    await page.screenshot({ path: '/tmp/atelier-mobile-nav-pw.png', fullPage: false })
    await page.getByRole('button', { name: /ouvrir le menu/i }).click()
    const menuClosed = await page.locator('#mobile-nav').count() === 0
    Object.assign(metrics, { menuVisible, bodyLocked, menuClosed })
  }

  await page.screenshot({ path: `/tmp/atelier-${setup.name}-pw.png`, fullPage: false })
  await page.locator('#menu').scrollIntoViewIfNeeded()
  await page.waitForTimeout(850)
  await page.screenshot({ path: `/tmp/atelier-${setup.name}-menu-pw.png`, fullPage: false })
  for (const selector of ['#atelier', '#infos', '.final-cta']) {
    await page.locator(selector).scrollIntoViewIfNeeded()
    await page.waitForTimeout(350)
  }
  await page.screenshot({ path: `/tmp/atelier-${setup.name}-full-pw.png`, fullPage: true })
  results[setup.name] = metrics
  await context.close()
}

await browser.close()
console.log(JSON.stringify({ results, errors }, null, 2))

if (errors.length || Object.values(results).some((result) => result.scrollWidth !== result.innerWidth)) process.exitCode = 1
