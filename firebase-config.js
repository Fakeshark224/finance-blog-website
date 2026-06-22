/* ==========================================================================
   PROSPR — Firebase Configuration
   ==========================================================================

   SETUP INSTRUCTIONS:
   ───────────────────
   1. Go to https://console.firebase.google.com/
   2. Click "Add project" → name it (e.g., "prospr-blog") → create
   3. Click the </> (Web) icon to add a web app
   4. Copy your firebaseConfig object and paste it below
   5. Enable Auth:  Authentication → Sign-in method → Email/Password → Enable
   6. Enable Auth:  Authentication → Settings → Authorized domains → Add "*.vercel.app"
   7. Create DB:    Firestore Database → Create database → Start in test mode
   8. Paste these Firestore security rules in Firestore → Rules tab:

   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       function isAdmin() {
         return request.auth != null && request.auth.token.email == 'sterlingmereholdings@gmail.com';
       }
       match /posts/{postId} {
         allow read: if true;
         allow create: if request.auth != null;
         allow update, delete: if isAdmin() || (request.auth != null && request.auth.uid == resource.data.authorId);
       }
       match /users/{userId} {
         allow read: if true;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
       match /admin_config/{document} {
         allow read, write: if isAdmin();
       }
       match /subscribers/{subId} {
         allow create: if true;
         allow read, delete: if isAdmin();
       }
     }
   }
   ========================================================================== */

// ⚠️  REPLACE THIS WITH YOUR OWN FIREBASE CONFIG
// Get yours from: https://console.firebase.google.com/ → Project Settings → Your apps
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Global references used by auth.js, posts.js, and script.js
const db     = firebase.firestore();
const fbAuth = firebase.auth();
