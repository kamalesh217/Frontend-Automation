import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCdy0kHgzenFuj0khklnHPtmJPT_OZr9-M",
  authDomain: "employeepro-4b6c4.firebaseapp.com",
  projectId: "employeepro-4b6c4",
  storageBucket: "employeepro-4b6c4.firebasestorage.app",
  messagingSenderId: "433973596654",
  appId: "1:433973596654:web:787f323f5f4f7d8a99feff"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();