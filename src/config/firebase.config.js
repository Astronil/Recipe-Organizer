// Import the Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// Your web app's Firebase configuration (Replace with actual values)
const firebaseConfig = {
  apiKey: "AIzaSyBhEXY5ATio_B9FYk9NMO5EWW6JuP4gF34",
  authDomain: "recipe-cheker.firebaseapp.com",
  projectId: "recipe-cheker",
  storageBucket: "recipe-cheker.firebasestorage.app",
  messagingSenderId: "422740161285",
  appId: "1:422740161285:web:b2526047aac4c4a6733d6c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db, collection, addDoc, getDocs, deleteDoc, doc };
