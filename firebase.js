// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCSon9EgmibfoV1fMgnQayRD3MAXWiOQQ",
  authDomain: "hspantryapp-a3665.firebaseapp.com",
  projectId: "hspantryapp-a3665",
  storageBucket: "hspantryapp-a3665.appspot.com",
  messagingSenderId: "43995992891",
  appId: "1:43995992891:web:41d64da7fb2f036ec15d1e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { app, firestore };
