import { initializeApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyDBGh1OpoHHeQsKLAdDCB7MH-UCxsSvbPY",
  authDomain: "nusing-my-brain.firebaseapp.com",
  projectId: "nusing-my-brain",
  storageBucket: "nusing-my-brain.firebasestorage.app",
  messagingSenderId: "304395979913",
  appId: "1:304395979913:web:61ce5de5a8248ebb3c0a58",
  measurementId: "G-30Q6WK34J1",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
