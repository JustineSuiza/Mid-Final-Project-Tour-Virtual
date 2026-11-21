# Gala Tour — CALABARZON Virtual Tour and Cultural Mapping App

React Native CLI app with Firebase Firestore as the online database.

## Install and run

```bash
npm install
```

Create `.env` from `.env.example` and fill in the Firebase web app settings (`FIREBASE_*`) and optional Mapbox public token. In Firebase Console, create a Firestore database and add rules appropriate for your project.

```bash
npm run android
```

This builds and launches the app on a connected Android device or emulator. On first launch, seed destinations/questions are written to Firestore if the collection is empty.

To build a release APK locally on Windows:

```bash
npm run build:apk
```

The APK is written to `android/app/build/outputs/apk/release/app-release.apk`. Install it on an Android device or share the file for download.

Use **Settings → Appearance** to toggle light and dark themes. Your choice is saved on the device.

**Data is stored online in Firebase Firestore.** Devices/browsers using the same Firebase project see the same data, subject to your Firestore rules.

## Requirement checklist

| Requirement | Where |
|---|---|
| **P1-1 CRUD** | `DestinationFormScreen` (add/edit), `DestinationDetailScreen` (view/delete), `db/database.js` |
| **P1-2 Destination information** | Name, description, address, category, and image on the card, detail, and form screens |
| **P1-3 Search and filter** | `DestinationListScreen`: search box and category chips, run as SQL `LIKE` and `WHERE` queries |
| **P1-4 Navigation** | Bottom tabs (Destinations, Home, Progress, Settings) plus a stack to Detail, Form, Tour, Quiz |
| **P1-5 Database** | Firebase Firestore collections: `destinations`, `quiz_questions`, `progress`, `quiz_attempts`, `meta` (`src/db/database.js`) |
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
