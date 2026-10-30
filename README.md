# CALABARZON Virtual Tour and Cultural Mapping App (Phase 1 + Phase 2)

React Native (Expo) app with a local SQLite database.

## Install and run

```bash
npm install
npm start
```

Scan the QR code with Expo Go on your phone. On first launch the database is created and filled with 8 starter destinations and 24 quiz questions.

## Run it on a PC (browser)

Native and web dependencies are included in `package.json`. Start the app in a desktop browser:

```bash
npm run web
```

This opens the app at `http://localhost:8081`.

To publish it as a website (Netlify, Vercel, GitHub Pages, or your school server):

```bash
npm run build:web   # creates a dist/ folder of static files
```

Upload the `dist/` folder to any static host. Students then open the link on a PC or a phone, with nothing to install.

Use **Settings → Appearance** to toggle light and dark themes. Your choice is saved on the device. On supported browsers, the page reveals the new theme from the toggle button with a circular transition; reduced-motion settings disable that animation.

What differs on the web:

| Feature | Phone | PC browser |
|---|---|---|
| Database | SQLite (`db/database.js`) | IndexedDB (`db/database.web.js`), same functions |
| 360° tour | WebView | iframe, plus an "Open in new tab" button for sites that block embedding |
| Delete confirmation | Native alert | Browser confirm box |
| Photo gallery | Swipe | Swipe, or the arrow buttons |
| Layout | Full width | Centered column, max 900 px (`MAX_WIDTH` in `src/theme.js`) |

**Data is stored per device and per browser.** Records added on a PC do not appear on a phone, and clearing browser data erases them. Syncing across devices would need an online backend such as Supabase or Firebase.

## Requirement checklist

| Requirement | Where |
|---|---|
| **P1-1 CRUD** | `DestinationFormScreen` (add/edit), `DestinationDetailScreen` (view/delete), `db/database.js` |
| **P1-2 Destination information** | Name, description, address, category, and image on the card, detail, and form screens |
| **P1-3 Search and filter** | `DestinationListScreen`: search box and category chips, run as SQL `LIKE` and `WHERE` queries |
| **P1-4 Navigation** | Bottom tabs (Destinations, Home, Progress, Settings, About) plus a stack to Detail, Form, Tour, Quiz |
| **P1-5 Database** | `expo-sqlite`; tables `destinations`, `quiz_questions`, `progress`, `quiz_attempts` |
| **P2-1 Virtual tour** | `VirtualTourScreen`: swipeable photos, History, Cultural significance, optional 360° link (`Tour360Screen`) |
| **P2-2 Quiz** | `QuizScreen`: multiple choice, instant feedback, score computed and shown at the end. `QuizEditorScreen` adds or removes questions |
| **P2-3 Progress** | `ProgressScreen`: completed destinations, best score per destination, recent attempts |

## How progress works

- Every finished quiz is saved as an attempt. The best score per destination is kept.
- A destination becomes **Completed** when a quiz score reaches 70% (`PASS_MARK` in `src/theme.js`). It can also be marked manually on the detail screen.

## Using the National Museum of Fine Arts reference

https://nmfa.nationalmuseum.gov.ph/ is a 360° virtual tour. The app supports this pattern: edit any destination, paste a link into **360° tour link**, and the Virtual Tour screen shows an **Open 360° tour** button that loads the page in an in-app WebView. Use it for any 360° tour of a CALABARZON site you find. (The museum itself is in Manila, outside Region IV-A, so it is not included as a seed record.)

## Notes

- Seed destinations have no photos so that every image is one you have permission to use. Use **Edit destination** to add a cover image and tour photos.
- Picked photos are stored in the database as compressed data URIs, so they persist without file permissions. Keep to a few photos per destination. On the web they are resized to 1280 px before saving.
- Verify the seed facts and quiz answers against your teacher's or NHCP references before submitting.
