import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// In-code Firebase configuration to ensure reliable production builds (e.g. Vercel)
// without dependency on JSON module imports or external bundle paths
export const firebaseConfig = {
  apiKey: "AIzaSyBHQ8t-OyBoKa2l_GKW4mH98SmiVNgcudU",
  authDomain: "planar-binder-vggh3.firebaseapp.com",
  projectId: "planar-binder-vggh3",
  storageBucket: "planar-binder-vggh3.firebasestorage.app",
  messagingSenderId: "653191706748",
  appId: "1:653191706748:web:2ba897aedc332eb0cef1f9",
  firestoreDatabaseId: "ai-studio-allamamart"
};

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore directly with the specified database ID "ai-studio-allamamart"
export const db = getFirestore(app, "ai-studio-allamamart");

export default app;
