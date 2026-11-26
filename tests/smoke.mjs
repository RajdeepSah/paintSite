// Automated browser checks for the Northlight website.
// Run with: npm test   (needs Playwright: npm i -D playwright && npx playwright install chromium)
// Screenshots are saved to tests/output/.
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { startServer } from '../scripts/serve.mjs';

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('Playwright is not installed. Run: npm i -D playwright && npx playwright install chromium');
  process.exit(1);
}

const OUT = fileURLToPath(new URL('./output/', import.meta.url));
const PORT = 8765;
const URL_ROOT = `http://localhost:${PORT}/`;
await mkdir(OUT, { recursive: true });

const results = [];
async function check(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`  ✓ ${name}`);
  } catch (err) {
    results.push({ name, ok: false, err });
    console.log(`  ✗ ${name}\n      ${err.message}`);
  }
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }

/* ---------- helpers that run inside the page ---------- */
async function openPage(browser, opts, label) {
  const context = await browser.newContext(opts);
  const page = await context.newPage();
  const problems = [];
  page.on('console', (m) => { if (m.type() === 'error') problems.push(`console: ${m.text()}`); });
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => problems.push(`request failed: ${r.url()}`));
  page.on('response', (r) => { if (r.status() >= 400) problems.push(`HTTP ${r.status()}: ${r.url()}`); });
  await page.goto(URL_ROOT, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2400); // intro animation
  page.problems = problems;
  page.label = label;
  return { context, page };
}

async function scrollToHero(page, p) {
  await page.evaluate((p) => {
    const hero = document.querySelector('[data-hero]');
    const distance = hero.offsetHeight - hero.querySelector('.hero__sticky').clientHeight;
    window.scrollTo({ top: Math.round(distance * p), behavior: 'instant' });
  }, p);
  // wait for the eased animation to settle on the new position
  await page.waitForFunction((p) => {
    const v = parseFloat(getComputedStyle(document.querySelector('[data-hero]')).getPropertyValue('--progress'));
    return Math.abs(v - p) < 0.003;
  }, p, { timeout: 5000 });
  await page.waitForTimeout(150);
}

async function heroState(page) {
  return page.evaluate(() => {
    const hero = document.querySelector('[data-hero]');
    const H = hero.querySelector('.hero__sticky').clientHeight;
    const paint = hero.querySelector('[data-paint]').getBoundingClientRect();
    const slides = [...hero.querySelectorAll('[data-slide]')].map((s) => parseFloat(getComputedStyle(s).opacity));
    const roller = hero.querySelector('[data-roller]').getBoundingClientRect();
    return { H, painted: Math.max(0, paint.bottom), slides, phase: hero.dataset.phase, rollerTop: roller.top };
  });
}

async function scrollThrough(page) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 350) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y);
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(1200);
}

/* ---------- test run ---------- */
const server = await startServer(PORT);
const browser = await chromium.launch();

