import Button from "@/components/button";
import ChatRow from "@/components/chat-row";
import ScreenContainer from "@/components/screenContainer";
import { supabase } from "@/supabaseClient";
import {
  removeUserFromChat,
  removeUserFromParticipants,
} from "@/utils/actions/chatActions";
import getUser from "@/utils/actions/getUser";
import { getFirebaseApp } from "@/utils/firebaseHelper";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { getDatabase, onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSelector } from "react-redux";

const ChatDetails = () => {
  const params = useGlobalSearchParams();
  const router = useRouter();
  console.log("chat details params", params);
  const user = useSelector((state) => state.auth.userData);
  const chatUser = useSelector((state) => state.user);
  console.log(
    "chat user in chat details",
    chatUser?.group?.groupChatData?.[1].participants,
  );
  const [profileUser, setProfileUser] = useState({});
  const displayUser = params?.userId ? profileUser : chatUser;
  const chatsData = useSelector((state) => state.chats);
  const [loggedInUserChatIds, setLoggedInUserChatIds] = useState(
    chatsData.chats ? Object.keys(chatsData.chats) : [],
  );
  const [chatUserChatIds, setChatUserChatIds] = useState<string[]>([]);
  const [commonChatId, setCommonChatId] = useState<string[] | null>(null);
  const [filteredChats, setFilteredChats] = useState<any>(null);
  // console.log("chatsData in details", chatsData);
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  const handleRemoveUser = async () => {
    try {
      setRemoving(true);
      await removeUserFromChat(params.chatId as string, displayUser.userId);
      await removeUserFromParticipants(
        params.chatId as string,
        Object.keys(chatUser?.group?.groupChatData?.[1].participants ?? {}),
        chatUser?.group?.groupChatData?.[1],
        params.userId as string,
        user.userId,
      );
      router.replace("/(app)/(protected)/chat-group-settings");
    } catch (error) {
      console.error("Error removing user from chat:", error);
    } finally {
      setRemoving(false);
    }
  };

  useEffect(() => {
    const fetchChatUser = () => {
      const app = getFirebaseApp();
      const db = getDatabase(app);
      const dbRef = ref(getDatabase(app));
      const chatsRef = ref(db, `chats/${displayUser.userId}`);
      onValue(chatsRef, (snapshot) => {
        setChatUserChatIds(snapshot.val() ? Object.keys(snapshot.val()) : []);
      });
    };
    fetchChatUser();
  }, [displayUser.userId, profileUser]);

  useEffect(() => {
    if (!params.userId) {
      return;
    }
    const getUserData = async () => {
      const data = await getUser(params.userId as string);
      setProfileUser(data);
    };
    getUserData();
  }, [params.userId]);
  useEffect(() => {
    console.log("loggedInUserChatIds", loggedInUserChatIds);
    console.log("chatUserChatIds", chatUserChatIds);
    setCommonChatId(
      loggedInUserChatIds.filter((id) => chatUserChatIds.includes(id)),
    );
  }, [loggedInUserChatIds, chatUserChatIds]);

  useEffect(() => {
    const filteredChats = Object.entries(chatsData.chats).filter(
      ([chatId, chat]) => {
        if ((commonChatId && !commonChatId.includes(chatId)) || !chat.name) {
          return false;
        }
        return true;
      },
    );
    setFilteredChats(filteredChats);
  }, [chatsData.chats, commonChatId]);

  useEffect(() => {
    const getImage = async () => {
      try {
        setLoading(true);
        const { data } = supabase.storage
          .from("chat-media")
          .getPublicUrl(`profile-images/${displayUser.userId}.jpg`);

        const imageUrl = data.publicUrl;
        setImageUri(imageUrl);
      } catch (e) {
        console.log("error fetching image from supabase", e);
      } finally {
        setLoading(false);
      }
    };
    getImage();
  }, [displayUser.userId]);

  return (
    <ScreenContainer>
      <Ionicons
        name="arrow-back"
        size={20}
        onPress={() => router.back()}
        style={{ width: 40 }}
      />
      <View style={styles.container}>
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          imageUri && <Image source={{ uri: imageUri }} style={styles.image} />
        )}
        <Text
          style={styles.name}
        >{`${displayUser.firstName} ${displayUser.lastName}`}</Text>
        <Text style={styles.email}>{displayUser.email}</Text>
      </View>
      {commonChatId && commonChatId.length > 0 ? (
        <>
          <View style={styles.groupInfoContainer}>
            <Text style={styles.groupInfoHeader}>
              {commonChatId?.length - 1}{" "}
              {commonChatId?.length - 1 === 1 ? "group" : "groups"} in common
            </Text>
          </View>
          <View>
            <FlatList
              style={{ marginTop: 32 }}
              data={filteredChats}
              renderItem={({ item, index, separators }) => {
                console.log("chat item is ", item[1]);
                return (
                  <ChatRow
                    key={item[1].createdAt}
                    participants={item[1].participants}
                    lastMessage={item[1].lastMessage}
                    lastMessageTimeStamp={item[1].lastMessageTimeStamp}
                    name={item[1].name}
                    chatData={item}
                    replaceRouteOnPress={true}
                  />
                );
              }}
              ItemSeparatorComponent={() => (
                <View
                  style={{
                    height: 20,
                  }}
                />
              )}
            />
            <View style={{ marginVertical: 30 }}>
              {params?.chatId &&
                (!removing ? (
                  <Button
                    title="Remove User"
                    buttonStyles={{
                      backgroundColor: "rgba(255, 60, 100, 0.9)",
                    }}
                    disabled={false}
                    onPress={handleRemoveUser}
                  />
                ) : (
                  <ActivityIndicator
                    size="small"
                    color="rgba(255, 60, 100, 0.9)"
                  />
                ))}
            </View>
          </View>
        </>
      ) : (
        <View style={{ marginTop: 50, alignItems: "center" }}>
          <Text>No common groups</Text>
        </View>
      )}
    </ScreenContainer>
  );
};

export default ChatDetails;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    rowGap: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 24,
    letterSpacing: 0.5,
    fontFamily: "Roboto-Medium",
  },
  email: {
    fontSize: 16,
    color: "#555",
    letterSpacing: 0.5,
    fontFamily: "Roboto-Regular",
  },
  image: {
    height: 80,
    width: 80,
    borderRadius: 100,
  },
  groupInfoContainer: {
    marginTop: 36,
  },
  groupInfoHeader: {
    fontSize: 18,
    letterSpacing: 0.5,
    fontFamily: "Roboto-Medium",
  },
});
