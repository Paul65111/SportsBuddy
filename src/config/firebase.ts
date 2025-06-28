// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC44nrAsvC7I9yEwzyxS4AsFr3zoXnPLvw",
  authDomain: "sportsbuddy-3db70.firebaseapp.com",
  projectId: "sportsbuddy-3db70",
  storageBucket: "sportsbuddy-3db70.firebasestorage.app",
  messagingSenderId: "586362534879",
  appId: "1:586362534879:web:7e95caba106cf57a76226a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
export { storage };
export const firebaseApp=app;
export const db = getFirestore(firebaseApp);
export const auth = getAuth();