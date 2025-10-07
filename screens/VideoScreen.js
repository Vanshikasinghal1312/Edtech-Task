// import React from "react";
// import { StyleSheet, View } from "react-native";
// import { Video } from "expo-av";

// export default function VideoScreen() {
//   return (
//     <View style={styles.container}>
//       <Video
//         source={{
//           uri: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", // HLS test URL
//         }}
//         useNativeControls
//         resizeMode="contain"
//         style={styles.video}
//       />
//     </View>
//   );
// }
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "black", justifyContent: "center" },
//   video: { width: "100%", height: 300 },
// });

import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  TouchableWithoutFeedback,
  Animated,
  StatusBar,
  BackHandler,
  useWindowDimensions,
} from "react-native";
import { Video } from "expo-av";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import * as ScreenOrientation from "expo-screen-orientation";

export default function VideoScreen() {
  const videoRef = useRef(null);
  const { width, height } = useWindowDimensions();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const controlOpacity = useRef(new Animated.Value(1)).current;
  const skipAnimForward = useRef(new Animated.Value(0)).current;
  const skipAnimBackward = useRef(new Animated.Value(0)).current;
  const [skipForwardVisible, setSkipForwardVisible] = useState(false);
  const [skipBackwardVisible, setSkipBackwardVisible] = useState(false);

  const playScale = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const videoUrl = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
  const lastTap = useRef(0);

  // Video height
  const videoHeight = isFullScreen ? height : width * 0.56;

  // Handle Android back button to exit fullscreen
  useEffect(() => {
    const backAction = () => {
      if (isFullScreen) {
        exitFullScreen();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [isFullScreen]);

  // Auto-hide controls
  useEffect(() => {
    if (showControls) {
      Animated.timing(controlOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      const timer = setTimeout(() => hideControls(), 4000);
      return () => clearTimeout(timer);
    }
  }, [showControls, position]);

  const hideControls = () => {
    Animated.timing(controlOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowControls(false));
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis);
      setIsPlaying(status.isPlaying);
    }
  };

  const togglePlayPause = async () => {
    if (!videoRef.current) return;
    Animated.sequence([
      Animated.timing(playScale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.spring(playScale, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();

    if (isPlaying) await videoRef.current.pauseAsync();
    else await videoRef.current.playAsync();
    setIsPlaying(!isPlaying);

    Animated.timing(overlayOpacity, {
      toValue: isPlaying ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const animateSkip = (forward = true) => {
    const anim = forward ? skipAnimForward : skipAnimBackward;
    if (forward) setSkipForwardVisible(true);
    else setSkipBackwardVisible(true);

    anim.setValue(0);
    Animated.timing(anim, {
      toValue: -50,
      duration: 700,
      useNativeDriver: true,
    }).start(() => {
      if (forward) setSkipForwardVisible(false);
      else setSkipBackwardVisible(false);
    });
  };

  const skipForward = async () => {
    if (!videoRef.current) return;
    const status = await videoRef.current.getStatusAsync();
    if (!status.isLoaded) return;
    await videoRef.current.setPositionAsync(Math.min(status.positionMillis + 10000, status.durationMillis));
    animateSkip(true);
  };

  const skipBackward = async () => {
    if (!videoRef.current) return;
    const status = await videoRef.current.getStatusAsync();
    if (!status.isLoaded) return;
    await videoRef.current.setPositionAsync(Math.max(status.positionMillis - 10000, 0));
    animateSkip(false);
  };

  const toggleMute = async () => {
    if (!videoRef.current) return;
    await videoRef.current.setIsMutedAsync(!isMuted);
    setIsMuted(!isMuted);
  };

  // Fullscreen with rotation
  const enterFullScreen = async () => {
    setIsFullScreen(true);
    StatusBar.setHidden(true, "fade");
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  };

  const exitFullScreen = async () => {
    setIsFullScreen(false);
    StatusBar.setHidden(false, "fade");
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
  };

  const formatTime = (millis) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleTapArea = (side) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (lastTap.current && now - lastTap.current < DOUBLE_PRESS_DELAY) {
      if (side === "left") skipBackward();
      else skipForward();
      lastTap.current = 0;
    } else {
      setShowControls((prev) => !prev);
      lastTap.current = now;
    }
  };

  return (
    <View style={styles.container}>
      {/* Video */}
      <View style={{ width: "100%", height: videoHeight }}>
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={{ width: "100%", height: "100%", backgroundColor: "#000" }}
          resizeMode="contain"
          shouldPlay={false}
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        />

        {/* Double-tap areas */}
        <View style={{ position: "absolute", width: "100%", height: "100%", flexDirection: "row" }}>
          <TouchableWithoutFeedback onPress={() => handleTapArea("left")}>
            <View style={{ width: "50%", height: "100%" }} />
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => handleTapArea("right")}>
            <View style={{ width: "50%", height: "100%" }} />
          </TouchableWithoutFeedback>
        </View>
      </View>

      {/* Overlay Play Button */}
      {!isPlaying && (
        <Animated.View style={[styles.overlayPlayButton, { opacity: overlayOpacity }]}>
          <Ionicons name="play-circle" size={100} color="rgba(30,177,252,0.8)" />
        </Animated.View>
      )}

      {/* Skip Animations */}
      {skipForwardVisible && (
        <Animated.View style={[styles.skipTextContainer, { right: 50, transform: [{ translateY: skipAnimForward }] }]}>
          <Text style={styles.skipText}>+10s</Text>
        </Animated.View>
      )}
      {skipBackwardVisible && (
        <Animated.View style={[styles.skipTextContainer, { left: 50, transform: [{ translateY: skipAnimBackward }] }]}>
          <Text style={styles.skipText}>-10s</Text>
        </Animated.View>
      )}

      {/* Controls */}
      {showControls && (
        <Animated.View style={[styles.controlsContainer, { opacity: controlOpacity }]}>
          <View style={styles.sliderContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={position}
              minimumTrackTintColor="#1EB1FC"
              maximumTrackTintColor="#ccc"
              thumbTintColor="#1EB1FC"
              onSlidingComplete={async (val) => {
                if (videoRef.current) await videoRef.current.setPositionAsync(val);
              }}
            />
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity onPress={skipBackward} style={styles.iconButton}>
              <Ionicons name="play-back" size={36} color="#fff" />
            </TouchableOpacity>

            <Animated.View style={{ transform: [{ scale: playScale }] }}>
              <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
                <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={64} color="#1EB1FC" />
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity onPress={skipForward} style={styles.iconButton}>
              <Ionicons name="play-forward" size={36} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleMute} style={styles.iconButton}>
              <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={36} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => (isFullScreen ? exitFullScreen() : enterFullScreen())}
              style={styles.iconButton}
            >
              <Ionicons name={isFullScreen ? "contract" : "expand"} size={36} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", justifyContent: "center" },
  controlsContainer: { position: "absolute", bottom: 0, width: "100%" },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  slider: { flex: 1, marginHorizontal: 10 },
  timeText: { color: "#fff", width: 50, textAlign: "center" },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  iconButton: { paddingHorizontal: 5 },
  playButton: { marginHorizontal: 10 },
  skipTextContainer: {
    position: "absolute",
    top: "40%",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 8,
  },
  skipText: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  overlayPlayButton: {
    position: "absolute",
    alignSelf: "center",
    top: "40%",
  },
});
















