import Button from "@/components/button";
import Input from "@/components/input";
import ProfileImage from "@/components/profile-image";
import ScreenContainer from "@/components/screenContainer";
import colors from "@/constants/colors";
import { supabase } from "@/supabaseClient";
import {
  removeUserFromChat,
  removeUserFromParticipants,
  updateChat,
} from "@/utils/actions/chatActions";
import getUser from "@/utils/actions/getUser";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

const ChatGroupSettings = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const chatUser = useSelector((state) => state.user);
  const user = useSelector((state) => state.auth.userData);
  const [chatId, setChatId] = useState<string | null>(
    chatUser?.group?.groupChatData?.[0],
  );
  const [chatData, setChatData] = useState<any>(
    chatUser?.group?.groupChatData?.[1],
  );
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [createdByName, setCreatedByName] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string>(chatUser.groupName);
  const [fetchedUserData, setFetchedUserData] = useState<any>(new Set());
  const [participantsObject, setParticipantsObject] = useState<any>(
    chatUser?.group?.groupChatData?.[1]?.participants ?? {},
  );
  const [participants, setParticipants] = useState<any[]>([]);
  const [updatedGroupName, setUpdatedGroupName] = useState<string | undefined>(
    undefined,
  );
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const data = await getUser(chatUser.group.groupChatData[1].createdBy);
        return data.firstName;
      } catch (e) {
        console.log("error fetching user data in chat group settings", e);
      }
    };
    getUserData().then((name) => setCreatedByName(name ?? "Unknown"));
  }, [chatUser.group.groupChatData]);

  const getImage = async (id: string | undefined = undefined) => {
    try {
      const { data } = supabase.storage
        .from("chat-media")
        .getPublicUrl(`profile-images/${id || chatId}.jpg`);

      const imageUrl = data.publicUrl;
      console.log("image url", imageUrl);
      if (id) return imageUrl;
      setImageUri(imageUrl);
    } catch (e) {
      console.log("error fetching image from supabase", e);
    } finally {
    }
  };

  useEffect(() => {
    const fetchParticipants = async () => {
      if (!participantsObject) return;
      const ids = Object.keys(participantsObject);

      const results = await Promise.all(
        ids.map(async (userId) => {
          const [imageUri, userData] = await Promise.all([
            getImage(userId),
            getUser(userId),
          ]);
          return { userId, imageUri, userData };
        }),
      );

      setParticipants(results);
    };

    fetchParticipants();
  }, [participantsObject]);

  useEffect(() => {
    getImage();
  }, [chatId, chatUser.userId]);

  const handleNavigateToUserDetails = (userId: string) => {
    // dispatch(updateUser(userData));
    router.navigate({
      pathname: "/(app)/(protected)/chat-details",
      params: {
        userId,
        chatId,
      },
    });
  };

  const handleRemoveSelfFromChat = async () => {
    try {
      setLoading(true);
      await removeUserFromChat(chatId as string, user.userId);
      await removeUserFromParticipants(
        chatId as string,
        Object.keys(participantsObject),
        chatUser?.group?.groupChatData?.[1],
        user.userId as string,
        user.userId,
      );
      router.replace("/(app)/(protected)/(chat)/chats");
    } catch (error) {
      console.error("Error removing user from chat:", error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToSearch = () => {
    router.navigate({
      pathname: "/(app)/(protected)/new-chat",
      params: participantsObject
        ? {
            groupChat: 1,
            participants: Object.keys(participantsObject),
            groupName,
          }
        : { groupChat: 1, groupName },
    });
  };

  return (
    <ScreenContainer>
      <View
        style={{
          padding: 10,
          paddingTop: 20,
          rowGap: 14,
        }}
      >
        <Ionicons
          name="arrow-back"
          size={20}
          onPress={() => router.back()}
          style={{ width: 60 }}
        />
        <Text style={styles.title}>Chat Settings</Text>
      </View>
      <View style={styles.container}>
        <View style={{ height: 80 }}>
          <ProfileImage userId={chatId} savedImage={imageUri} />
        </View>
        <View style={styles.groupInfoContainer}>
          <Text style={styles.name}>
            {updatedGroupName
              ? updatedGroupName
              : updating
                ? groupName
                : chatUser.groupName}
          </Text>
          <Text style={styles.email}>
            Created By{" "}
            <Text
              style={{
                fontFamily: "Roboto-MediumItalic",
                color: "#111",
              }}
            >
              {createdByName ? createdByName : "Unknown"}
            </Text>
          </Text>
        </View>
      </View>
      <View style={styles.inputContainer}>
        <Input
          label="Group Name"
          error=""
          id="groupName"
          initialValue={groupName}
          value={groupName}
          icon=""
          onChangeText={(id, val) => setGroupName(val)}
        />
      </View>
      {groupName !== chatData.name &&
        (updating ? (
          <ActivityIndicator
            color={colors.primary}
            size={"small"}
            style={{ marginVertical: 16 }}
          />
        ) : (
          <Button
            disabled={groupName.trim().length === 0}
            title="Save Changes"
            onPress={() => {
              setUpdating(true);
              setUpdatedGroupName(undefined);
              updateChat(chatId!, user.userId, {
                ...chatData,
                name: groupName,
              }).then(() => {
                setUpdating(false);
                setUpdatedGroupName(groupName);
              });
            }}
          />
        ))}
      <ScrollView style={{ marginTop: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.subtitle}>
            {Object.keys(participantsObject).length === 1
              ? "1 Member"
              : Object.keys(participantsObject).length === 0
                ? "No Members in this group"
                : `${Object.keys(participantsObject).length} Members`}
          </Text>
          <Pressable
            style={styles.addParticipantContainer}
            onPress={navigateToSearch}
          >
            <Text style={{ color: colors.blue }}>Add Participants</Text>
            <Ionicons name="person-add" size={20} color={colors.blue} />
          </Pressable>
        </View>
        <View style={styles.participantContainer}>
          {participants.map(({ userId, imageUri, userData }) => (
            <Pressable
              android_ripple={{ color: "rgba(200,200,220,0.92)" }}
              onPress={() => handleNavigateToUserDetails(userId)}
              disabled={userId === user.userId}
              key={userId}
              style={styles.imageContainer}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image source={{ uri: imageUri }} style={styles.image} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={[styles.name, { fontSize: 16 }]}>
                    {userData?.fullName ?? "Unknown User"}
                  </Text>
                  <Text style={{ color: "#555", fontSize: 12 }}>
                    {userData?.email ?? ""}
                  </Text>
                </View>
              </View>
              {userId !== user.userId && (
                <Ionicons name="chevron-forward" size={14} />
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>
      {loading ? (
        <ActivityIndicator
          color={"rgba(255,70,100,0.8)"}
          size={"small"}
          style={{ marginVertical: 16 }}
        />
      ) : (
        <Button
          title="Leave Group"
          disabled={false}
          onPress={handleRemoveSelfFromChat}
          buttonStyles={{ backgroundColor: "rgba(255,70,100,0.8)" }}
        />
      )}
    </ScreenContainer>
  );
};

export default ChatGroupSettings;

const styles = StyleSheet.create({
  title: {
    fontFamily: "Roboto-Bold",
    fontSize: 30,
    letterSpacing: 0.4,
  },
  subtitle: {
    fontFamily: "Roboto-Medium",
    fontSize: 18,
    letterSpacing: 0.4,
    paddingHorizontal: 10,
    marginTop: 20,
  },
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
  groupInfoContainer: {
    alignItems: "center",
    rowGap: 10,
    borderRadius: 50,
  },
  imageContainer: {
    height: 60,
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 12,
    // marginLeft: 10,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  image: {
    height: 40,
    width: 40,
    borderRadius: 50,
  },
  inputContainer: {
    marginTop: 30,
    paddingHorizontal: 0,
  },
  participantContainer: {
    marginVertical: 16,
    rowGap: 8,
  },
  addParticipantContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    columnGap: 6,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "rgba(0,120,255,0.1)",
    alignSelf: "flex-start",
  },
});
