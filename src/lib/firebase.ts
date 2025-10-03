import { initializeApp, getApp, getApps } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCIVcMNlGKus7mEBJjJf--epN7AGLFh1CY",
  authDomain: "aicampus4u-cd32d.firebaseapp.com",
  projectId: "aicampus4u-cd32d",
  storageBucket: "aicampus4u-cd32d.firebasestorage.app",
  messagingSenderId: "1011906376655",
  appId: "1:1011906376655:web:f0d7a30fbe139399b818ba",
  measurementId: "G-Z68GRDGFNP"
};


// // Initialize Firebase
// const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
// const auth = getAuth(app);
// export { app, auth };

// New Initialize Firebase with google signin/up
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const signInWithGoogle = () => signInWithPopup(auth, provider);
export const logout = () => signOut(auth);
