# Progress tracker

Last updated: 2026-11-26 · Branch: `claude/website-video-design-51nd5b` · Author: Rajdeep Sah

## Status at a glance

| Phase | Status |
| --- | --- |
| 1. Plan, docs & scaffold | ✅ Done |
| 2. Artwork (Higgsfield) | ✅ Done |
| 3. Static layout for every section | ✅ Done |
| 4. Hero paint-roller scroll animation | ✅ Done |
| 5. Reveal animations & interactions | ✅ Done |
| 6. Testing, QA & handover docs | ✅ Done |

**The website is complete and tested.** The only work left is client-specific (see "Before launch").

## What was built
- `index.html` — all sections from the video: header, pinned roller hero, intro + stats,
  services, process, recent work, testimonial band, quote form, plus a footer.
- `assets/css/styles.css` — design tokens at the top, responsive down to 320px wide.
- `assets/js/main.js` — no libraries:
  - Hero: roller pops in on load → rises to the top → rolls down painting a ragged SVG
    stripe → leaves the screen; 4 headlines crossfade with blur; eased motion, sway,
    rolling nap texture; fully reversible when scrolling up.
  - Header transparent over the hero, solid afterwards; active nav link; full-screen mobile menu.
  - Scroll reveals, counting stats, process lines drawing in.
  - Testimonial band paints in from the bottom; 3-quote carousel (auto, dots, arrow keys).
  - Gallery lightbox (click, ← →, Esc).
  - Quote form: validation, inline errors, honeypot, loading + success states,
    optional real endpoint via `data-endpoint`.
- Self-hosted fonts (Newsreader, Inter — OFL licence files included).
- 6 images generated with Higgsfield, optimised to webp + jpg (+ 760px versions).
- `tests/smoke.mjs` — 30 automated checks.

## QA results (last run)
- `npm test`: **30/30 checks pass** — desktop 1440×900, mobile 390×844 (touch),
  reduced motion, JavaScript disabled. Covers hero states, header, reveals, counters,
  carousel, lightbox, form errors/success, nav scrolling, overflow, console errors, broken images.
- Manually reviewed screenshots at 390×844, 768×1024, 1024×768, 1366×640, 1440×900, 1920×1080.
- HTML validated with html-validate (recommended rules): no errors.
- Contrast: body text, labels and the main button meet WCAG AA. Hero headlines are white on a
  mid-grey wall (as in the video) with a soft darkening behind them and a text shadow.
- Performance: ~55–60 fps while scrolling the hero in headless Chromium, even with 4× CPU
  throttling; no long frames. Images are lazy-loaded; hero image preloaded per screen size.

## Before launch (client-specific — needs real information)
1. Fill in `CLIENT_INFO.md` with the real business details, then apply them (prompt included in that file).
2. Replace the placeholder photos in `assets/img/` with real project photos (same names, webp + jpg).
3. Set up a form endpoint (Formspree etc.) and add `data-endpoint="…"` to the form.
4. Replace `https://www.example.com` in the `<head>` (social tags + structured data) with the real domain.
5. Add real social links in the footer.
6. Optional: analytics, a privacy page, a sitemap once the domain is known.

## Decisions log
- Plain HTML/CSS/JS, no framework or build step — simplest to host and hand over.
- Fonts self-hosted instead of Google Fonts (faster, no third-party requests).
- Paint colour `#4f7d46` family; testimonial band `#3d6634`; button `#437c3b` (AA contrast).
- Roller is an inline SVG so its colour always matches the stripe.
- Stripe is generated in JS as an SVG with turbulence filters (ragged edges + roller streaks)
  and revealed with two opposing transforms (GPU-friendly, no repaint).
- Reduced motion / no JS: the hero becomes one static screen showing the first and last
  messages with a fully painted stripe.

## How to continue in a new session
1. Open the repo on branch `claude/website-video-design-51nd5b`.
2. Read this file, then `docs/PLAN.md` and `docs/VIDEO_REFERENCE.md` (stills in `docs/reference/`).
3. `npm start` to view the site at http://localhost:8080, `npm test` to run all checks.
4. Make changes, run `npm test`, commit with a clear message, push, and update this file.
