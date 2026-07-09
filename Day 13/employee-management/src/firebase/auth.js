import {
  auth,
  googleProvider,
  db,
} from "./firebaseConfig";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";

import {
  doc,
  setDoc,
} from "firebase/firestore";

export const registerUser = async (
  firstName,
  lastName,
  email,
  phone,
  password
) => {

  const userCredential =
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

  await setDoc(
    doc(db, "users", userCredential.user.uid),
    {
      uid: userCredential.user.uid,
      firstName,
      lastName,
      email,
      phone,
      role: "Admin",
      createdAt: new Date().toISOString(),
    }
  );

  return userCredential;
};

export const loginUser = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const googleLogin = () =>
  signInWithPopup(auth, googleProvider);

export const resetPassword = (email) =>
  sendPasswordResetEmail(auth, email);

export const logoutUser = () =>
  signOut(auth);