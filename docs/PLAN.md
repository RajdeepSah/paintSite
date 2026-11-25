# Development Plan — Northlight Painting Co. website

Goal: build a fully working, responsive one-page website that matches the reference
screen recording (design, layout, structure, style and animations) as closely as possible.
All business details are placeholders and are listed in [`CLIENT_INFO.md`](../CLIENT_INFO.md).

Design notes taken from the video are in [`VIDEO_REFERENCE.md`](VIDEO_REFERENCE.md).
Live progress is tracked in [`PROGRESS.md`](PROGRESS.md).

## Tech choices (kept simple on purpose)

| Need | Choice | Why |
| --- | --- | --- |
| Markup | One `index.html` | Easy to host anywhere (Netlify, Vercel, GitHub Pages, cPanel) |
| Styles | One `assets/css/styles.css` with CSS variables | No build step; colours and fonts live in one place |
| Behaviour | One `assets/js/main.js` (vanilla JS, no libraries) | No dependencies to update; fast load |
| Fonts | Google Fonts: Newsreader (serif) + Inter (sans) | Matches the video's light editorial serif + clean sans |
| Images | Generated with Higgsfield (GPT Image 2.6), stored as optimised `.webp` + `.jpg` | Placeholder art the client can swap later |
| Tests | `tests/smoke.mjs` (Playwright) + `scripts/serve.mjs` (zero-dependency static server) | One command checks the whole page |

## Phases

### Phase 1 — Plan, docs & scaffold
- Break down the video frame by frame, record the copy, colours, layout and motion.
- Write `README.md`, `docs/PLAN.md`, `docs/PROGRESS.md`, `docs/VIDEO_REFERENCE.md`, `CLIENT_INFO.md`.
- Create the folder structure, `.gitignore`, `package.json`, local server script.

### Phase 2 — Artwork (Higgsfield)
- Hero background: empty, softly lit painted wall.
- Portfolio: 5 interior photos (living room with gallery wall, olive living room with pendants,
  emerald shelf with pampas grass, white kitchen with stool, bright room with blue chair).
- Download, resize and compress to `.webp` + `.jpg` fallbacks in `assets/img/`.

### Phase 3 — Static layout for every section
1. Fixed header (logo, Services / Process / Work links, "Get a quote" pill, mobile menu)
2. Hero (pinned "wall" scene with headline)
3. Intro: "A great paint job is invisible." + stats (12yr / 800+ / 5.0★)
4. Services: "Every surface, finished properly." + 3 cards
5. Process: "Four steps. No surprises." + 4 numbered steps
6. Work: "Rooms we're proud of." + 5-image grid
7. Testimonial: full-width green band with a quote
8. Contact: "Let's get your quote." + estimate form
9. Footer
- Fully responsive (desktop, tablet, phone).

### Phase 4 — Hero paint-roller scroll animation (the signature effect)
- Roller pops in on load below the headline.
- Scrolling: the roller rises to the top of the screen, then rolls down and paints a
  rough-edged green stripe behind it, then leaves the bottom of the screen.
- Headline crossfades through 4 messages: "The wall is a blank canvas." → "One true color." →
  "Lines so clean they disappear." → "Done right, the first time." (+ CTA button).
- Header is transparent with white text over the hero, then turns solid after it.
- Smooth (eased) motion, small sway while rolling, works on touch devices.
- `prefers-reduced-motion`: static painted hero, no pinning.

### Phase 5 — Reveal animations & interactions
- Scroll-reveal (fade + rise + un-blur) on headings, text, cards, steps, images.
- Stat counters count up; process lines draw in from the left.
- Testimonial band "paints in" as it scrolls into view; quote carousel with dots.
- Gallery lightbox (click, arrows, Esc).
- Quote form: validation, friendly errors, success state, optional real endpoint (Formspree etc.).
- Mobile navigation menu, smooth anchor scrolling, footer year.

### Phase 6 — Testing, QA & handover docs
- Automated Playwright checks on desktop + mobile: console errors, broken images,
  horizontal overflow, hero animation states, header state, menu, lightbox, form.
- Screenshot review against the video frames in `docs/reference/`; fix differences.
- Accessibility pass (labels, focus states, contrast, keyboard, reduced motion).
- Performance pass (image sizes, lazy loading, no layout shift).
- Final update of all docs, push.
