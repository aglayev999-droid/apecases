// IMPORTANT: This file should only be used on the server
import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

let app: App | undefined;
let firestore: Firestore | undefined;

try {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    const serviceAccount = JSON.parse(serviceAccountKey);
    
    if (getApps().length === 0) {
      app = initializeApp({
        credential: cert(serviceAccount),
        databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
      });
    } else {
      app = getApp();
    }
    
    firestore = getFirestore(app);

  } else {
    // This will be logged on the server, not visible to the client.
    console.warn(
      'Firebase Admin SDK service account key is not set in environment variables. Server-side features requiring auth will be disabled.'
    );
  }
} catch (error) {
  console.error("Failed to initialize Firebase Admin SDK:", error);
}

export { firestore };
