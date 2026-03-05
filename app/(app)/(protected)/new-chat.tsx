import colors from "@/constants/colors";
import { updateUser } from "@/store/userSlice";
import { searchUsers } from "@/utils/actions/getUser";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

const NewChat = () => {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const dispatch = useDispatch();

  const handleChat = (user: any) => {
    dispatch(updateUser(user));
    router.navigate({
      pathname: "/(app)/(protected)/chat-screen",
    });
  };

  useEffect(() => {
    if (!searchTerm || searchTerm === "") {
      return;
    }
    let delayFun = setTimeout(async () => {
      try {
        setLoading(true);
        const users = await searchUsers(searchTerm);
        console.log("Searched", Object.values(users));
        setResults(Object.values(users));
      } catch (error) {
        console.log("error searching", error);
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(delayFun);
  }, [searchTerm]);

  return (
    <SafeAreaView style={styles.container}>
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
              onPress={() => handleChat(item)}
              style={styles.itemContainer}
            >
              <Text
                style={styles.listHeading}
              >{`${item.firstName} ${item.lastName}`}</Text>
              <Text style={styles.listText}>{item.email}</Text>
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
  itemContainer: {
    padding: 16,
    borderRadius: 12,
    width: "90%",
    alignSelf: "center",
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
});
