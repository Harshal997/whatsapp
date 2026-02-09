import ScreenContainer from "@/components/screenContainer";
import SignupForm from "@/components/sign-up-form";
import React from "react";
import { Image, ScrollView, StyleSheet } from "react-native";

const login = () => {
  return (
    <ScreenContainer>
      <ScrollView style={{ flex: 1, paddingBottom: 20 }}>
        <Image
          source={require("../../../../assets/images/logo.jpg")}
          style={styles.image}
        />
        <SignupForm />
      </ScrollView>
    </ScreenContainer>
  );
};

export default login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontFamily: "Roboto-Black",
  },
  image: {
    height: 200,
    width: "100%",
  },
});
