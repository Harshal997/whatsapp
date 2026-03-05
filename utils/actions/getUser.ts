import {
  child,
  endAt,
  get,
  getDatabase,
  orderByChild,
  query,
  ref,
  startAt,
} from "firebase/database";
import { getFirebaseApp } from "../firebaseHelper";

export default async function getUser(userId: string) {
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  const childRef = child(dbRef, `users/${userId}`);
  const snapshot = await get(childRef);
  console.log("snapshot", snapshot);
  return snapshot.val();
}

export const searchUsers = async (search: string) => {
  const searchTerm = search.toLowerCase();
  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const userRef = child(dbRef, `users`);

    const queryRef = query(
      userRef,
      orderByChild("firstName"),
      startAt(searchTerm),
      endAt(searchTerm + "\uf8ff"),
    );
    const snapshot = await get(queryRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
