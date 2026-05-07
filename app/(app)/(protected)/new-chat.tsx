import colors from "@/constants/colors";
import { updateUser } from "@/store/userSlice";
import { supabase } from "@/supabaseClient";
import { addParticipantToChat } from "@/utils/actions/chatActions";
import { searchUsers } from "@/utils/actions/getUser";
import { Feather, FontAwesome5, Ionicons, Octicons } from "@expo/vector-icons";
import { useGlobalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

const NewChat = () => {
  const router = useRouter();
  const nav = useNavigation();
  const user = useSelector((state) => state.auth.userData);
  const chatData = useSelector((state) => state.chats);
  const params = useGlobalSearchParams();
  const [pastParticipants, setPastParticipants] = useState<string[]>(
    params?.participants?.split(",") || [],
  );
  const [participantsToAdd, setParticipantsToAdd] = useState<string[]>([]);
  const chatUser = useSelector((state) => state.user);
  const participantsObject = chatUser?.group?.groupChatData?.[1].participants;
  const isGroupChat = params?.groupChat;
  const [groupName, setGroupName] = useState(params?.groupName || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [images, setImages] = useState<string | undefined>(undefined);
  const [usersToAdd, setUsersToAdd] = useState<Map<any, any>>(new Map());
  const dispatch = useDispatch();

  const handleChat = (user: any) => {
    // console.log(user);
    if (isGroupChat) {
      const usersMap = new Map(usersToAdd);
      if (usersToAdd.has(user.userId)) {
        usersMap.delete(user.userId);
        setUsersToAdd(usersMap);
        return;
      }
      usersMap.set(user.userId, user);
      setUsersToAdd(usersMap);
      return;
    }
    dispatch(updateUser(user));
    router.replace({
      pathname: "/(app)/(protected)/chat-screen",
    });
  };

  useEffect(() => {
    nav.setOptions({
      headerShown: true,
      headerTitle: params?.groupName ? params.groupName : getTitle(),
      headerRight: () => (
        <Pressable
          disabled={groupName === ""}
          // onPress={() => router.push("/(app)/(protected)/new-chat")}
        >
          <TouchableOpacity
            onPress={async () => {
              if (params?.groupName) {
                await addParticipant();
                return;
              }
              const users = Array.from(usersToAdd.values());
              dispatch(updateUser({ group: { users, name: groupName } }));
              router.navigate({
                pathname: "/(app)/(protected)/chat-screen",
              });
            }}
          >
            <Text
              style={[
                styles.groupText,
                { color: groupName ? colors.blue : colors.grey },
              ]}
            >
              {params?.groupName ? "Add" : "Create"}
            </Text>
          </TouchableOpacity>
        </Pressable>
      ),
      // headerLeft: () => (
      //   <Pressable onPress={() => router.push("/(app)/(protected)/new-chat")}>
      //     <Ionicons name="chevron-back" size={24} />
      //   </Pressable>
      // ),
    });
  }, [isGroupChat, nav, router, groupName, usersToAdd]);

  const getTitle = () => {
    if (!isGroupChat) return "Search Users";
    return "Add Participants";
  };

  const getImage = async (userId: string) => {
    try {
      const { data } = supabase.storage
        .from("chat-media")
        .getPublicUrl(`profile-images/${userId}.jpg`);

      const imageUrl = data.publicUrl;
      return imageUrl;
    } catch (e) {
      console.log("error fetching image from supabase", e);
    }
  };

  useEffect(() => {
    if (!results) return;

    const loadImages = async () => {
      const images = await Promise.all(
        results.map((res: any) => getImage(res.userId)),
      );

      setImages(images);
    };

    loadImages();
  }, [results]);

  console.log();

  useEffect(() => {
    if (!searchTerm || searchTerm === "") {
      return;
    }
    let delayFun = setTimeout(async () => {
      try {
        setLoading(true);
        const users = await searchUsers(searchTerm);
        console.log("Searched", Object.values(users));
        setResults(
          Object.values(users).filter((item) =>
            params?.participants
              ? !pastParticipants.includes(item.userId)
              : item.userId !== user.userId,
          ),
        );
      } catch (error) {
        console.log("error searching", error);
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(delayFun);
  }, [searchTerm]);

  const addParticipant = async () => {
    console.log(Array.from(usersToAdd.values()));
    try {
      await addParticipantToChat(
        chatUser.group.groupChatData[0],
        Array.from(usersToAdd.values()),
        chatData.chats[chatUser.group.groupChatData[0]],
        user.userId,
      );
      console.log("participants added");
      router.replace({
        pathname: "/(app)/(protected)/chat-screen",
      });
    } catch (e) {
      console.log("error adding participants", e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {isGroupChat && (
        <>
          <View style={styles.inputContainer}>
            {/* <TouchableOpacity style={styles.mediaButton}>
            <Feather name="search" color={colors.blue} size={24} />
          </TouchableOpacity> */}
            <TextInput
              value={groupName}
              // editable={params?.groupName === ""}
              onChangeText={(text) => setGroupName(text)}
              placeholder="Add a group name"
              style={styles.groupTextBox}
            />
          </View>
          {usersToAdd.size > 0 && (
            <View style={styles.selectedUsers}>
              <FlatList
                data={Array.from(usersToAdd.values())}
                keyExtractor={(item) => item.userId}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectedUsers}
                renderItem={({ item, index }) => (
                  <View key={item.userId} style={styles.selectedUser}>
                    <TouchableOpacity
                      onPress={() => handleChat(item)}
                      style={styles.closeBubble}
                    >
                      <Ionicons
                        name="close-circle"
                        size={12}
                        color={colors.blue}
                      />
                    </TouchableOpacity>
                    {images && (
                      <Image source={{ uri: item.uri }} style={styles.image} />
                    )}
                    <Text style={styles.selectedUserText} key={item.userId}>
                      {item.firstName}
                    </Text>
                  </View>
                )}
              />
              {/* {Array.from(usersToAdd.values()).map((user, index) => (
                <View key={user.userId} style={styles.selectedUser}>
                  <Ionicons
                    name="close-circle"
                    style={styles.closeBubble}
                    size={12}
                    color={colors.blue}
                  />
                  {images && (
                    <Image source={{ uri: user.uri }} style={styles.image} />
                  )}
                  <Text style={styles.selectedUserText} key={user.userId}>
                    {user.firstName}
                  </Text>
                </View>
              ))} */}
            </View>
          )}
        </>
      )}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.mediaButton}>
          <Feather name="search" color={colors.blue} size={24} />
        </TouchableOpacity>
        <TextInput
          value={searchTerm}
          onChangeText={(text) => setSearchTerm(text)}
          placeholder="Search"
          style={styles.textBox}
        />
      </View>
      {!loading && searchTerm && results && (
        <FlatList
          data={results}
          centerContent
          ItemSeparatorComponent={() => (
            <View
              style={{
                height: 0.3,
                width: "90%",
                backgroundColor: colors.grey,
                alignSelf: "center",
              }}
            ></View>
          )}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => handleChat({ ...item, uri: images![index] })}
              style={styles.itemContainer}
            >
              <View style={styles.imageContainer}>
                {images && (
                  <Image
                    source={{ uri: images[index] }}
                    style={styles.image}
                    resizeMode="contain"
                  />
                )}
                <View style={styles.searchUser}>
                  <Text
                    style={styles.listHeading}
                  >{`${item.firstName} ${item.lastName}`}</Text>
                  <Text style={styles.listText}>{item.email}</Text>
                </View>
              </View>
              <View>
                {!usersToAdd.has(item.userId) ? (
                  <Octicons
                    name="check-circle-fill"
                    color={"#FFF"}
                    style={{
                      borderColor: "#555",
                      borderWidth: 1,
                      borderRadius: 10,
                    }}
                    size={15}
                  />
                ) : (
                  <Octicons
                    name="check-circle-fill"
                    color={"rgba(100,166,90,0.88)"}
                    size={16}
                  />
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
      {loading && (
        <View
          style={[
            styles.container,
            { justifyContent: "center", alignItems: "center", rowGap: 12 },
          ]}
        >
          <ActivityIndicator size={"small"} color={colors.blue} />
          <Text style={styles.emptyText}>Searching</Text>
        </View>
      )}
      {!loading && !results && !searchTerm && (
        <View
          style={[
            styles.container,
            { justifyContent: "center", alignItems: "center", rowGap: 12 },
          ]}
        >
          <FontAwesome5 name="users" size={24} />
          <Text style={styles.emptyText}>Enter a name to search a user!</Text>
        </View>
      )}
      {!loading && !results && searchTerm && (
        <View
          style={[
            styles.container,
            { justifyContent: "center", alignItems: "center", rowGap: 12 },
          ]}
        >
          <FontAwesome5 name="users-slash" size={24} />
          <Text style={styles.emptyText}>No user found</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default NewChat;

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
  groupTextBox: {
    flex: 1,
    borderWidth: 1,
    paddingHorizontal: 16,
    borderColor: colors.lightgrey,
    backgroundColor: "rgba(220, 225,237,0.93)",
    borderRadius: 5,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderRadius: 12,
    width: "100%",
    borderColor: colors.grey,
  },
  searchUser: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    borderColor: colors.grey,
  },
  listHeading: {
    fontFamily: "Roboto-Medium",
    letterSpacing: 0.8,
    textAlign: "center",
  },
  listText: {
    color: colors.grey,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  mediaButton: {},
  emptyText: {
    fontSize: 20,
    fontFamily: "Roboto-Light",
    textAlign: "center",
    padding: 16,
  },
  selectedUsers: {
    columnGap: 10,
    marginRight: 24,
    padding: 10,
    alignItems: "center",
    flexDirection: "row",
  },
  selectedUser: {
    alignItems: "center",
    rowGap: 10,
  },
  selectedUserText: {
    fontFamily: "Roboto-Light",
    fontSize: 12.5,
  },
  groupText: {
    fontSize: 16,
    color: colors.blue,
    fontFamily: "Roboto-Medium",
  },
  closeBubble: {
    position: "absolute",
    zIndex: 2,
    right: -4,
    top: -8,
  },
  imageContainer: {
    flexDirection: "row",
    columnGap: 10,
    alignItems: "center",
  },
  image: {
    height: 45,
    width: 45,
    borderRadius: 25,
  },
});
