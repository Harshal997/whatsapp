import colors from "@/constants/colors";
import { updateUser } from "@/utils/actions/authActions";
import { validateInput } from "@/utils/actions/formActions";
import { reducer } from "@/utils/reducers/formReducer";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
// import Button from "./button";
import Button from "@/components/button";
import Input from "@/components/input";
import ProfileImage from "@/components/profile-image";
import ScreenContainer from "@/components/screenContainer";
import { save } from "@/store/authSlice";
import { logoutUser } from "@/store/authThunk";

const SignupForm = () => {
  const user = useSelector((state) => state.auth.userData);
  console.log("Selector", user);
  const initialState = {
    inputValues: {
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
    },
    inputFields: {
      firstName: undefined,
      lastName: undefined,
      email: undefined,
    },
    formIsValid: false,
  };

  const [formState, dispatchFormState] = useReducer(reducer, initialState);
  console.log("formstate", formState);
  const dispatch = useDispatch();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<null | boolean>(null);
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

  const saveUser = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const firstName = formState.inputValues.firstName;
      const lastName = formState.inputValues.lastName;
      const email = formState.inputValues.email;
      const result = await updateUser(user?.userId, {
        firstName: firstName,
        lastName: lastName,
        email: email,
      });
      dispatch(save({ ...user, firstName, lastName, email }));
      setSuccess(true);
      setError(null);
      setLoading(false);
      await new Promise((resolve) =>
        setTimeout(() => {
          setSuccess(null);
        }, 2000),
      );
    } catch (e) {
      console.log("update error: ", e instanceof Error && e.message);
      setError(e instanceof Error ? e.message : "");
    } finally {
      setLoading(false);
    }
  };
  const router = useRouter();

  const handleLogout = async () => {
    dispatch(logoutUser() as any);
    router.replace("/(app)/(public)/(auth)/login");
  };

  if (!user) {
    return null;
  }

  return (
    <ScreenContainer>
      <Text style={styles.heading}>Settings</Text>
      <ScrollView contentContainerStyle={styles.content}>
        <ProfileImage />
        <Input
          id="firstName"
          label="First Name"
          icon={<FontAwesome name="user-o" size={18} color={colors.grey} />}
          error={formState.inputFields["firstName"]}
          initialValue={user.firstName}
          onChangeText={onInputChanged}
        />
        <Input
          id="lastName"
          label="Last Name"
          icon={<FontAwesome name="user-o" size={18} color={colors.grey} />}
          error={formState.inputFields["lastName"]}
          initialValue={user.lastName}
          onChangeText={onInputChanged}
        />
        <Input
          id="email"
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          icon={<MaterialIcons name="email" size={18} color={colors.grey} />}
          error={formState.inputFields["email"]}
          initialValue={user.email}
          onChangeText={onInputChanged}
        />
        {success && (
          <Text style={{ textAlign: "center", fontFamily: "Roboto-Medium" }}>
            Saved!
          </Text>
        )}
        {loading ? (
          <ActivityIndicator
            color={colors.primary}
            size={"small"}
            style={{ marginVertical: 16 }}
          />
        ) : (
          <Button
            title="Update"
            disabled={!formState.formIsValid}
            onPress={saveUser}
            buttonStyles={{ padding: 20 }}
          />
        )}
        <Button
          title="Logout"
          disabled={false}
          onPress={handleLogout}
          buttonStyles={{ backgroundColor: colors.red, padding: 20 }}
          buttonTextStyles={{ color: "#FFF" }}
        />
      </ScrollView>
    </ScreenContainer>
  );
};

export default SignupForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingBottom: 18,
    backgroundColor: "red",
  },
  heading: {
    fontSize: 32,
    fontFamily: "Roboto-SemiBold",
    marginVertical: 12,
  },
  content: {
    alignItems: "center",
  },
  link: {
    justifyContent: "center",
    alignItems: "center",
  },
  linkText: {
    color: colors.link,
  },
  button: {
    padding: 20,
  },
});
