import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBNaXtT-KK1BwydGIfY6DImoxVXwFAdnQY",
    authDomain: "officialaparda-e85e5.firebaseapp.com",
    projectId: "officialaparda-e85e5",
    storageBucket: "officialaparda-e85e5.firebasestorage.app",
    messagingSenderId: "1023026612327",
    appId: "1:1023026612327:web:7e8868fd360d541b9b2cc2",
    measurementId: "G-5VJHKLKRZG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Analytics is only available in the browser
let analytics = null;
if (typeof window !== "undefined") {
    analytics = getAnalytics(app);
}

export { app, auth, db, analytics };
