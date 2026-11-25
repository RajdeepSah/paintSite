# Progress tracker

Last updated: 2026-11-25 · Branch: `claude/website-video-design-51nd5b`

## Status at a glance

| Phase | Status |
| --- | --- |
| 1. Plan, docs & scaffold | ✅ Done |
| 2. Artwork (Higgsfield) | ✅ Done |
| 3. Static layout for every section | ⏳ In progress |
| 4. Hero paint-roller scroll animation | ⬜ Not started |
| 5. Reveal animations & interactions | ⬜ Not started |
| 6. Testing, QA & handover docs | ⬜ Not started |

## Completed
- Broke down the reference video (see `docs/VIDEO_REFERENCE.md`, stills in `docs/reference/`).
- Wrote the plan (`docs/PLAN.md`), README, and `CLIENT_INFO.md` (all placeholder content + image prompts).
- Scaffold: `package.json` (`npm start`, `npm test`), `scripts/serve.mjs`, `.gitignore`.
- Generated 6 images with Higgsfield (GPT Image 2.6) and optimised them into `assets/img/`:
  `hero-wall`, `work-1` … `work-5` (+ `-760` small versions), `og-image.jpg`.

## Remaining
- Phase 3–6 (see table above and `docs/PLAN.md`).

## Decisions log
- Plain HTML/CSS/JS, no framework or build step — simplest to host and hand over.
- Fonts: Newsreader (serif headlines) + Inter (body) from Google Fonts.
- Paint colour `#4f7d46`; testimonial band `#3d6634`; page `#f5f4f1`.
- The roller is an inline SVG (not an image) so its colour always matches the paint stripe.
- The paint stripe is a generated SVG with a turbulence filter for ragged dry-brush edges.

## How to continue in a new session
1. Open the repo on branch `claude/website-video-design-51nd5b`.
2. Read this file, then `docs/PLAN.md` and `docs/VIDEO_REFERENCE.md` (compare with `docs/reference/*.jpg`).
3. Run `npm start` to view the site, `npm test` to run the checks.
4. Pick up the first phase that is not ✅ above, commit after each step, push, and update this file.
