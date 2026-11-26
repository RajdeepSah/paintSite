# Client information sheet (placeholder content)

Everything on the website that is specific to the business is listed below.
**All of it is placeholder text right now.** Before handing the site to the client,
replace the values in this file with the real ones, then apply them to the site.

---

## How to apply the real information

**Option A — ask an AI assistant (fastest).** Fill in this file, then paste this prompt:

```text
Read CLIENT_INFO.md in this repository. Replace every placeholder on the website
(index.html, the JSON-LD block in index.html, and any image files) with the real values
written in CLIENT_INFO.md. Keep the design, layout and animations exactly as they are.
Update README.md and docs/PROGRESS.md, run `npm test`, fix anything that fails, then commit.
```

**Option B — edit by hand.** Every value below says where it lives. All text is in
`index.html`; search for the text shown in the "Current placeholder" column.
Colours and fonts are at the top of `assets/css/styles.css`.

---

## 1. Business basics

| Item | Current placeholder | Real value |
| --- | --- | --- |
| Business name (full) | Northlight Painting Co. | |
| Short name / logo text | Northlight | |
| Browser tab title | Northlight Painting Co. — Interior & Exterior Painters | |
| Search description (meta) | Northlight is a small crew of career painters. Interior & exterior painting, color consults and specialty finishes — fixed quotes, spotless cleanup. | |
| Phone | (402) 555-0148 | |
| Email | hello@northlightpainting.co | |
| Service area | Serving the greater metro area | |
| City (used in hero sub-line and schema) | the city | |
| Street address (schema only, optional) | — | |
| Opening hours (schema, optional) | Mo-Fr 07:30-17:30, Sa 09:00-14:00 | |
| Website URL (for social sharing tags) | https://www.example.com | |
| Social links (footer) | Instagram, Facebook (both `#`) | |
| License / insurance line (footer) | Licensed & fully insured | |

## 2. Hero (top of the page, pinned roller animation)

| Slide | Headline (italic part in *stars*) | Sub-line |
| --- | --- | --- |
| Eyebrow | NORTHLIGHT PAINTING CO. | — |
| 1 | The wall is / *a blank canvas.* | — |
| 2 | One *true* / color. | We mix, test, and match to the light in your room — so the shade you choose is the shade you live with. |
| 3 | Lines so clean / they *disappear.* | Edges cut by hand. No tape ghosting, no roller stipple, no missed spots. |
| 4 | Done right, / *the first time.* | Interior & exterior painting across the city. Fully insured. Spotless cleanup. Guaranteed. |
| Button | Book your estimate → | (scrolls to the quote form) |

## 3. Intro + stats ("Painters, not pretenders")

- Eyebrow: **PAINTERS, NOT PRETENDERS**
- Headline: **A great paint job is _invisible._ You only notice the bad ones.**
- Paragraph: *Northlight is a small crew of career painters who treat your home like ours — drop cloths down, corners sharp, and not a fleck of green where it doesn't belong.*

| Stat | Number | Label |
| --- | --- | --- |
| 1 | 12yr | Average crew experience |
| 2 | 800+ | Homes & businesses painted |
| 3 | 5.0★ | Across 240 local reviews |

## 4. Services ("What we do")

- Eyebrow: **WHAT WE DO**
- Headline: **Every surface, finished properly.**
- Side note: *From a single accent wall to a full repaint inside and out — one crew, one standard.*

| Card | Title | Description |
| --- | --- | --- |
| 1 | Interior Painting | Walls, ceilings, trim, doors and cabinetry. Low-VOC paints, dust-controlled prep, and furniture handled with care. |
| 2 | Exterior & Siding | Pressure-wash, scrape, prime and coat. Weather-rated finishes that hold their color through every season. |
| 3 | Color & Finishes | On-site color consults, custom mixing, and specialty finishes — limewash, matte, eggshell, or high-gloss. |

## 5. Process ("How it goes")

- Eyebrow: **HOW IT GOES** — Headline: **Four steps. No surprises.**

| Step | Title | Description |
| --- | --- | --- |
| 01 | Walkthrough | We visit, measure, and listen. You get a fixed written quote — no vague hourly games. |
| 02 | Prep | Patch, sand, mask and prime. The boring part nobody sees is where the finish is won. |
| 03 | Paint | Cut-ins by hand, even rolls, two full coats. We photograph progress daily. |
| 04 | Walk & clean | We inspect together under the room's own light, touch up, and leave it spotless. |

## 6. Recent work (photo grid)

- Eyebrow: **RECENT WORK** — Headline: **Rooms we're proud of.**
- Replace the files in `assets/img/` with real project photos (keep the same file names,
  or update the names in `index.html`). Each photo needs a `.webp` and a `.jpg`.

| File | Caption (shown on hover + lightbox) | Location | Size used |
| --- | --- | --- | --- |
| work-1 | Living room repaint | Riverside | wide (16:9) |
| work-2 | Olive feature walls | Old Town | tall (4:5) |
| work-3 | Lacquered emerald shelving | Maple Heights | 4:3 |
| work-4 | Kitchen & trim refresh | Lakeview | 4:3 |
| work-5 | Whole-floor repaint | Northgate | 4:3 |