try {
  /* ===== Desktop ===== */
  console.log('\nDesktop 1440×900');
  {
    const { context, page } = await openPage(browser, { viewport: { width: 1440, height: 900 } }, 'desktop');

    await check('fonts are loaded (Newsreader + Inter)', async () => {
      const ok = await page.evaluate(() => document.fonts.check('300 40px Newsreader') && document.fonts.check('400 16px Inter'));
      assert(ok, 'fonts not loaded');
    });

    await check('roller pops in after load', async () => {
      const op = await page.evaluate(() => getComputedStyle(document.querySelector('.roller__cover')).opacity);
      assert(parseFloat(op) > 0.95, `roller cover opacity ${op}`);
      await page.screenshot({ path: `${OUT}desktop-hero-00.png` });
    });

    await check('header is transparent over the hero', async () => {
      const over = await page.evaluate(() => document.querySelector('[data-header]').classList.contains('is-over-hero'));
      assert(over, 'header should be in over-hero state at the top');
    });

    await check('hero idle: first headline visible, nothing painted', async () => {
      const s = await heroState(page);
      assert(s.slides[0] > 0.95, `slide 0 opacity ${s.slides[0]}`);
      assert(s.painted < 2, `painted ${s.painted}px`);
      assert(s.phase === 'idle', `phase ${s.phase}`);
    });

    await check('hero rise: roller moves to the top, headline 2 shows', async () => {
      await scrollToHero(page, 0.21);
      const s = await heroState(page);
      assert(s.rollerTop < 20, `roller top ${s.rollerTop}`);
      assert(s.slides[1] > 0.95, `slide 1 opacity ${s.slides[1]}`);
      assert(s.painted < 2, 'should not paint while rising');
      await page.screenshot({ path: `${OUT}desktop-hero-21.png` });
    });

    await check('hero paint: stripe grows with the roller, headline 3 shows', async () => {
      await scrollToHero(page, 0.6);
      const s = await heroState(page);
      assert(s.phase === 'paint', `phase ${s.phase}`);
      assert(s.painted > s.H * 0.3 && s.painted < s.H * 0.98, `painted ${s.painted} of ${s.H}`);
      assert(s.slides[2] > 0.95, `slide 2 opacity ${s.slides[2]}`);
      await page.screenshot({ path: `${OUT}desktop-hero-60.png` });
    });

    await check('hero done: full stripe, final headline + CTA', async () => {
      await scrollToHero(page, 0.97);
      const s = await heroState(page);
      assert(s.phase === 'done', `phase ${s.phase}`);
      assert(s.painted >= s.H - 1, `painted ${s.painted} of ${s.H}`);
      assert(s.slides[3] > 0.95, `slide 3 opacity ${s.slides[3]}`);
      assert(s.rollerTop > s.H, 'roller should have left the screen');
      const cta = await page.locator('.hero__cta').isVisible();
      assert(cta, 'CTA not visible');
      await page.screenshot({ path: `${OUT}desktop-hero-97.png` });
    });

    await check('hero scrolls back up correctly (reversible)', async () => {
      await scrollToHero(page, 0);
      const s = await heroState(page);
      assert(s.slides[0] > 0.95 && s.painted < 2, 'did not return to idle');
    });

    await check('header turns solid after the hero', async () => {
      await page.evaluate(() => window.scrollTo({ top: document.querySelector('#about').offsetTop, behavior: 'instant' }));
      await page.waitForTimeout(400);
      const over = await page.evaluate(() => document.querySelector('[data-header]').classList.contains('is-over-hero'));
      assert(!over, 'header should be solid');
    });

    await scrollThrough(page);

    await check('all images loaded', async () => {
      const broken = await page.evaluate(() => [...document.images].filter((i) => !i.hasAttribute('data-lightbox-img')).filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.currentSrc || i.src));
      assert(broken.length === 0, `broken: ${broken.join(', ')}`);
    });

    await check('all reveal elements became visible', async () => {
      const hidden = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter((el) => !el.classList.contains('is-in')).length);
      assert(hidden === 0, `${hidden} elements never revealed`);
    });

    await check('stat counters reach their final values', async () => {
      await page.waitForTimeout(1800);
      const vals = await page.$$eval('[data-count]', (els) => els.map((e) => [e.textContent, e.dataset.count]));
      vals.forEach(([shown, want]) => assert(parseFloat(shown) === parseFloat(want), `counter shows ${shown}, expected ${want}`));
    });

    await check('testimonial band is fully painted when in view', async () => {
      await page.locator('[data-testimonials]').scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollBy({ top: 200, behavior: 'instant' }));
      await page.waitForTimeout(300);
      const fill = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('[data-testimonials]')).getPropertyValue('--fill')));
      assert(fill > 0.99, `band fill ${fill}`);
    });

    await check('testimonial dots switch quotes', async () => {
      const dots = page.locator('.quotes__dot');
      assert((await dots.count()) === 3, 'expected 3 dots');
      await dots.nth(2).click();
      await page.waitForTimeout(100);
      const active = await page.evaluate(() => [...document.querySelectorAll('.quote')].findIndex((q) => q.classList.contains('is-active')));
      assert(active === 2, `active quote ${active}`);
      await page.locator('[data-testimonials]').screenshot({ path: `${OUT}desktop-testimonials.png` });
    });

    await check('gallery lightbox opens, navigates, closes with Esc', async () => {
      await page.locator('.gallery__btn').first().click();
      await page.waitForTimeout(300);
      assert(await page.evaluate(() => document.querySelector('[data-lightbox]').open), 'lightbox did not open');
      const cap1 = await page.textContent('[data-lightbox-caption]');
      await page.keyboard.press('ArrowRight');
      const cap2 = await page.textContent('[data-lightbox-caption]');
      assert(cap1 !== cap2, 'arrow key did not change photo');
      await page.screenshot({ path: `${OUT}desktop-lightbox.png` });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
      assert(!(await page.evaluate(() => document.querySelector('[data-lightbox]').open)), 'lightbox did not close');
    });

    await check('form shows errors when empty', async () => {
      await page.locator('#quote').scrollIntoViewIfNeeded();
      await page.click('[data-submit]');
      const nameErr = await page.textContent('#f-name-error');
      const emailErr = await page.textContent('#f-email-error');
      assert(nameErr.trim() && emailErr.trim(), 'missing error messages');
      const invalid = await page.getAttribute('#f-email', 'aria-invalid');
      assert(invalid === 'true', 'email not marked invalid');
      const focused = await page.evaluate(() => document.activeElement.id);
      assert(focused === 'f-name', `focus should move to first error, got ${focused}`);
      await page.locator('.form-card').screenshot({ path: `${OUT}desktop-form-errors.png` });
    });

    await check('form rejects a bad email and accepts a good one', async () => {
      await page.fill('#f-name', 'Jane Doe');
      await page.fill('#f-email', 'jane@nowhere');
      await page.click('[data-submit]');
      assert((await page.textContent('#f-email-error')).trim(), 'bad email accepted');
      await page.fill('#f-email', 'jane@example.com');
      await page.fill('#f-phone', '(555) 123-4567');
      await page.selectOption('#f-type', 'Exterior');
      await page.click('[data-submit]');
      await page.waitForSelector('[data-form-success]:not([hidden])', { timeout: 4000 });
      const title = await page.textContent('.form-success__title');
      assert(title.includes('Jane'), `success title: ${title}`);
      await page.locator('.form-card').screenshot({ path: `${OUT}desktop-form-success.png` });
      await page.click('[data-form-reset]');
      assert(await page.isVisible('[data-quote-form]'), 'form did not come back after reset');
    });

    await check('nav link scrolls to its section', async () => {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(300);
      await page.click('.nav__link[href="#process"]');
      await page.waitForFunction(() => Math.abs(document.querySelector('#process').getBoundingClientRect().top) < 90, null, { timeout: 8000 });
    });

    await check('no horizontal overflow', async () => {
      const o = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert(o <= 0, `overflow ${o}px`);
    });

    await check('no console errors or failed requests', async () => {
      assert(page.problems.length === 0, page.problems.join('\n      '));
    });

    await context.close();
  }

  /* ===== Mobile ===== */
  console.log('\nMobile 390×844 (touch)');
  {
    const { context, page } = await openPage(browser, {
      viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2,
    }, 'mobile');

    await check('hero idle on mobile', async () => {
      const s = await heroState(page);
      assert(s.slides[0] > 0.95, 'first headline not visible');
      await page.screenshot({ path: `${OUT}mobile-hero-00.png` });
    });
    for (const p of [0.35, 0.6, 0.97]) {
      await check(`hero at ${Math.round(p * 100)}% on mobile`, async () => {
        await scrollToHero(page, p);
        const s = await heroState(page);
        if (p >= 0.97) assert(s.painted >= s.H - 1, 'stripe not full');
        else assert(s.painted > 0, 'stripe not painting');
        await page.screenshot({ path: `${OUT}mobile-hero-${Math.round(p * 100)}.png` });
      });
    }

    await check('mobile menu opens and closes', async () => {
      await page.evaluate(() => window.scrollTo({ top: document.querySelector('#about').offsetTop, behavior: 'instant' }));
      await page.waitForTimeout(300);
      await page.click('[data-menu-toggle]');
      await page.waitForTimeout(400);
      assert((await page.getAttribute('[data-menu-toggle]', 'aria-expanded')) === 'true', 'aria-expanded not true');
      assert(await page.isVisible('[data-mobile-menu] a[href="#work"]'), 'menu links not visible');
      await page.screenshot({ path: `${OUT}mobile-menu.png` });
      await page.click('[data-mobile-menu] a[href="#work"]');
      await page.waitForTimeout(400);
      assert((await page.getAttribute('[data-menu-toggle]', 'aria-expanded')) === 'false', 'menu did not close');
    });

    await scrollThrough(page);
    for (const sel of ['#about', '#services', '#process', '#work', '#quote']) {
      await page.locator(sel).scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      await page.screenshot({ path: `${OUT}mobile-${sel.slice(1)}.png` });
    }

    await check('no horizontal overflow on mobile', async () => {
      const o = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert(o <= 0, `overflow ${o}px`);
    });
    await check('no console errors on mobile', async () => {
      assert(page.problems.length === 0, page.problems.join('\n      '));
    });
    await context.close();
  }

  /* ===== Reduced motion ===== */
  console.log('\nReduced motion');
  {
    const { context, page } = await openPage(browser, { viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' }, 'reduced');
    await check('hero is static (one screen tall, no roller)', async () => {
      const r = await page.evaluate(() => ({
        h: document.querySelector('[data-hero]').offsetHeight,
        vh: window.innerHeight,
        roller: getComputedStyle(document.querySelector('[data-roller]')).display,
      }));
      assert(Math.abs(r.h - r.vh) < 2, `hero height ${r.h} vs ${r.vh}`);
      assert(r.roller === 'none', 'roller should be hidden');
      await page.screenshot({ path: `${OUT}reduced-hero.png` });
    });
    await check('content is visible without animations', async () => {
      const op = await page.evaluate(() => getComputedStyle(document.querySelector('#services .card')).opacity);
      assert(parseFloat(op) === 1, `card opacity ${op}`);
    });
    await context.close();
  }

  /* ===== JavaScript disabled ===== */
  console.log('\nJavaScript disabled');
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(URL_ROOT, { waitUntil: 'networkidle' });
    await check('page content is readable without JavaScript', async () => {
      const r = await page.evaluate(() => ({
        h1: getComputedStyle(document.querySelector('.hero__slide--intro')).opacity,
        card: getComputedStyle(document.querySelector('#services .card')).opacity,
      }));
      assert(parseFloat(r.h1) === 1 && parseFloat(r.card) === 1, JSON.stringify(r));
      await page.screenshot({ path: `${OUT}nojs-hero.png` });
    });
    await context.close();
  }
} finally {
  await browser.close();
  server.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed. Screenshots: tests/output/`);
process.exit(failed.length ? 1 : 0);
