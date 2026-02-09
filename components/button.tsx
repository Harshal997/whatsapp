import colors from "@/constants/colors";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

interface Props {
  buttonStyles?: object;
  buttonTextStyles?: object;
  title: string;
  disabled: boolean;
}

const Button = (props: Props & TouchableOpacityProps) => {
  return (
    <TouchableOpacity
      {...props}
      style={
        !props.disabled
          ? { ...styles.button, ...props.buttonStyles }
          : { ...styles.button, backgroundColor: colors.lightgrey }
      }
    >
      <Text
        style={
          !props.disabled
            ? { ...styles.buttonText, ...props.buttonTextStyles }
            : { ...styles.buttonText, color: colors.grey }
        }
      >
        {props.title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    marginVertical: 16,
  },
  buttonText: {
    fontFamily: "Roboto-Medium",
    color: "#FFF",
    letterSpacing: 0.3,
  },
});
