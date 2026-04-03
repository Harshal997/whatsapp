import colors from "@/constants/colors";
import { supabase } from "@/supabaseClient";
import { imagePicker } from "@/utils/imagePickerHelper";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Image, Pressable, PressableProps, StyleSheet } from "react-native";

interface Props {
  containerStyle?: object;
  imageStyle?: object;
  userId: string;
  savedImage?: string | undefined;
}

const ProfileImage = ({
  userId,
  savedImage,
  containerStyle,
  imageStyle,
}: Props & PressableProps) => {
  const [image, setImage] = useState<undefined | string>(savedImage);
  const handleImagePicker = async () => {
    console.log("open picker");
    const imageUri = await imagePicker();
    imageUri && setImage(imageUri);
  };

  useEffect(() => {
    if (!image) {
      return;
    }
    const saveImage = async () => {
      const response = await fetch(image);
      const arrayBuffer = await response.arrayBuffer();
      console.log("blob is ", arrayBuffer);
      const path = `profile-images/${userId}.jpg`;
      const { data } = supabase.storage.from("chat-media").getPublicUrl(path);
      const imageUrl = data.publicUrl;
      console.log("fetched?", imageUrl);
      await supabase.storage.from("chat-media").upload(path, arrayBuffer);
      console.log("data", data);
    };
    saveImage();
  }, [image, userId]);

  return (
    <Pressable
      onPress={handleImagePicker}
      style={[{ ...styles.container, ...containerStyle }]}
    >
      <Ionicons name="pencil" color={"#000"} size={16} style={styles.icon} />
      <Image
        style={[{ ...styles.image, ...imageStyle }]}
        source={
          image
            ? { uri: image }
            : savedImage
              ? { uri: savedImage }
              : require("../assets/images/profile-image.jpg")
        }
      />
    </Pressable>
  );
};

export default ProfileImage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderColor: colors.grey,
    borderWidth: 1,
    borderRadius: 50,
  },
  image: {
    height: 80,
    width: 80,
    borderRadius: 100,
  },
  icon: {
    position: "absolute",
    zIndex: 2,
    right: 1,
    bottom: 1,
    backgroundColor: colors.lightgrey,
    padding: 4,
    borderRadius: 20,
  },
});
