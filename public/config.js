/* Firebase web config for this deployment.
 *
 * Firebase console → Project settings → General → Your apps → Web app → Config.
 * These values are public by design; they identify the project, they do not
 * grant access. What protects the board is the Firestore rules plus the fact
 * that every document is encrypted in the browser with your passphrase.
 */
window.FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT",
  storageBucket:     "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
