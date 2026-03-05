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
  View,
} from "react-native";
import { useSelector } from "react-redux";

const Chats = () => {
  const router = useRouter();
  const nav = useNavigation();
  const chatsData = useSelector((state) => state.chats);
  const [loading, setLoading] = chatsData.loading;
  console.log("all chatsData from store", chatsData);
  useEffect(() => {
    nav.setOptions({
      headerShown: true,
      headerTitle: "",
      headerRight: () => (
        <Pressable
          style={{ marginRight: 16 }}
          onPress={() => router.push("/(app)/(protected)/new-chat")}
        >
          <Octicons name="plus" size={24} />
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

  return (
    <ScreenContainer>
      <Text style={styles.heading}>Chats</Text>
      <FlatList
        style={{ marginTop: 16 }}
        data={Object.values(chatsData.chats)}
        renderItem={({ item, index, separators }) => {
          return (
            <ChatRow
              key={item.createdAt}
              participants={item.participants}
              lastMessage={item.lastMessage}
              lastMessageTimeStamp={item.lastMessageTimeStamp}
            />
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
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
