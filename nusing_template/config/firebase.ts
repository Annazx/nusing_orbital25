// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDBGh1OpoHHeQsKLAdDCB7MH-UCxsSvbPY",
  authDomain: "nusing-my-brain.firebaseapp.com",
  projectId: "nusing-my-brain",
  storageBucket: "nusing-my-brain.firebasestorage.app",
  messagingSenderId: "304395979913",
  appId: "1:304395979913:web:61ce5de5a8248ebb3c0a58",
  measurementId: "G-30Q6WK34J1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);