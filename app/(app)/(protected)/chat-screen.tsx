import colors from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Chat_screen = () => {
  const [message, setMessage] = useState<string>("");

  const handleTextChange = (text: string) => {
    setMessage(text);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        colors={["#2A7B9B", "rgba(106, 185, 8, 0.4)"]}
        style={styles.background}
      >
        <Text>chat_screen</Text>
      </LinearGradient>
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.mediaButton}>
          <Feather name="plus" color={colors.blue} size={24} />
        </TouchableOpacity>
        <TextInput
          value={message}
          onChangeText={(text) => setMessage(text)}
          style={styles.textBox}
        />
        <TouchableOpacity style={styles.mediaButton}>
          {message.length === 0 ? (
            <Feather name="camera" color={colors.blue} size={24} />
          ) : (
            <Feather name="send" color={colors.blue} size={24} />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Chat_screen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  inputContainer: {
    paddingHorizontal: 10,
    minHeight: 60,
    alignItems: "center",
    columnGap: 9,
    flexDirection: "row",
  },
  textBox: {
    flex: 1,
    borderWidth: 1,
    paddingHorizontal: 10,
    borderColor: colors.lightgrey,
    borderRadius: 20,
  },
  mediaButton: {},
});
