import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDgxYmug64YO3bXbps3ekWift1Em37eMXo",
  authDomain: "fir-14615.firebaseapp.com",
  projectId: "fir-14615",
  storageBucket: "fir-14615.firebasestorage.app",
  messagingSenderId: "368138733741",
  appId: "1:368138733741:web:0dac05533ae063c0bcde24",
  measurementId: "G-WHBZ4SR69E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;