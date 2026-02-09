import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import * as Splashscreen from "expo-splash-screen";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

Splashscreen.preventAutoHideAsync();

const Index = () => {
  const router = useRouter();
  const [appLoaded, setAppLoaded] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);

  const [loaded] = useFonts({
    "Roboto-ExtraLight": require("../assets/fonts/Roboto-ExtraLight.ttf"),
    "Roboto-Light": require("../assets/fonts/Roboto-Light.ttf"),
    "Roboto-Thin": require("../assets/fonts/Roboto-Thin.ttf"),
    "Roboto-Regular": require("../assets/fonts/Roboto-Regular.ttf"),
    "Roboto-Medium": require("../assets/fonts/Roboto-Medium.ttf"),
    "Roboto-SemiBold": require("../assets/fonts/Roboto-SemiBold.ttf"),
    "Roboto-Bold": require("../assets/fonts/Roboto-Bold.ttf"),
    "Roboto-Black": require("../assets/fonts/Roboto-Black.ttf"),
    "Roboto-MediumItalic": require("../assets/fonts/Roboto-MediumItalic.ttf"),
  });

  console.log("loaded", loaded);

  useEffect(() => {
    if (loaded) {
      setAppLoaded(true);
    }
  }, [loaded]);

  const handleNavigation = async () => {
    // await new Promise((resolve) => setTimeout(() => resolve, 2000));
    await Splashscreen.hideAsync();
    if (true) {
      router.replace("/(app)/(public)/(auth)/login");
      return;
    }
  };

  const hasAppLoaded = useCallback(async () => {
    if (appLoaded) {
      handleNavigation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appLoaded]);

  if (!appLoaded) {
    return <ActivityIndicator />;
  }

  return (
    <SafeAreaView onLayout={hasAppLoaded}>
      <Text>Index</Text>
    </SafeAreaView>
  );
};

export default Index;

const styles = StyleSheet.create({});
