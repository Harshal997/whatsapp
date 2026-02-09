import colors from "@/constants/colors";
import { signIn } from "@/utils/actions/authActions";
import { validateInput } from "@/utils/actions/formActions";
import { reducer } from "@/utils/reducers/formReducer";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useReducer } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import Button from "./button";
import Input from "./input";

const initialState = {
  inputValues: {
    email: "",
    mobile: "",
  },
  inputFields: {
    email: false,
    mobile: false,
  },
  formIsValid: false,
};

const SigninForm = () => {
  const router = useRouter();
  const [formState, dispatchFormState] = useReducer(reducer, initialState);
  const onInputChanged = useCallback(
    (inputId: string, inputVal: string) => {
      const res = validateInput(inputId, inputVal);
      dispatchFormState({ inputId, res, inputVal });
    },
    [dispatchFormState],
  );

  const authenticate = () => {
    signIn(formState.inputValues.email, formState.inputValues.mobile);
  };

  return (
    <>
      <Input
        id="email"
        label="Email"
        icon={<MaterialIcons name="email" size={18} color={colors.grey} />}
        autoCapitalize="none"
        keyboardType="email-address"
        error={formState.inputFields["email"]}
        onChangeText={onInputChanged}
      />
      <Input
        id="mobile"
        label="Mobile Number"
        icon={<FontAwesome name="mobile" size={18} color={colors.grey} />}
        keyboardType="numeric"
        maxLength={10}
        error={formState.inputFields["mobile"]}
        onChangeText={onInputChanged}
      />
      <Button
        title="Sign in"
        disabled={!formState.formIsValid}
        onPress={authenticate}
      />
      <Pressable
        style={styles.link}
        onPress={() => router.replace("/(app)/(public)/(auth)/signup")}
      >
        <Text style={styles.linkText}>Switch to Sign in</Text>
      </Pressable>
    </>
  );
};

export default SigninForm;

const styles = StyleSheet.create({
  link: {
    justifyContent: "center",
    alignItems: "center",
  },
  linkText: {
    color: colors.link,
  },
});
