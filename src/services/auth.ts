import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { firebaseApp } from "../config/firebase";  // This is where you initialize Firebase

const auth = getAuth(firebaseApp);  // Pass the initialized app to getAuth

export const signUp = async (email: string, password: string) => {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    console.error("SignUp Error:", error.message);
    throw error;  // Re-throw so we can catch it in the screen component
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    console.error("SignIn Error:", error.message);
    throw error;  // Re-throw so we can catch it in the screen component
  }
};
