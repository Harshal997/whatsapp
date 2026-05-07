import { persistor, store } from "@/store/store";
import { registerForPushNotificationsAsync } from "@/utils/notificationUtils";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

export default function RootLayout() {
  // const userState = useSelector((state) => state.auth);
  const [expoPushToken, setExpoPushToken] = useState("");
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>(
    [],
  );
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) => token && console.log("expo-token", token),
    );

    if (Platform.OS === "android") {
      Notifications.getNotificationChannelsAsync().then((value) =>
        setChannels(value ?? []),
      );
    }
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      },
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
        const { data } = response.notification.request.content;
        const chatId = data["chatId"];
        if (chatId) {
          console.log("chatId", chatId);
        } else {
          console.log("No chatId sent with the notification");
        }
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);
  console.log("root layout");
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {/* <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected
            guard={userState && userState.token && userState.userData}
          >
            <Stack.Screen name="(protected)" />
          </Stack.Protected>
          <Stack.Protected guard={!userState || !userState.token}>
            <Stack.Screen name="(public)" />
          </Stack.Protected>
        </Stack> */}
        <Stack screenOptions={{ headerShown: false }} />
      </PersistGate>
    </Provider>
  );
}
