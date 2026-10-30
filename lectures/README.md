# SOS110 lectures

Each lecture is a folder with the student deck, `index.html` (the Back and Next buttons, arrow keys, space or swipe move between slides; `#3` in the URL jumps to slide 3).

The instructor pages (attendance code, check-ins, poll and simulation results, speaker notes) live in the private repo `milanshrestha10/SOS110-admin`, hosted at https://sos110-ce7a1.web.app. They load `shared/` and `course/course.json` from this site, so changes here reach them too.

Shared pieces live in `../shared/`:

| File | What it does |
|---|---|
| `deck.css` | The Course Brand design (sample 16) on a fixed 1920×1080 stage, plus the reference-guide exercise style (`.ref`) |
| `deck.js` | Scaling, Back/Next side buttons, bottom pager, keyboard, swipe and progress bar, and the pop-up panels of `.ref` slides |
| `course.js` | Fills objectives, glossary cards and assignments from `../course/course.json` |
| `live.js` | Attendance, polls and simulation results, through Firebase or demo mode |
| `firebase-config.js` | Paste the Firebase web config here to go live |

## Try it locally

Pages load `course.json` with `fetch`, so open them through a web server, not by double-clicking:

```
python3 -m http.server 8000
# then open http://localhost:8000/lectures/m3-l3-atmosphere/
```

Until Firebase is connected everything runs in **demo mode**: check-ins, votes and simulation runs are stored in your browser only.

## Going live with Firebase

1. Create a Firebase project and add a Web app.
2. Turn on Authentication > Google (for the instructor) and Anonymous (for students), and create a Cloud Firestore database.
3. Paste the web app config into `shared/firebase-config.js` and check `adminEmails`.
4. Deploy `firebase/firestore.rules` (Firebase console > Firestore > Rules). Keep its admin email in sync with the config.

Students check in by typing their name, email and the code on screen; no account is needed. Only the admin account can read attendance and results, and the attendance code is never readable by students.

## Adding a lecture

Copy a lecture folder, change `LECTURE` to the session id from `course.json` (for example `m4-s2`), and rewrite the slides. Glossary cards, objectives and assignments fill in on their own. Then add the matching admin page in the private repo.

**Speaker notes never go in this repo.** Everything here is public, including the page source, so a hidden note is still readable by students. Write notes in the private repo's `public/notes/<lecture folder>.json`; the instructor presents with them in its presenter view, which steers this deck in a separate projector window.

When you change `shared/deck.css` or `shared/deck.js`, bump the `?v=` date on their links in every lecture, so browsers load the new file instead of a cached copy.

Deck rules, so every lecture works in any semester:

- No lesson plan or agenda slide. Attendance comes right after the opening slides.
- No calendar dates, weekdays, meeting times, rooms, office hours details, term names, TA or instructor names, school or university names.
- The title slide keeps the small module badge (`M01`) and the module title in the sans-serif style from `deck.css`. Don't add a university line.

Every new deck uses the design of Lecture 11 (`m4-l1-geosphere-soil-land-use`), which the instructor chose as the standard:

