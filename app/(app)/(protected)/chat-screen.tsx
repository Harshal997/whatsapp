import ChatMessage from "@/components/chatMessages";
import colors from "@/constants/colors";
import { supabase } from "@/supabaseClient";
import {
  createChat,
  generatePrivateKey,
  sendTextMessage,
} from "@/utils/actions/chatActions";
import { getFirebaseApp } from "@/utils/firebaseHelper";
import { imagePicker } from "@/utils/imagePickerHelper";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRouter } from "expo-router";
import { child, getDatabase, onValue, ref, update } from "firebase/database";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
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
  const [tempImgUri, setTempImgUri] = useState("");
  const [newMessageId, setNewMessageId] = useState<string | null>(null);
  const chatUser = useSelector((state) => state.user);
  const user = useSelector((state) => state.auth);
  const privateKey = chatUser.userId
    ? generatePrivateKey(user.userData.userId, chatUser.userId)
    : null;
  const [showChatOptions, setShowChatOptions] = useState<number>(-1);
  const chatsData = useSelector((state) => state.chats);
  // console.log("is id", chatUser.group.groupChatData[0]);
  const [chatId, setChatId] = useState(
    chatUser.group
      ? chatUser.group.groupChatData?.[0]
      : chatsData.privateKeys[privateKey],
  );
  const scrollRef = useRef(null);
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text) {
        return;
      }
      setMessage("");
      try {
        // check group chat first
        const userId1 = user.userData.userId;
        const userId2 = chatUser.userId;
        if (chatUser.group) {
          if (!chatId) {
            const participants = {};

            chatUser.group.users.forEach((user: any) => {
              participants[user.userId] = true;
            });

            console.log("partgroup", participants);
            const chatData = {
              name: chatUser.group.name,
              type: "group",
              participants,
              // privateKey,
              lastMessage: text,
            };
            const id = await createChat(user?.userData, chatData, undefined);
            setChatId(id);
            return;
          } else {
            const chatInfo = await sendTextMessage(
              user?.userData,
              text,
              chatId,
              (replyTo && replyTo.message) ?? undefined,
              (replyTo && replyTo.name) ?? undefined,
              Object.keys(chatUser.group.groupChatData[1].participants),
            );
            setNewMessageId(chatInfo.messageId);
          }
          return;
        }
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
          const id = await createChat(user?.userData, chatData, userId2);
          setChatId(id);
        } else {
          const chatInfo = await sendTextMessage(
            user?.userData,
            text,
            chatId,
            (replyTo && replyTo.message) ?? undefined,
            (replyTo && replyTo.name) ?? undefined,
            [userId1, userId2],
          );
          setNewMessageId(chatInfo.messageId);
        }
      } catch (error) {
        console.log("error in chat", error);
      } finally {
        setMessage("");
        setReplyTo(null);
      }
    },
    [
      user.userData,
      chatUser.userId,
      chatUser.group,
      privateKey,
      chatId,
      replyTo,
    ],
  );

  useEffect(() => {
    console.log("last chat Id", chatId);
    if (!chatId) return;

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

    return () => unsubscribe();
  }, [chatId, dbRef]);

  const getTitle = useCallback(() => {
    if (chatUser?.groupName) return chatUser.groupName;
    if (!chatUser) return "";
    const fullName = chatUser?.firstName + " " + chatUser?.lastName;
    return fullName;
  }, [chatUser]);

  useEffect(() => {
    nav.setOptions({
      headerShown: true,
      headerTitle: getTitle(),
      headerRight: () => (
        <TouchableOpacity
          style={{ zIndex: 2 }}
          onPress={() =>
            chatUser.group
              ? router.navigate("/(app)/(protected)/chat-group-settings")
              : router.navigate("/(app)/(protected)/chat-details")
          }
        >
          <Ionicons name="settings-sharp" size={24} color={colors.blue} />
        </TouchableOpacity>
      ),
    });
  }, [chatUser, getTitle, nav, router]);

  useEffect(() => {
    const storeImage = async () => {
      if (!newMessageId || !tempImgUri) {
        return;
      }
      try {
        const response = await fetch(tempImgUri);
        const arrayBuffer = await response.arrayBuffer();
        console.log("blob is ", arrayBuffer);
        const path = `chat-images/${chatId}/${newMessageId}.jpg`;
        const { data } = supabase.storage.from("chat-media").getPublicUrl(path);

        const imageUrl = data.publicUrl;
        console.log("fetched?", imageUrl);
        await supabase.storage.from("chat-media").upload(path, arrayBuffer);
        console.log("data", data);
        const app = getFirebaseApp();
        const dbRef = ref(getDatabase(app));
        const messageRef = child(dbRef, `messages/${chatId}/${newMessageId}`);
        await update(messageRef, {
          mediaUrl: imageUrl,
        });
        setTempImgUri("");
        setNewMessageId(null);
      } catch (e) {
        console.log("Error storing data", e);
      }
    };
    storeImage();
  }, [chatId, tempImgUri, newMessageId]);

  const handleImagePicker = useCallback(async () => {
    try {
      const tempUri = await imagePicker();
      if (!tempUri) {
        return;
      }
      console.log(tempUri);
      setTempImgUri(tempUri);
    } catch (e) {
      console.log("error picking image", e);
    }
  }, []);

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
          <ChatMessage
            setShowChatOptions={setShowChatOptions}
            index={-1}
            message="Start messaging now"
            chatContainerStyles={{
              marginTop: 70,
            }}
            // chatTextStyles={{
            //   backgroundColor: "rgba(180,240,180,0.97)",
            // }}
          />
        ) : (
          // <Text>hey</Text>
          chatMessages &&
          Object.values(chatMessages ?? []).length && (
            <FlatList
              data={Object.values(chatMessages)}
              contentContainerStyle={{
                paddingVertical: 60,
              }}
              ref={scrollRef}
              // onContentSizeChange={() => scrollRef.current.scrollToEnd()}
              renderItem={({ item, index }: any) => {
                return (
                  <ChatMessage
                    showChatOptions={showChatOptions}
                    setShowChatOptions={setShowChatOptions}
                    system={item.system}
                    index={index}
                    chatId={chatId}
                    messageId={messageIds![index]}
                    mediaUri={item.mediaUrl}
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
                          : item.system
                            ? "center"
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
                    group={chatUser.group}
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
        <TouchableOpacity
          onPress={handleImagePicker}
          style={styles.mediaButton}
        >
          <Feather name="plus" color={colors.blue} size={24} />
        </TouchableOpacity>
        <TextInput
          value={message}
          onChangeText={(text) => setMessage(text)}
          style={styles.textBox}
        />
        <TouchableOpacity
          onPress={async () => {
            await handleSendMessage(message);
            setTempImgUri("");
          }}
          style={styles.mediaButton}
        >
          {message.length === 0 ? (
            <Feather name="camera" color={colors.blue} size={24} />
          ) : (
            <Feather name="send" color={colors.blue} size={24} />
          )}
        </TouchableOpacity>
      </View>
      <Modal
        style={{ backgroundColor: "red" }}
        backdropColor={"red"}
        transparent
        visible={tempImgUri !== ""}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            {tempImgUri && (
              <Image
                resizeMode="contain"
                source={tempImgUri ? { uri: tempImgUri } : null}
                style={styles.uploadImage}
              />
            )}
            <View style={styles.buttonWrapper}>
              <TouchableOpacity
                onPress={() => handleSendMessage("supabase-media-upload")}
                style={[
                  styles.buttonContainer,
                  { backgroundColor: colors.blue },
                ]}
              >
                <Text style={[styles.buttonText, { color: "#FFF" }]}>
                  Send Image
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setTempImgUri("")}
                style={styles.buttonContainer}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalContainer: {
    height: "100%",
    width: "100%",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 100,
  },
  modal: {
    height: 280,
    width: "80%",
    padding: 10,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#FFF",
  },
  buttonWrapper: {
    direction: "ltr",
    flex: 1,
    flexDirection: "row",
    width: "80%",
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonContainer: {
    padding: 10,
    paddingHorizontal: 16,
    elevation: 4,
    backgroundColor: "#FFF",

    borderRadius: 10,
  },
  buttonText: {
    fontFamily: "Roboot-Medium",
    letterSpacing: 0.6,
  },
  uploadImage: {
    height: 180,
    width: 180,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: colors.grey,
  },
  mediaButton: {},
});
