# Lecture map and conversion recipe

One row per class session in `course/course.json`. Use it to track which of the instructor's original PowerPoint/PDF lectures have been converted into the current deck design (Lecture 11, `m4-l1-geosphere-soil-land-use`).

**Status**
- **Converted**: rebuilt from the original lecture file in the current design.
- **Current design**: already in the current design, built from notes rather than the original file.
- **Older design**: a deck exists but predates the current design; convert it from the original file.
- **Not built**: no deck yet.

| Module | Session | Topic | Deck folder | Source file | Status |
|---|---|---|---|---|---|
| M0 | m0-s1 | Welcome and course introduction | | | Not built |
| M1 | m1-s1 | Lecture 1 · Sustainability and sustainable development | `m1-l1-triple-bottom-line` | `Lecture01_IntroductionToSustainability.pdf` | **Converted** |
| M1 | m1-s2 | Environmental science in sustainability | `m1-l2-environmental-science` | | Older design |
| M1 | m1-s3 | Social sustainability | `m1-l3-social-sustainability` | | Older design |
| M1 | m1-s4 | Review · Socio-ecological-technological systems | `m1-review-sets` | | Older design |
| M2 | m2-s1 | Thermodynamics, energy, and matter | | | Not built |
| M2 | m2-s2 | Biodiversity and other ecosystem services | | | Not built |
| M2 | m2-s3 | Biomimicry and nature-inspired designs | | | Not built |
| M2 | m2-s4 | Review · Planetary boundaries (Grand Canyon) | `m2-review-grand-canyon` | | Older design |
| M3 | m3-s1 | Population and consumption | `m3-l1-demographic-transition` | | Older design |
| M3 | m3-s2 | Water cycle and human impacts | | | Not built |
| M3 | m3-s3 | Atmosphere, weather, and climate | `m3-l3-atmosphere` | `Lecture09_AtmosphereWeatherAndPollution.md` | Older design |
| M3 | m3-s4 | Review · Conservation of life-supporting systems | | | Not built |
| M4 | m4-s1 | Geosphere, soil, and land use | `m4-l1-geosphere-soil-land-use` | | Current design |
| M4 | m4-s2 | Stocks-and-flows (systems dynamics) | | | Not built |
| M4 | m4-s3 | Carbon cycle and climate change | | | Not built |
| M5 | m5-s1 | Sustainable food systems | | | Not built |
| M5 | m5-s2 | The FEWs nexus and energy systems | | | Not built |
| M5 | m5-s3 | Alternative energy and energy equity | | | Not built |
| M5 | m5-s4 | Review · Complexity and cascading risks | | | Not built |
| M6 | m6-s1 | Waste management and circular economy | | | Not built |
| M6 | m6-s2 | Urban ecology and cities | | | Not built |
| M6 | m6-s3 | Environmental health and vulnerability | | | Not built |
| M6 | m6-s4 | Review · Equity and community resilience | | | Not built |
| M7 | m7-s1 | Indigenous sustainability | | | Not built |
| M7 | m7-s2 | Human behavior and decision-making | | | Not built |
| M7 | m7-s3 | Institutional approach to sustainability | | | Not built |
| M8 | m8-s1 | Policy and governance in sustainability | | | Not built |
| M8 | m8-s2 | Sustainable futures and course recap | | | Not built |

The instructor's file numbers don't always match the deck numbers: the file `Lecture09_…` is the atmosphere lecture, whose deck says Lecture 10. Fill in the source file name as each lecture is converted.

## Conversion recipe

The steps used for Lecture 1. They keep the work to scripts plus two or three image checks, so a lecture converts in one pass.

1. **Get the source.** A PDF of the slides is enough. A `.pptx` gives sharper pictures and the speaker notes, so send it when you have it. Note: "Microsoft Print to PDF" splits pictures into strips, so crop from page renders (step 3), not from embedded images.
2. **Match the session.** Find the lecture's session in `course/course.json` by topic and terms, and its row in the table above. Check whether a deck folder already exists; if so, rebuild that folder in place and keep its activities.
3. **Extract text and pictures with scripts** (needs `poppler-utils` and Pillow):
   - `pdftotext -layout lecture.pdf -` for all slide text.
   - `pdftoppm -r 300 -png lecture.pdf p`, then crop each page to the slide box (Lecture 1: x 238–3062, y 483–2064 at 300 dpi).
   - Make one contact sheet of the slides with a 10% grid drawn on it, look at it once, and write crop fractions for each picture.
   - Crop to `lectures/<folder>/img/<name>.jpg`, at most 1300 px wide (1920×1080 for the hero), JPEG quality 82. Check the crops on one more contact sheet and trim stray text.
   - For the hero photo, place the picture on the right of a 1920×1080 canvas and fill the left with a blurred mirror of it, so the light scrim covers the fill.
4. **Build the deck** by copying Lecture 11's structure and `deck.css`/`deck.js` links, then:
   - Slide order: title (hero), key terms and module slide (first lecture of a module only), warm-up poll, big ideas, check-in, review quiz, then the lecture in the original slide order, an exit ticket and the takeaway (hero).
   - Key terms: the terms on the original recap slide plus the session's glossary terms. Glossary terms use the `course.json` definitions.
   - Module slide: at most four objectives from the module objectives, and what's due from `course.json`.
   - Each original slide becomes one slide with its picture in `.fig` (photo) or `.fig.plain` (diagram), and its text rewritten in short, plain sentences. Keep printed credits. Fix typos.
   - Turn the original's activities (think-pair-share, recap questions) into numbered, one-ask exercises. Add one tap-to-reveal quick question after a big idea.
   - Reuse games and simulations already in the folder; add a new one only when asked.
   - Remove names, school names, dates, times and rooms.
5. **Check it.** Serve the repo (`python3 -m http.server`), screenshot every slide with Playwright (`window.Deck.go(i)`), and review one contact sheet. Firebase and fonts won't load in the sandbox; that's expected.
6. **Admin page.** In `SOS110-admin/public/lectures/<folder>.html`, update the title, the check-in slide number, the poll labels and answers, the quiz answer keys, and a table for each new saved activity.
7. **Ship.** Open a draft PR in each repo and update this table.
