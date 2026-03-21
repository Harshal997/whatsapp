import colors from "@/constants/colors";
import getUser from "@/utils/actions/getUser";
import { formatHour } from "@/utils/dateUtils";
import { getFirebaseApp } from "@/utils/firebaseHelper";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { child, get, getDatabase, ref, remove, set } from "firebase/database";
import React, { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import ChatOption from "./chatOption";

interface Props {
  chatId?: string;
  messageId?: string;
  mediaUri?: string;
  message: string;
  sentBy?: string;
  repliedToName?: string;
  repliedToMessage?: string;
  setReplyTo?: any;
  sentAt?: string;
  index: number;
  chatContainerStyles?: object;
  chatTextStyles?: object;
  showChatOptions?: number;
  setShowChatOptions?: any;
  group?: boolean;
  system?: boolean;
}

const ChatMessage = ({
  index,
  chatId,
  messageId,
  mediaUri,
  message,
  sentBy,
  setReplyTo,
  repliedToName,
  repliedToMessage,
  sentAt,
  chatContainerStyles,
  chatTextStyles,
  showChatOptions,
  setShowChatOptions,
  group,
  system,
}: Props) => {
  const user = useSelector((state) => state.auth);
  const chatsData = useSelector((state) => state.chats);
  const isStarred = !!chatsData.userStarredMessages?.[chatId]?.[messageId];
  const [userData, setUserData] = useState(new Map());
  console.log("chat", index);
  const handleCopyAction = async (message: string) => {
    await Clipboard.setStringAsync(message);
    setShowChatOptions(false);
  };

  const handleStarMessage = async (message: string) => {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const childRef = child(
      dbRef,
      `starred-messages/${user.userData.userId}/${chatId}/${messageId}`,
    );
    const snapshot = await get(childRef);
    console.log("exists", snapshot.exists());
    if (snapshot.exists()) {
      await remove(childRef);
    } else {
      const data = {
        messageId,
        chatId,
        starredAt: new Date().toISOString(),
      };
      await set(childRef, data);
    }
    setShowChatOptions(false);
  };

  const handleAddReply = async (
    chatId: string,
    messageId: string,
    sentBy: string,
    message: string,
  ) => {
    const user = await getUser(sentBy);
    console.log(user);
    setReplyTo({
      name: `${user.firstName}`,
      chatId,
      messageId,
      sentBy,
      message,
    });
    setShowChatOptions(false);
  };
  mediaUri && console.log("media", mediaUri);

  useEffect(() => {
    if (userData.has(sentBy ?? "")) return;
    const fetchUserData = async () => {
      if (sentBy) {
        const userDetails = await getUser(sentBy);
        setUserData((prev) => new Map(prev).set(sentBy, userDetails));
      }
    };
    fetchUserData();
  }, [sentBy, userData]);

  return (
    <Pressable
      onPress={() => setShowChatOptions?.(-1)}
      onLongPress={() => setShowChatOptions?.(index)}
      style={{ ...styles.newChatContainer, ...chatContainerStyles }}
    >
      <View style={{ ...chatTextStyles }}>
        {group && sentBy && (
          <View style={styles.name}>
            <Text style={styles.nameText}>
              {sentBy === user.userData.userId
                ? "You"
                : userData.get(sentBy)?.firstName +
                  " " +
                  userData.get(sentBy)?.lastName}
            </Text>
          </View>
        )}
        {mediaUri && (
          <Image
            source={{ uri: mediaUri }}
            style={styles.media}
            resizeMode="contain"
          />
        )}
        {repliedToName && (
          <View style={styles.replyToWrapper}>
            <Text
              style={[
                styles.replyToText,
                { fontFamily: "Roboto-Medium", color: colors.blue },
              ]}
            >
              {repliedToName}
            </Text>
            <Text style={styles.replyToText}>{repliedToMessage}</Text>
          </View>
        )}
        <Text style={{ ...styles.newChatText, ...chatTextStyles }}>
          {message}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 3,
            alignSelf: "flex-end",
          }}
        >
          {isStarred && <Ionicons name={"star"} size={10} color={"#333"} />}
          {sentAt && !system && (
            <Text
              style={{
                ...styles.newChatText,
                ...chatTextStyles,
                color: colors.grey,
                fontSize: 10,
                textAlign: "right",
              }}
            >
              {sentAt ? formatHour(sentAt ?? "") : null}
            </Text>
          )}
        </View>
      </View>
      {showChatOptions === index && (
        <View style={styles.optionsContainer}>
          <ChatOption
            title="Copy"
            icon={<Ionicons name="copy" size={12} color={colors.grey} />}
            setShowChatOptions={setShowChatOptions}
            message={message}
            onPress={handleCopyAction}
          />
          <ChatOption
            title={isStarred ? "Unstar Message" : "Star Message"}
            icon={
              <Ionicons
                name={isStarred ? "star-outline" : "star"}
                size={12}
                color={colors.grey}
              />
            }
            setShowChatOptions={setShowChatOptions}
            message={message}
            onPress={handleStarMessage}
          />
          <ChatOption
            title="Replay"
            icon={
              <Ionicons name="return-up-back" size={20} color={colors.grey} />
            }
            setShowChatOptions={setShowChatOptions}
            message={message}
            messageId={messageId}
            onPress={async () =>
              handleAddReply(chatId, messageId, sentBy, message)
            }
          />
        </View>
      )}
    </Pressable>
  );
};

export default React.memo(ChatMessage);

const styles = StyleSheet.create({
  newChatContainer: {
    alignItems: "center",
    marginTop: 12,
  },
  newChatText: {
    color: "#222",
    borderRadius: 4,
    padding: 4,
    backgroundColor: colors.beige,
  },
  optionsContainer: {
    backgroundColor: "#FFF",
    borderRadius: 5,
    width: 140,
    padding: 10,
  },
  replyToWrapper: {
    backgroundColor: "#FFF",
    opacity: 0.8,
    padding: 8,
    justifyContent: "space-between",
  },
  replyToContainer: {
    backgroundColor: "#FFF",
  },
  replyToText: {
    fontSize: 12,
    fontFamily: "Roboto-Light",
  },
  media: {
    height: 150,
    width: 150,
  },
  name: {
    padding: 4,
    paddingBottom: 0,
  },
  nameText: {
    fontFamily: "Roboto-Medium",
    fontSize: 12,
    color: colors.blue,
  },
});
