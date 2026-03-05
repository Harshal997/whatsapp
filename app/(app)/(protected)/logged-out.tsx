import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

const LoggedOut = () => {
  const router = useRouter();
  useEffect(() => {
    router.navigate("/(app)/(public)/(auth)/login");
  }, []);
  return (
    <View>
      <Text>LoggedOut</Text>
    </View>
  );
};

export default LoggedOut;

const styles = StyleSheet.create({});
