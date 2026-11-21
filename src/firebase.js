import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import Config from 'react-native-config';

const firebaseConfig = {
  apiKey: Config.FIREBASE_API_KEY,
  authDomain: Config.FIREBASE_AUTH_DOMAIN,
  projectId: Config.FIREBASE_PROJECT_ID,
  storageBucket: Config.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Config.FIREBASE_MESSAGING_SENDER_ID,
  appId: Config.FIREBASE_APP_ID,
};

const missing = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (missing.length) {
  const msg = `Missing Firebase config: ${missing.join(', ')}. Check your .env FIREBASE_* values.`;
  console.error(msg);
  throw new Error(msg);
}

let app;
try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
} catch (e) {
  const msg = `Firebase initialization failed: ${e?.message || e}`;
  console.error(msg, e);
  throw new Error(msg);
}

let firestore;
try {
  firestore = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
} catch (e) {
  firestore = getFirestore(app);
}

export { firestore };
