import { useRouter } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Chats = () => {
  const router = useRouter();
  return (
    <SafeAreaView>
      <Text>Chats</Text>
      <Button
        title="open chat screen"
        onPress={() => router.push("/(app)/(protected)/chat_screen")}
      />
    </SafeAreaView>
  );
};

export default Chats;

const styles = StyleSheet.create({});
