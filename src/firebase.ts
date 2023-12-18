// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAq9UzNTDKO0iGFJzZY57Wxan-PKYao11E",
  authDomain: "nwitter-reloaded-8e6a0.firebaseapp.com",
  projectId: "nwitter-reloaded-8e6a0",
  storageBucket: "nwitter-reloaded-8e6a0.appspot.com",
  messagingSenderId: "1036660182750",
  appId: "1:1036660182750:web:9d3bf5d46e047fc030bc4f",
  measurementId: "G-Y65DDRQNP5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);

export const storage = getStorage(app);

export const db = getFirestore(app);
