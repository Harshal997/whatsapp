import colors from "@/constants/colors";
import { imagePicker } from "@/utils/imagePickerHelper";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, Pressable, PressableProps, StyleSheet } from "react-native";

interface Props {
  containerStyle?: object;
  imageStyle?: object;
}

const ProfileImage = ({
  containerStyle,
  imageStyle,
}: Props & PressableProps) => {
  const [image, setImage] = useState(null);
  const handleImagePicker = async () => {
    console.log("open picker");
    const imageUri = await imagePicker();
    console.log("imageruri", imageUri);
    imageUri && setImage(imageUri);
  };

  return (
    <Pressable
      onPress={handleImagePicker}
      style={[{ ...styles.container, ...containerStyle }]}
    >
      <Ionicons name="pencil" color={"#000"} size={16} style={styles.icon} />
      <Image
        style={[{ ...styles.image, ...imageStyle }]}
        source={image ? image : require("../assets/images/profile-image.jpg")}
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
    padding: 8,
  },
  image: {
    height: 80,
    width: 80,
  },
  icon: {
    position: "absolute",
    zIndex: 2,
    right: 5,
    top: 5,
    backgroundColor: colors.lightgrey,
    padding: 4,
    borderRadius: 20,
  },
});
