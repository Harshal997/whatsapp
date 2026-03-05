import colors from "@/constants/colors";
import { signIn } from "@/utils/actions/authActions";
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
import { useDispatch } from "react-redux";
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
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState<boolean>(false);
  const onInputChanged = useCallback(
    (inputId: string, inputVal: string) => {
      const res = validateInput(inputId, inputVal);
      dispatchFormState({ inputId, res, inputVal });
    },
    [dispatchFormState],
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (!error) return;
    error && Alert.alert("Error encountered", error!);
    setError(null);
  }, [error]);

  const authenticate = async () => {
    setLoading(true);
    try {
      const action = await signIn(
        formState.inputValues.email,
        formState.inputValues.mobile,
      );
      await dispatch(action);
      setError(null);
      router.replace("/(app)/(protected)/(chat)/chats");
    } catch (e) {
      console.log("signin error: ", e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
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
