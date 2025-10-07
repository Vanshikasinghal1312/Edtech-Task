import React, { useEffect, useRef } from "react";
import { Platform, Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

import WebViewScreen from "../../screens/WebViewScreen";
import VideoScreen from "../../screens/VideoScreen";

const Stack = createStackNavigator();

// Configure notification handling when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const navigationRef = useRef();
  const responseListenerRef = useRef();
  const notificationListenerRef = useRef();

  useEffect(() => {
    // Request permission and (for Android) create channel
    (async () => {
      if (Device.isDevice) {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== "granted") {
          Alert.alert(
            "Permissions required",
            "Push notifications permission is required for scheduled local notifications to work."
          );
          return;
        }

        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.DEFAULT,
          });
        }
      } else {
        // Simulator — show an info toast
        console.log("Must use a physical device for full notification behavior.");
      }
    })();

    // Listener when a notification is received while app is foregrounded
    notificationListenerRef.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        // you can update UI here if needed
        console.log("Notification received:", notification.request.content);
      }
    );

    // Listener when the user interacts with a notification (taps it)
    responseListenerRef.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response received:", response);
        const action = response.notification.request.content.data?.action;
        // If notification includes an `action: 'openVideo'`, navigate to Video screen
        if (action === "openVideo" && navigationRef.current) {
          navigationRef.current.navigate("Video");
        }
      });

    return () => {
      if (notificationListenerRef.current)
        Notifications.removeNotificationSubscription(notificationListenerRef.current);
      if (responseListenerRef.current)
        Notifications.removeNotificationSubscription(responseListenerRef.current);
    };
  }, []);

  return (
    // <NavigationContainer ref={navigationRef}>

      <Stack.Navigator initialRouteName="WebView">
        <Stack.Screen name="WebView" component={WebViewScreen} options={{ title: "WebView + Notifications" }} />
        <Stack.Screen name="Video" component={VideoScreen} options={{ title: "Video Player" }} />
      </Stack.Navigator>
  );
}
