import { authenticate } from "@/store/authSlice";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { child, getDatabase, ref, set, update } from "firebase/database";
import { getFirebaseApp } from "../firebaseHelper";
import getUser from "./getUser";

export const signUp = (
  firstName: string,
  lastName: string,
  email: string,
  mobile: string,
) => {
  return async (dispatch: any) => {
    const app = getFirebaseApp();
    const auth = getAuth(app);

    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        mobile,
      );
      const { uid, stsTokenManager } = response.user;
      const { accessToken, expirationTime } = stsTokenManager;
      const expiryDate = new Date(expirationTime);
      const userData = await createUser(firstName, lastName, email, uid);

      dispatch(
        authenticate({
          token: accessToken,
          userData,
          tokenExpiryDate: expiryDate,
        }),
      );
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
};

export const signIn = (email: string, mobile: string) => {
  return async (dispatch: any) => {
    const app = getFirebaseApp();
    const auth = getAuth(app);

    try {
      const response = await signInWithEmailAndPassword(auth, email, mobile);
      const { uid, stsTokenManager } = response.user;
      const { accessToken, expirationTime } = stsTokenManager;
      const expiryDate = new Date(expirationTime);
      const userData = await getUser(uid);
      console.log("userdatasignin", userData);
      dispatch(
        authenticate({
          token: accessToken,
          userData,
          tokenExpiryDate: expiryDate,
        }),
      );
      console.log("signinRes", response);
    } catch (e) {
      const error = e.code;
      let message = "Something went wrong";
      if (
        error === "auth/invalid-credential" ||
        error === "auth/user-not-found"
      ) {
        message = "The username or password is incorrect";
      }
      console.log("Encountered an error:", e instanceof Error && e.code);
      throw new Error(message);
    }
  };
};

export const updateUser = async (userId: string, newData: any) => {
  console.log("newdata", newData);
  const dbRef = ref(getDatabase());
  const childRef = child(dbRef, `/users/${userId}`);
  await update(childRef, newData);
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
    fullName,
    email,
    userId,
    date: new Date().toISOString(),
  };
  const dbRef = ref(getDatabase());
  const childRef = child(dbRef, `users/${userId}`);
  await set(childRef, userData);
  return userData;
};
