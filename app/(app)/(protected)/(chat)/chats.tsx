import ChatRow from "@/components/chat-row";
import ScreenContainer from "@/components/screenContainer";
import colors from "@/constants/colors";
import { MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

const Chats = () => {
  const router = useRouter();
  const nav = useNavigation();
  const chatsData = useSelector((state) => state.chats);
  const [loading, setLoading] = chatsData.loading;
  useEffect(() => {
    nav.setOptions({
      headerShown: true,
      headerTitle: "",
      headerRight: () => (
        <Pressable
          style={{ marginRight: 16 }}
          onPress={() => router.push("/(app)/(protected)/new-chat")}
        >
          <Octicons name="search" size={24} />
        </Pressable>
      ),
    });
  }, [nav, router]);

  if (chatsData.loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center", rowGap: 12 },
        ]}
      >
        <ActivityIndicator size={"small"} color={colors.blue} />
        <Text style={styles.emptyText}>Loading Chats...</Text>
      </View>
    );
  }

  if (!chatsData?.chats || Object.keys(chatsData.chats).length === 0) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center", rowGap: 12 },
        ]}
      >
        <MaterialCommunityIcons name="chat" size={20} />
        <Pressable onPress={() => router.push("/(app)/(protected)/new-chat")}>
          <Text style={styles.linkText}>Create a new Chat</Text>
        </Pressable>
      </View>
    );
  }

  console.log("chatsdatafirst", Object.entries(chatsData.chats)[0][1]);

  return (
    <ScreenContainer>
      <Text style={styles.heading}>Chats</Text>
      <View>
        <TouchableOpacity
          onPress={() =>
            router.navigate({
              pathname: "/(app)/(protected)/new-chat",
              params: { groupChat: 1 },
            })
          }
          style={styles.groupContainer}
        >
          <Text style={styles.groupText}>Create a group</Text>
          <Octicons name="plus" size={16} color={colors.blue} />
        </TouchableOpacity>
      </View>
      <FlatList
        style={{ marginTop: 16 }}
        data={Object.entries(chatsData.chats).sort((a, b) => {
          const dateA = new Date(
            a[1].lastMessageTimestamp ?? a[1].lastMessageTimeStamp ?? 0,
          );
          const dateB = new Date(
            b[1].lastMessageTimestamp ?? b[1].lastMessageTimeStamp ?? 0,
          );
          return Number(dateB) - Number(dateA);
        })}
        renderItem={({ item, index, separators }) => {
          if (!item[0]) return null;
          return (
            <ChatRow
              key={item[1].createdAt}
              participants={item[1].participants}
              lastMessage={item[1].lastMessage}
              lastMessageTimeStamp={item[1].lastMessageTimeStamp}
              name={item[1].name}
              chatData={item}
            />
          );
        }}
        ItemSeparatorComponent={() => (
          <View
            style={{
              height: 0.5,
              // backgroundColor: colors.lightgrey,
              marginVertical: 9,
            }}
          />
        )}
      />
    </ScreenContainer>
  );
};

export default Chats;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heading: {
    fontSize: 28,
    marginBottom: 16,
    fontFamily: "Roboto-SemiBold",
  },
  groupContainer: {
    marginVertical: 5,
    alignItems: "center",
    flexDirection: "row",
    columnGap: 10,
    backgroundColor: "#FFF",
    elevation: 1,
    borderRadius: 10,
    justifyContent: "center",
    width: 140,
    padding: 5,
  },
  groupText: {
    fontSize: 16,
    fontFamily: "Roboto-Medium",
  },
  emptyText: {
    fontSize: 20,
    fontFamily: "Roboto-Light",
    textAlign: "center",
    padding: 16,
  },
  linkText: {
    color: colors.primary,
    fontSize: 18,
    fontFamily: "Roboto-Medium",
    letterSpacing: 0.5,
  },
});
