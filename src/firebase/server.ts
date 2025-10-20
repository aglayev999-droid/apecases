// IMPORTANT: This file should only be used on the server
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

// This is a server-only file. The service account key is stored in environment variables.
// Do not expose this to the client.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

// Check if the service account is available. This is necessary for server-side operations.
if (!serviceAccount) {
  if (process.env.NODE_ENV === 'production') {
    console.warn(
      'Firebase service account key not found. Server-side features will be disabled.'
    );
  }
}

// Initialize the Firebase Admin SDK if it hasn't been already.
const app =
  getApps().length > 0
    ? getApp()
    : initializeApp({
        credential: serviceAccount ? cert(serviceAccount) : undefined,
        databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
      });

// Export the Firestore instance for use in server-side code.
export const firestore = getFirestore(app);