- **Hero title and end slides**: a full-bleed photo for the topic fades in behind a light scrim (near-white on the left behind dark text, clearing to the right so the photo shows), with a one-line subtitle under the title. Use the `.hero` classes in `deck.css`; the end slide is the takeaway on the same photo.
- **Slide order at the start**: title, then the module slide (module overview and what's due) and key terms, in that order (first lecture of a module only), warm-up poll, big ideas, attendance check-in, then the review quiz right after check-in, then the lecture content.
- **First lecture of a module**: open with the module slide (at most four learning objectives drawn from the module objectives, and what's due in the module), then the key terms on their own slide (the terms the instructor lists for that lecture, as flip cards, never on the title slide). No next-class slide.
- **Highlighted heading words** (`<em>` in titles and headings) use the gold accent `#C4851C` (`--accent` in `deck.css`), not sky blue.
- **Use the whole stage**: give the heading clear space and let the body reach the bottom margin with `.content.fill`; sit shorter slides in the middle with `.content.center`. No big empty band at the bottom.
- **Animated pictures**: add `anim-pics` to `<main class="deck-stage">` so photos drift in from a slow zoom and diagrams wipe in. It is off for reduced motion and print.
- **Clear space under every heading**: add `roomy` to `<main class="deck-stage">` so each heading keeps a 48px gap above the text and pictures, and don't override it with inline margins.
- **Exercises written for first-year students**: short, plain questions with one ask each, numbered, plus a one-line instruction that says what to do first. Give a quick definition in the question or its hint the first time a term like biome or geosphere appears.
- **Speaker notes stay private**: never add an `<aside class="notes">` or any note text to a student deck (the page source is public). Put notes in the private repo's `public/notes/<lecture folder>.json` and present from its presenter view.
- **Quick questions** after a big idea: a short, unrecorded check with answers that reveal on tap.

It keeps everything from the enhanced style of Lecture 10 (`m3-l3-atmosphere`):

- **Icon badges** on section kickers, big-idea cards, the Key vocabulary heading and each vocab card. Copy the inline SVG sprite from Lecture 10 and add symbols as needed; the `.ico` badge styles are in `deck.css`.
- **Real pictures** from the instructor's slides wherever the topic has one, in the lecture's `img/` folder, resized for the web, with credits kept. Use `.fig` for them.
- **Drawn diagrams** (inline SVG) where no picture exists. Label made-up numbers as teaching numbers.
- **Embedded video** when the instructor gives a link, with a link to open it on YouTube. Never leave a placeholder.
- **Extra visual slides** that show a process or a trend (a formation diagram, a chart, a map), not only text and cards.
- **Interactive pieces**: the warm-up and exit polls, flip cards and at least one game or simulation.

## Reference-guide exercise style (from Lecture 16, exercise 1)

Use it for an exercise where students tap icons to read short context panels before answering. Add the class `ref` to the `<section class="slide ref">`; `deck.css` and `deck.js` do the rest. Load the fonts `DM Serif Display` and `Archivo Narrow` (Google Fonts) in the page head.

- **Look**: a white `.card` on a beige page (`#eeeae0`), headings in DM Serif Display, body in Archivo Narrow (a free stand-in for Helvetica Neue LT Pro 47 Light Condensed), red `#e53b3b` as the only accent. Highlighted words in headings stay gold `<em>`.
- **Layout**: `.top` kicker line, `.card` holding `h2`, `.lead`, the text items and a `.photo` column (700px) on the right, `.bar` footer with counts and a source note. Position items with inline `left`/`top`, as Lecture 16 does.
- **Red icons that open panels**: a text item is `<button class="p" data-open="NAME">text <span class="ic">…svg…</span></button>`; a hotspot on the photo is `<button class="hs" data-open="NAME">`; the answer icon is a **black round pencil** (gold pencil on black) that opens a pop-up where students write an answer that submits: `<button class="note" data-open="answers"><svg viewBox="0 0 24 24"><use href="#i-pencil"/></svg></button>`. Use it for every answer-submitting pop-up, and for small inline copies use `<span class="ic">` with the same symbol (it turns black automatically). Learn-only icons (magnifier, data, linkages route, steps) stay separate, and in the written legend the answer icon is labelled "Your answer (submits)". Mark an icon `.done` (green) once the student has used it.
- **Pop-up panels**: put them in `<div id="pops">` as `<div class="pop" id="pop-NAME">` with a `.x` close button, `.tag`, `h3`, `p`, optional `.abc` row of three `.box` stats (`.box.warn` for a caution) and `.go` buttons (`.rbtn`, `.rbtn.g`). `[data-close]`, the `.shade` or Esc closes it. For extra work when a panel opens, listen for `ref:open` on the slide (`e.detail` is the panel name, empty when closed).
- **Cutouts**: transparent PNGs (`.cut` on the photo, `.cutp` in a panel) with the background removed, saved in the lecture's `img/`.
- **Photo credit**: bottom-left of the photo in `.credit-ph`, written as `Name / Unsplash` for Unsplash photos, or `Photo: instructor-supplied`.
- **Made-up numbers** are labeled in the footer source note.
- **Status and submit**: answers use `.rchips` choice chips, `.qn` numbered questions, a `.rbtn` Submit and a `.status` line, saved through `live.js` like the other exercises.
