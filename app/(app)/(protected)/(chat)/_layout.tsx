import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "#333" }}>
      <Tabs.Screen
        name="chats"
        options={{
          tabBarIcon: ({ color, size, focused }) => {
            return (
              <Ionicons name="chatbox-outline" size={size} color={color} />
            );
          },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, size, focused }) => {
            return <Ionicons name="settings" size={size} color={color} />;
          },
        }}
      />
    </Tabs>
  );
}
