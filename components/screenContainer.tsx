import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  children: React.ReactNode;
  containerStyles?: object;
}

const ScreenContainer = ({ children, containerStyles }: Props) => {
  return (
    <SafeAreaView style={{ ...styles.container, ...containerStyles }}>
      {children}
    </SafeAreaView>
  );
};

export default ScreenContainer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
  },
});
