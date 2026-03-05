import ChatMessage from "@/components/chatMessages";
import colors from "@/constants/colors";
import {
  createChat,
  generatePrivateKey,
  sendTextMessage,
} from "@/utils/actions/chatActions";
import { getFirebaseApp } from "@/utils/firebaseHelper";
import { Feather, Ionicons, Octicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRouter } from "expo-router";
import { child, getDatabase, off, onValue, ref } from "firebase/database";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const Chat_screen = () => {
  const router = useRouter();
  const nav = useNavigation();
  const [message, setMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState(null);
  const [messageIds, setMessageIds] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const chatUser = useSelector((state) => state.user);
  const user = useSelector((state) => state.auth);
  const privateKey = generatePrivateKey(user.userData.userId, chatUser.userId);
  const [showChatOptions, setShowChatOptions] = useState<number>(-1);
  const chatsData = useSelector((state) => state.chats);
  const chatId = chatsData.privateKeys[privateKey];
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text) {
        return;
      }
      setMessage("");
      try {
        const userId1 = user.userData.userId;
        const userId2 = chatUser.userId;
        const chatData = {
          type: "private",
          participants: {
            [userId1]: true,
            [userId2]: true,
          },
          privateKey,
          lastMessage: text,
        };
        if (!chatId) {
          await createChat(user?.userData?.userId, chatData, userId2);
        } else {
          await sendTextMessage(
            userId1,
            text,
            chatId,
            replyTo.message,
            replyTo.name,
          );
        }
      } catch (error) {
        console.log("error creating chat", error);
      } finally {
        setMessage("");
        setReplyTo(null);
      }
    },
    [user.userData.userId, chatUser.userId, privateKey, chatId, replyTo],
  );

  useEffect(() => {
    const messagesRef = child(dbRef, `messages/${chatId}`);

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setChatMessages(null);
        return;
      }
      setMessageIds(Object.keys(data));
      setChatMessages(data);
    });

    return () => off(messagesRef);
  }, [chatId, dbRef]);

  useEffect(() => {
    nav.setOptions({
      headerTitle: getTitle(),
      headerRight: () => (
        <Pressable onPress={() => router.push("/(app)/(protected)/new-chat")}>
          <Octicons name="plus" size={24} />
        </Pressable>
      ),
    });
  }, [chatUser, nav, router]);

  const getTitle = () => {
    if (!chatUser) return "";
    const fullName = chatUser?.firstName + " " + chatUser?.lastName;
    return fullName;
  };

  return (
    <SafeAreaView
      onStartShouldSetResponder={() => {
        setShowChatOptions(-1);
        return true;
      }}
      style={styles.container}
    >
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        colors={["#2A7B9B", "rgba(106, 185, 8, 0.4)"]}
        style={styles.background}
      >
        {!chatId ? (
          <ChatMessage index={-1} message="Start messaging now" />
        ) : (
          chatMessages &&
          Object.values(chatMessages ?? []).length && (
            <FlatList
              data={Object.values(chatMessages)}
              contentContainerStyle={{
                paddingBottom: 70,
              }}
              renderItem={({ item, index }: any) => {
                return (
                  <ChatMessage
                    showChatOptions={showChatOptions}
                    setShowChatOptions={setShowChatOptions}
                    index={index}
                    chatId={chatId}
                    messageId={messageIds![index]}
                    message={item.message}
                    sentBy={item.sentBy}
                    repliedToName={item.replyToName}
                    repliedToMessage={item.replyToMessage}
                    setReplyTo={setReplyTo}
                    sentAt={item.sentAt}
                    chatContainerStyles={{
                      alignItems:
                        item.sentBy === user?.userData.userId
                          ? "flex-end"
                          : "flex-start",
                      marginHorizontal: 16,
                      maxWidth: "90%",
                    }}
                    chatTextStyles={{
                      backgroundColor:
                        item.sentBy === user?.userData.userId
                          ? "rgba(180,240,180,0.97)"
                          : "rgba(243,243,243,0.92)",
                    }}
                  />
                );
              }}
            />
          )
        )}
      </LinearGradient>
      {replyTo && (
        <View style={styles.replyToWrapper}>
          <View style={styles.replyToContainer}>
            <Text
              style={[
                styles.replyToText,
                {
                  color: colors.blue,
                  fontFamily: "Roboto-Medium",
                  fontSize: 16,
                },
              ]}
            >
              {replyTo.name}
            </Text>
            <Text style={styles.replyToText}>{replyTo.message}</Text>
          </View>
          <Ionicons
            onPress={() => setReplyTo(null)}
            name="close-circle"
            size={20}
            color={colors.blue}
          />
        </View>
      )}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.mediaButton}>
          <Feather name="plus" color={colors.blue} size={24} />
        </TouchableOpacity>
        <TextInput
          value={message}
          onChangeText={(text) => setMessage(text)}
          style={styles.textBox}
        />
        <TouchableOpacity
          onPress={() => handleSendMessage(message)}
          style={styles.mediaButton}
        >
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
  newChatContainer: {
    alignItems: "flex-end",
    marginTop: 12,
    // backgroundColor: colors.beige,
  },
  newChatText: {
    color: "#222",
    borderRadius: 4,
    padding: 4,
    backgroundColor: colors.beige,
  },
  replyToWrapper: {
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    justifyContent: "space-between",
  },
  replyToContainer: {
    backgroundColor: "#FFF",
  },
  replyToText: {
    fontSize: 12,
    fontFamily: "Roboto-Light",
  },
  mediaButton: {},
});
