import * as ImagePicker from "expo-image-picker";

export const imagePicker = async () => {
  await checkMediaPermissions();
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });
  if (!result.canceled) {
    console.log(result.assets);
    return result.assets[0].uri;
  }
};

export const checkMediaPermissions = async () => {
  const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (result.granted) {
    return Promise.resolve();
  }
  return Promise.reject("We need permission to access your photos");
};
