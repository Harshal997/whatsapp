import colors from "@/constants/colors";
import { updateUser } from "@/store/userSlice";
import getUser from "@/utils/actions/getUser";
import { formatTimestamp } from "@/utils/dateUtils";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

interface Props {
  participants: object;
  lastMessage: string;
  lastMessageTimeStamp: any;
}

const ChatRow = (props: Props) => {
  const currentUser = useSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();
  const [chattingWithUserDetails, setChatingWithUserDetails] = useState({});
  const fetchUser = async () => {
    const chattingWithUser = Object.keys(props.participants).find(
      (userId) => userId !== currentUser.userData.userId,
    );
    console.log("userIdpart", chattingWithUser);
    const userDetails = await getUser(chattingWithUser ?? "");
    setChatingWithUserDetails(userDetails);
  };

  const handleNavigateChatScreen = async () => {
    if (!chattingWithUserDetails) {
      Alert.alert("", "Unknown error");
    }
    dispatch(updateUser(chattingWithUserDetails));
    router.navigate({
      pathname: "/(app)/(protected)/chat-screen",
      params: {
        newChat: 0,
        participantUserId: chattingWithUserDetails?.userId,
        private: 1,
      },
    });
  };

  useEffect(() => {
    fetchUser();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.userData.userId, props.participants]);

  return (
    <TouchableOpacity
      onPress={handleNavigateChatScreen}
      style={styles.container}
    >
      <View style={styles.details}>
        <Image
          source={require("../assets/images/profile-image.jpg")}
          style={styles.image}
        />
        <View style={styles.detailContainer}>
          <Text style={styles.nameText}>
            {chattingWithUserDetails.firstName}{" "}
            {chattingWithUserDetails.lastName}
          </Text>
          <Text style={styles.lastMessageText}>
            {props.lastMessage.length > 25
              ? props.lastMessage.slice(0, 25) + "..."
              : props.lastMessage}
          </Text>
        </View>
      </View>
      <View style={styles.time}>
        <Text style={styles.timeText}>
          {formatTimestamp(props.lastMessageTimeStamp)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ChatRow;

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    paddingHorizontal: 0,
    flexDirection: "row",
  },
  details: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 16,
  },
  image: {
    height: 40,
    width: 40,
    borderWidth: 1,
    borderColor: colors.lightgrey,
    borderRadius: 100,
    padding: 12,
  },
  detailContainer: {
    rowGap: 8,
  },
  lastMessageText: {
    fontSize: 12,
    color: colors.grey,
  },
  nameText: {
    fontSize: 15,
  },
  time: {
    marginTop: 8,
  },
  timeText: {
    fontSize: 15,
    color: colors.grey,
  },
});
