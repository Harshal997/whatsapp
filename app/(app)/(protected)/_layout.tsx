import colors from "@/constants/colors";
import { storeAllChats } from "@/store/chatsSlice";
import { getFirebaseApp } from "@/utils/firebaseHelper";
import { Redirect, Stack } from "expo-router";
import { getDatabase, off, onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function StackLayout() {
  const userState = useSelector((state) => state.auth);
  const userId = userState?.userData?.userId;
  const dispatch = useDispatch();
  const [messagesRef, setMessagesRef] = useState(null);

  useEffect(() => {
    console.log("Subscribing to firebase listeners");
    if (!userId) return;
    const app = getFirebaseApp();
    const db = getDatabase(app);
    const dbRef = ref(getDatabase(app));

    const chatsRef = ref(db, `chats/${userId}`);
    const privateChatsRef = ref(db, `private-chats`);
    const userStarredMessages = ref(db, `starred-messages/${userId}`);

    let chatsData: any = null;
    let privateKeysData: any = null;
    let starredMessages: any = null;

    const maybeDispatch = () => {
      // if (chatsData !== null && privateKeysData !== null) {
      // console.log("Dispatching chats data to store", {
      //   chatsData,
      //   privateKeysData,
      //   starredMessages,
      // });
      dispatch(
        storeAllChats({
          chats: chatsData,
          privateKeys: privateKeysData,
          starredMessages: starredMessages,
        }),
      );
      // }
    };

    onValue(chatsRef, (snapshot) => {
      chatsData = snapshot.val() || {};
      maybeDispatch();
    });

    onValue(privateChatsRef, (snapshot) => {
      privateKeysData = snapshot.val() || {};
      maybeDispatch();
    });
    onValue(userStarredMessages, (snapshot) => {
      starredMessages = snapshot.val() || {};
      maybeDispatch();
    });

    return () => {
      console.log("Unsubscribing firebase listeners");
      off(chatsRef);
      off(privateChatsRef);
    };
  }, [dispatch, userId]);

  if (!userState) {
    return <Redirect href={"/(app)/(public)/(auth)/login"} />;
  }
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected
        guard={userState && userState.token && userState.userData}
      >
        <Stack.Screen
          name="chat-screen"
          options={{
            headerShown: true,
            headerBackButtonDisplayMode: "minimal",
            headerTitleStyle: { color: colors.blue },
            headerTransparent: true,
            headerStyle: { backgroundColor: "rgba(240,240,245,0.95)" },
            statusBarStyle: "dark",
          }}
        />
        <Stack.Screen
          name="new-chat"
          options={{
            presentation: "fullScreenModal",
            animation: "fade_from_bottom",
            // headerShown: false,
          }}
        />
        <Stack.Screen
          name="chat-details"
          options={{
            animation: "fade_from_bottom",
            // headerShown: false,
          }}
        />
      </Stack.Protected>
    </Stack>
  );
}
