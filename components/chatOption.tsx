import colors from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface Props {
  icon: any;
  title: string;
  setShowChatOptions: any;
  message: string;
  messageId?: string;
  onPress: (message: string) => Promise<void>;
}

const ChatOption = (props: Props) => {
  return (
    <TouchableOpacity
      onPress={() => props.onPress(props.message)}
      style={styles.container}
    >
      <Text style={styles.text}>{props.title}</Text>
      {props.icon}
    </TouchableOpacity>
  );
};

export default ChatOption;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    // borderBottomWidth: 1,
    borderBottomColor: colors.grey,
    borderStyle: "dashed",
    columnGap: 10,
    alignItems: "center",
    justifyContent: "space-between",
    padding: 4,
    paddingVertical: 5,
  },
  text: {
    color: colors.grey,
    fontFamily: "Roboto-Medium",
  },
});
