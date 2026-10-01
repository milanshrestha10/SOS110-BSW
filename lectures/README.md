# SOS110 lectures

Each lecture is a folder with the student deck, `index.html` (the Back and Next buttons, arrow keys, space or swipe move between slides; `#3` in the URL jumps to slide 3).

The instructor pages (attendance code, check-ins, poll and simulation results, speaker notes) live in the private repo `milanshrestha10/SOS110-admin`, hosted at https://sos110-ce7a1.web.app. They load `shared/` and `course/course.json` from this site, so changes here reach them too.

Shared pieces live in `../shared/`:

| File | What it does |
|---|---|
| `deck.css` | The Course Brand design (sample 16) on a fixed 1920×1080 stage |
| `deck.js` | Scaling, Back/Next side buttons, bottom pager, keyboard, swipe and progress bar |
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

Deck rules, so every lecture works in any semester:

- No lesson plan or agenda slide. Attendance comes right after the opening slides.
- No calendar dates, weekdays, meeting times, rooms, office hours details, term names, TA or instructor names, school or university names.
- The title slide keeps the small module badge (`M01`) and the module title in the sans-serif style from `deck.css`. Don't add a university line.

Every new deck uses the design of Lecture 11 (`m4-l1-geosphere-soil-land-use`), which the instructor chose as the standard:

- **Hero title and end slides**: a full-bleed photo for the topic fades in behind a light scrim (near-white on the left behind dark text, clearing to the right so the photo shows), with a one-line subtitle under the title. Use the `.hero` classes in `deck.css`; the end slide is the takeaway on the same photo.
- **First lecture of a module**: open with the key terms (this lecture's glossary terms as flip cards, the rest of the module's terms as chips) and a module slide with at most four learning objectives drawn from the module objectives and what's due in the module. No next-class slide.
- **Use the whole stage**: give the heading clear space and let the body reach the bottom margin with `.content.fill`; sit shorter slides in the middle with `.content.center`. No big empty band at the bottom.
- **Animated pictures**: add `anim-pics` to `<main class="deck-stage">` so photos drift in from a slow zoom and diagrams wipe in. It is off for reduced motion and print.
- **Quick questions** after a big idea: a short, unrecorded check with answers that reveal on tap.

It keeps everything from the enhanced style of Lecture 10 (`m3-l3-atmosphere`):

- **Icon badges** on section kickers, big-idea cards, the Key vocabulary heading and each vocab card. Copy the inline SVG sprite from Lecture 10 and add symbols as needed; the `.ico` badge styles are in `deck.css`.
- **Real pictures** from the instructor's slides wherever the topic has one, in the lecture's `img/` folder, resized for the web, with credits kept. Use `.fig` for them.
- **Drawn diagrams** (inline SVG) where no picture exists. Label made-up numbers as teaching numbers.
- **Embedded video** when the instructor gives a link, with a link to open it on YouTube. Never leave a placeholder.
- **Extra visual slides** that show a process or a trend (a formation diagram, a chart, a map), not only text and cards.
- **Interactive pieces**: the warm-up and exit polls, flip cards and at least one game or simulation.