## 7. Testimonials (green band)

| # | Quote | Name / project |
| --- | --- | --- |
| 1 | They left the place cleaner than they found it. The walls look like glass. | Marian R., whole-home repaint · Riverside |
| 2 | Fixed price, on time, and the cut lines along our ceilings are perfect. We've already booked the exterior. | Dev & Priya S., interior repaint · Old Town |
| 3 | They matched a 40-year-old trim color by eye and nobody can tell where the old paint ends. | Tom H., trim & doors · Maple Heights |

## 8. Quote form ("Free estimate")

- Eyebrow: **FREE ESTIMATE** — Headline: **Let's get your quote.**
- Paragraph: *Tell us about the space. We'll come by, take a look, and send a fixed price within 48 hours — no pressure, no call-center.*
- Project type options: Interior · Exterior · Interior + Exterior · Cabinets & trim · Commercial
- Rough size options: 1–2 rooms · 3–5 rooms · Whole home · Exterior only · Not sure yet
- Button: **Request my estimate** — note: *No spam. We reply within one business day.*
- **Where do form submissions go?** Right now the form only shows a success message.
  To receive real emails, create a free form endpoint (e.g. Formspree, Basin, Getform),
  then put its URL in `index.html` on the form: `data-endpoint="https://formspree.io/f/XXXX"`.

  Endpoint URL: ______________________

## 9. Brand look (optional changes)

Defined at the top of `assets/css/styles.css`:

| Token | Current | Used for |
| --- | --- | --- |
| `--green` | `#4f7d46` | icons, accents |
| Paint stripe colours | `#4b7643` → `#71a364` | top of `assets/js/main.js` (`PAINT_TOP/MID/BOTTOM`) and the roller gradient in `index.html` |
| `--green-btn` | `#437c3b` | main button |
| `--green-deep` | `#3d6634` | testimonial band |
| `--paper` | `#f5f4f1` | page background |
| `--ink` | `#1f2420` | main text |
| Headline font | Newsreader (Google Fonts) | headings |
| Body font | Inter (Google Fonts) | body text, labels, buttons |

## 10. Artwork prompts (Higgsfield, model GPT Image 2.6, quality high, 2k)

Use these to regenerate or restyle the placeholder art.

| File | Aspect | Prompt |
| --- | --- | --- |
| hero-wall | 16:9 | Photograph of a completely empty, freshly painted interior wall filling the entire frame. Smooth matte finish in a warm pale greige / light stone gray. Soft diffused daylight entering from the upper right, gentle large soft-edged shadow gradients and faint diagonal window light falling across the wall, slightly darker toward the left and bottom edges, very subtle plaster texture. Minimal, calm, architectural, editorial. No objects, no furniture, no frames, no outlets, no floor, no ceiling, no text, no people. Straight-on, even framing, high resolution. |
| work-1 | 16:9 | Interior design photograph of a freshly painted bright living room. Walls painted a soft cool light gray. A curated gallery wall of framed prints, a woven wall basket and a decorative bull skull on the left wall, a round white wall clock in the center. Cream L-shaped sectional sofa with white cushions, round wooden coffee table with a small plant, a knit pouf, a wooden accent chair and a side table with a lamp, tall window with linen curtains on the right, light oak floor. Natural soft daylight, crisp clean lines, editorial real estate photography, wide angle, no people, no text, no watermark. |
| work-2 | 4:5 | Interior design photograph of a cozy living room with walls freshly painted in a muted warm olive-gray. Two woven rattan pendant lights hanging low, a gray sofa with cushions, a round marble coffee table, a mustard velvet ottoman, three framed artworks above the sofa, a leafy potted plant, a patterned rug, a doorway with a window letting in soft daylight. Warm, calm, editorial interior photography, crisp painted edges, no people, no text, no watermark. |
| work-3 | 4:3 | Interior design detail photograph: a bright white painted brick wall, a low console shelf painted glossy emerald green, a tall slim glass vase with dried golden pampas grass and wheat stems, two small framed botanical line-art prints leaning against the wall, soft natural daylight, minimal Scandinavian styling, editorial photography, crisp clean paint finish, no people, no text, no watermark. |
| work-4 | 4:3 | Interior photograph of a modern kitchen with freshly painted bright white walls and white cabinetry, stainless steel refrigerator, a white kitchen island with a black metal round bar stool, dark walnut hardwood floor, pendant light, soft daylight, clean minimal real estate photography, crisp paint lines, no people, no text, no watermark. |
| work-5 | 4:3 | Interior photograph of a sunlit open living space with freshly painted crisp white walls and white built-in cabinetry along the wall, warm honey oak hardwood floor, a cobalt blue velvet armchair at the left edge, a white molded chair, potted plants on a white sideboard, large windows with sheer curtains, bright airy natural daylight, editorial real estate photography, no people, no text, no watermark. |
