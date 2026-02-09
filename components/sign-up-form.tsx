import colors from "@/constants/colors";
import { signUp } from "@/utils/actions/authActions";
import { validateInput } from "@/utils/actions/formActions";
import { reducer } from "@/utils/reducers/formReducer";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";
import Button from "./button";
import Input from "./input";

const initialState = {
  inputValues: {
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
  },
  inputFields: {
    firstName: false,
    lastName: false,
    email: false,
    mobile: false,
  },
  formIsValid: false,
};

const SignupForm = () => {
  const [formState, dispatchFormState] = useReducer(reducer, initialState);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const onInputChanged = useCallback(
    (inputId: string, inputVal: string) => {
      const res = validateInput(inputId, inputVal);
      dispatchFormState({ inputId, res, inputVal });
    },
    [dispatchFormState],
  );

  useEffect(() => {
    if (!error) return;
    error && Alert.alert("Error encountered", error!);
    setError(null);
  }, [error]);

  const authenticate = async () => {
    try {
      setLoading(true);
      await signUp(
        formState.inputValues.firstName,
        formState.inputValues.lastName,
        formState.inputValues.email,
        formState.inputValues.mobile,
      );
      setError(null);
    } catch (e) {
      console.log("signup error: ", e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const router = useRouter();
  return (
    <>
      <Input
        id="firstName"
        label="First Name"
        icon={<FontAwesome name="user-o" size={18} color={colors.grey} />}
        error={formState.inputFields["firstName"]}
        onChangeText={onInputChanged}
      />
      <Input
        id="lastName"
        label="Last Name"
        icon={<FontAwesome name="user-o" size={18} color={colors.grey} />}
        error={formState.inputFields["lastName"]}
        onChangeText={onInputChanged}
      />
      <Input
        id="email"
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        icon={<MaterialIcons name="email" size={18} color={colors.grey} />}
        error={formState.inputFields["email"]}
        onChangeText={onInputChanged}
      />
      <Input
        id="mobile"
        label="Mobile Number"
        icon={<FontAwesome name="mobile" size={18} color={colors.grey} />}
        error={formState.inputFields["mobile"]}
        keyboardType="numeric"
        maxLength={10}
        onChangeText={onInputChanged}
      />
      {loading ? (
        <ActivityIndicator
          color={colors.primary}
          size={"small"}
          style={{ marginVertical: 16 }}
        />
      ) : (
        <Button
          title="Sign up"
          disabled={!formState.formIsValid}
          onPress={authenticate}
        />
      )}
      <Pressable
        style={styles.link}
        onPress={() => router.replace("/(app)/(public)/(auth)/login")}
      >
        <Text style={styles.linkText}>Switch to Sign in</Text>
      </Pressable>
    </>
  );
};

export default SignupForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingBottom: 18,
    backgroundColor: "red",
  },
  link: {
    justifyContent: "center",
    alignItems: "center",
  },
  linkText: {
    color: colors.link,
  },
});
