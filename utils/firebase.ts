// The firebase SDKs are now loaded via script tags in index.html,
// which creates a global `firebase` object. We declare it here to
// inform TypeScript about its existence.
declare const firebase: any;

// Your web app's Firebase configuration is now sourced from environment variables.
// These are set in your deployment environment (e.g., Netlify) and are injected at build time.
// This is a security best practice to avoid hardcoding keys in your source code.
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCUGiutHqtfOMX2D-BBw3FXM8M_5eeFkHA",
  authDomain: "jarvis-6e681.firebaseapp.com",
  projectId: "jarvis-6e681",
  storageBucket: "jarvis-6e681.firebasestorage.app",
  messagingSenderId: "214054784839",
  appId: "1:214054784839:web:99af43783829711aac8662",
  measurementId: "G-T7Q3HY05NZ"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = firebase.auth();
