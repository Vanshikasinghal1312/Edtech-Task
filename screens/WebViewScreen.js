import React from "react";
import { View, Button, StyleSheet,TouchableOpacity, Text } from "react-native";
import { WebView } from "react-native-webview";
import * as Notifications from "expo-notifications";

export default function WebViewScreen({ navigation }) {
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
      <WebView
        source={{ uri: "https://reactnative.dev/" }}
        style={{ flex: 1 }}
      />
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={() => triggerNotification("Hello! This is notification 1")}
        >
          <Text style={styles.buttonText}>Show Notification 1</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => triggerNotification("Hi there! This is notification 2")}
        >
          <Text style={styles.buttonSecondaryText}>Show Notification 2</Text>
        </TouchableOpacity>

      
      </View>
      <View style={styles.buttons}>
         <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={() => navigation.navigate("Video")}
        >
          <Text style={styles.buttonText}>Go to Video Player</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding:7,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#212326",
  },
  buttonPrimary: {
    backgroundColor: "#087ea4",
    padding:6,
    borderRadius: 10,
    alignItems: "center",
    
  },
  buttonSecondary: {
   backgroundColor: "#087ea4",
    padding:6,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonSecondaryText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});




// import React, { useCallback } from "react";
// import { View, Text, StyleSheet, Button, Alert } from "react-native";
// import { WebView } from "react-native-webview";
// import * as Notifications from "expo-notifications";

// function randomDelaySeconds(min = 2, max = 5) {
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// async function scheduleLocalNotification({ title, body, data = {}, delaySeconds = 3 }) {
//   try {
//     await Notifications.scheduleNotificationAsync({
//       content: {
//         title,
//         body,
//         data,
//       },
//       trigger: { seconds: delaySeconds },
//     });
//   } catch (e) {
//     console.error("Failed to schedule notification", e);
//     Alert.alert("Error", "Could not schedule notification.");
//   }
// }

// export default function WebViewScreen({ navigation }) {
//   const testUrl = "https://example.com"; // change as needed

//   const handleNotifyA = useCallback(async () => {
//     const seconds = randomDelaySeconds(2, 5);
//     await scheduleLocalNotification({
//       title: "Hello from Button A",
//       body: `This was scheduled after ${seconds} seconds.`,
//       data: { tag: "buttonA" },
//       delaySeconds: seconds,
//     });
//     Alert.alert("Scheduled", `Notification A will arrive in ${seconds}s`);
//   }, []);

//   const handleNotifyB = useCallback(async () => {
//     const seconds = randomDelaySeconds(2, 5);
//     // This notification includes data instructing the app to open the Video screen when tapped
//     await scheduleLocalNotification({
//       title: "Open Video",
//       body: `Tap to open the video player (arrives in ${seconds}s).`,
//       data: { action: "openVideo" },
//       delaySeconds: seconds,
//     });
//     Alert.alert("Scheduled", `Notification B will arrive in ${seconds}s`);
//   }, []);

//   const handleWebViewLoaded = useCallback(async () => {
//     // Bonus: send a notification when webview finishes loading (after a short random delay)
//     const seconds = randomDelaySeconds(2, 4);
//     await scheduleLocalNotification({
//       title: "WebView Loaded",
//       body: `The webpage finished loading. Notification after ${seconds}s.`,
//       data: { tag: "webviewLoaded" },
//       delaySeconds: seconds,
//     });
//     console.log("WebView loaded — notification scheduled");
//   }, []);

//   return (
//     <View style={styles.container}>
//       <View style={styles.webviewContainer}>
//         <WebView source={{ uri: testUrl }} onLoadEnd={handleWebViewLoaded} />
//       </View>

//       <View style={styles.controls}>
//         <Text style={styles.helpText}>Press a button to schedule a local notification (2–5s delay):</Text>
//         <View style={styles.buttonRow}>
//           <Button title="Notify A" onPress={handleNotifyA} />
//           <Button title="Notify B (open Video on tap)" onPress={handleNotifyB} />
//         </View>
//         <View style={styles.navRow}>
//           <Button title="Go to Video Player" onPress={() => navigation.navigate("Video")} />
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   webviewContainer: { flex: 1, borderBottomWidth: 1, borderColor: "#ddd" },
//   controls: { padding: 12, backgroundColor: "#fafafa" },
//   buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
//   navRow: { marginTop: 12 },
//   helpText: { fontSize: 14, marginBottom: 6, color: "#333" },
// });
