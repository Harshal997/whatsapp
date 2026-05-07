import colors from "@/constants/colors";
import { updateUser } from "@/store/userSlice";
import { supabase } from "@/supabaseClient";
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
  name?: string;
  chatData: [string, unknown];
  replaceRouteOnPress?: boolean;
}

const ChatRow = (props: Props) => {
  const currentUser = useSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();
  const [dp, setDp] = useState<string | null>(null);
  const [chattingDetails, setChatingDetails] = useState({});
  const [groupChatData, setGroupChatData] = useState(
    props.name ? props.chatData : null,
  );
  const fetchUser = async () => {
    if (groupChatData) {
      setChatingDetails({ group: { groupChatData, name: props.name } });
      return;
    }
    const chatting = Object.keys(props.participants).find(
      (userId) => userId !== currentUser?.userData?.userId,
    );
    const userDetails = await getUser(chatting ?? "");
    setChatingDetails(userDetails);
  };

  const handleNavigateChatScreen = async () => {
    if (!chattingDetails) {
      Alert.alert("", "Unknown error");
    }
    dispatch(updateUser(chattingDetails));
    if (props.replaceRouteOnPress) {
      router.replace("/(app)/(protected)/chat-screen");
      return;
    }
    router.navigate({
      pathname: "/(app)/(protected)/chat-screen",
      // params: {
      //   groupChatData,
      // },
    });
  };

  useEffect(() => {
    fetchUser();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.userData?.userId, props.participants]);

  useEffect(() => {
    const getImage = async () => {
      try {
        const { data } = supabase.storage
          .from("chat-media")
          .getPublicUrl(
            `profile-images/${props.name ? props.chatData?.[0] : Object.keys(props.participants).filter((id) => id !== currentUser?.userData?.userId)?.[0]}.jpg`,
          );

        const imageUrl = data.publicUrl;
        console.log("image url", imageUrl);
        // if (id) return imageUrl;
        setDp(imageUrl);
      } catch (e) {
        console.log("error fetching image from supabase", e);
      } finally {
      }
    };
    getImage();
  }, [props]);

  return (
    <TouchableOpacity
      onPress={handleNavigateChatScreen}
      style={styles.container}
    >
      <View style={styles.details}>
        <Image
          source={
            dp
              ? { uri: dp }
              : props.name
                ? require("../assets/images/group-photo.png")
                : require("../assets/images/profile-image.jpg")
          }
          resizeMode="contain"
          style={styles.image}
        />
        <View style={styles.detailContainer}>
          <Text style={styles.nameText}>
            {props.name
              ? props.name
              : chattingDetails.firstName + " " + chattingDetails.lastName}
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
