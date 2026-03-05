import colors from "@/constants/colors";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

interface Props {
  label: string;
  icon: any;
  error: string;
  id: string;
  initialValue?: string;
  onChangeText: (inputId: string, inputVal: string) => void;
}

const Input = (props: Props & TextInputProps) => {
  const [value, setValue] = useState(props.initialValue ?? "");
  const onInputChange = (text: string) => {
    setValue(text);
    props.onChangeText(props.id, text);
  };
  return (
    <View>
      <Text style={styles.lable}>{props.label}</Text>
      <View style={{ ...styles.inputContainer }}>
        {props.icon}
        <TextInput
          {...props}
          onChangeText={onInputChange}
          value={value}
          style={styles.inputStyle}
        />
      </View>
      {props.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{props.error[0]}</Text>
        </View>
      )}
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  inputContainer: {
    width: "100%",
    backgroundColor: colors.nearlyWhite,
    // elevation: 1,
    borderRadius: 2,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  lable: {
    color: colors.textColor,
    fontFamily: "Roboto-Bold",
    marginVertical: 8,
    letterSpacing: 0.4,
    fontSize: 16,
  },
  inputStyle: {
    flex: 1,
    color: colors.textColor,
    letterSpacing: 0.3,
    fontFamily: "Roboto-Regular",
  },
  errorContainer: {
    marginVertical: 8,
  },
  errorText: {
    color: "rgba(200, 55, 50, 0.9)",
    fontFamily: "Roboto-Regular",
    letterSpacing: 0.3,
    fontSize: 16,
  },
});
