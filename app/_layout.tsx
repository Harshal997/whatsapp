import { persistor, store } from "@/store/store";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

export default function RootLayout() {
  // const userState = useSelector((state) => state.auth);
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
