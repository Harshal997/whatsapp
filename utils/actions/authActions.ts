import { authenticate } from "@/store/authSlice";
import * as Device from "expo-device";
import * as Notications from "expo-notifications";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { child, get, getDatabase, ref, set, update } from "firebase/database";
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
      await storePushToken(userData);
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

export const storePushToken = async (userData: any) => {
  if (!Device.isDevice) {
    return;
  }
  const token = await Notications.getExpoPushTokenAsync();
  const tokenData = { ...userData.pushTokens };
  const tokenArray = Object.values(tokenData);
  if (tokenArray.includes(token)) {
    return;
  }
  tokenArray.push(token);
  tokenArray.forEach((token, index) => {
    tokenData[index] = token;
  });
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  const userRef = child(dbRef, `users/${userData.userId}/pushTokens`);
  await set(userRef, tokenData);
};

export const removePushToken = async (userData: any) => {
  if (!Device.isDevice) {
    return;
  }
  try {
    const token = await Notications.getExpoPushTokenAsync();
    const tokenData = await getUserPushTokens(userData.userId);
    if (!Array.isArray(tokenData)) return;

    let foundToken = undefined;

    for (const tok of tokenData) {
      if (tok.data === token.data) {
        foundToken = tok;
        break;
      }
    }

    if (!foundToken) return;

    console.log("found", foundToken);
    const updatedTokenData = tokenData.filter(
      (tok: any) => tok.data !== foundToken.data,
    );

    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const userRef = child(dbRef, `users/${userData.userId}/pushTokens`);
    await set(userRef, updatedTokenData);
  } catch (e) {
    console.log("Error removing push token", e);
  }
};

export const getUserPushTokens = async (userId: string) => {
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  try {
    const userRef = child(dbRef, `users/${userId}/pushTokens`);
    const snapShot = await get(userRef);
    if (snapShot.val()) {
      return snapShot.val();
    }
    return {};
  } catch (e) {
    console.log("error fetching user push notifications", e);
    return [];
  }
};
