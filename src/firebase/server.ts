// IMPORTANT: This file should only be used on the server
import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

let app: App | undefined;
let firestore: Firestore | undefined;

try {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined;

  if (serviceAccount) {
    app = getApps().length
      ? getApp()
      : initializeApp({
          credential: cert(serviceAccount),
          databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
        });

    firestore = getFirestore(app);
  } else {
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        'Firebase service account key not found. Server-side features will be disabled.'
      );
    }
  }
} catch (error) {
  console.error("Failed to initialize Firebase Admin SDK:", error);
}


export { firestore };
