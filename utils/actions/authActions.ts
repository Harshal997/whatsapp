import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { child, getDatabase, ref, set } from "firebase/database";
import { getFirebaseApp } from "../firebaseHelper";

export const signUp = async (
  firstName: string,
  lastName: string,
  email: string,
  mobile: string,
) => {
  const app = getFirebaseApp();
  const auth = getAuth(app);

  try {
    const response = await createUserWithEmailAndPassword(auth, email, mobile);
    const { uid } = response.user;
    const userData = await createUser(firstName, lastName, email, uid);
    console.log("userdata", userData);
    console.log("signupRes", response);
  } catch (e) {
    const error = e.code;
    let message = "Something went wrong";
    if (error === "auth/email-already-in-use") {
      message = "This email is already in use";
    }
    console.log("Encountered an error:", e instanceof Error && e.code);
    throw new Error(message);
  }
};

export const signIn = (email: string, mobile: string) => {
  console.log(email, mobile);
};

export const createUser = async (
  firstName: string,
  lastName: string,
  email: string,
  userId: string,
) => {
  const fullName = `${firstName} ${lastName}`.toLowerCase();
  const userData = {
    firstName,
    lastName,
    email,
    userId,
    date: new Date().toISOString(),
  };
  const dbRef = ref(getDatabase());
  const childRef = child(dbRef, `users/${userId}`);
  await set(childRef, userData);
};
