import React, { useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { WebView } from "react-native-webview";
import * as Notifications from "expo-notifications";
import {moderateScale } from "react-native-size-matters";

// Needed for APK to actually display notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function WebViewScreen({ navigation }) {
  // Ask for permissions (Expo Go auto-grants, APK doesn’t)
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        await Notifications.requestPermissionsAsync();
      }
    })();
  }, []);

  // helper to trigger local notification
  const triggerNotification = async (message) => {
    const delay = Math.floor(Math.random() * 4) + 2; // 2–5 seconds
    console.log(`⏱ Notification will arrive in ${delay} seconds`);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📢 Notification",
        body: `${message} (arrives in ${delay}s)`, // shows delay in body too
        data: { screen: "Video" },
      },
      trigger: { seconds: delay },
    });
  };

  return (
    <View style={styles.container}>
      <WebView source={{ uri: "https://reactnative.dev/" }} style={{ flex: 1 }}/>
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.buttonPrimary} onPress={() => triggerNotification("Hello! This is notification 1")}>
          <Text style={styles.buttonText}>Show Notification 1</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonSecondary} onPress={() => triggerNotification("Hi there! This is notification 2")}>
          <Text style={styles.buttonSecondaryText}>Show Notification 2</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button3} onPress={() => navigation.navigate("Video")}>
          <Text style={styles.buttonText1}>Go to Video Player</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  buttons: {flexDirection: "row",justifyContent: "space-around",padding: moderateScale(24), borderTopWidth: moderateScale(1),borderColor: "#ddd",backgroundColor: "#212326",},
  buttonPrimary: {backgroundColor: "#087ea4",padding: moderateScale(8),borderRadius:moderateScale(10),alignItems: "center"},
  buttonSecondary: {backgroundColor: "#087ea4",padding: moderateScale(8),borderRadius:moderateScale(10),alignItems: "center"},
  button3: {backgroundColor: "#087ea4",marginHorizontal: moderateScale(12),padding: moderateScale(10),borderRadius:moderateScale(10),alignItems: "center",marginBottom: 20,},
  buttonText: {color: "#fff",fontSize: moderateScale(14),fontWeight: "600"},
  buttonText1: {color: "#fff",fontSize: moderateScale(15),fontWeight: "600",marginHorizontal:moderateScale(12),padding: moderateScale(5)},
  buttonSecondaryText: {color: "white",fontSize: moderateScale(14),fontWeight: "600"},
});
