import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import socket from "../utils/socket";
import InfinityLoader from "../components/InfinityLoader";
import { SafeAreaView } from "react-native";

export default function MatchmakingScreen({ navigation, route }) {
  const { user, mode, rated } = route.params;

  useEffect(() => {
    socket.off("match_found");

    socket.emit("find_match", { user, mode, rated });

    const matchHandler = ({ roomId, question, playerIndex }) => {
      console.log("MATCH FOUND");

      navigation.replace("Game", {
        roomId,
        question,
        user,
        playerIndex,
      });
    };

    socket.on("match_found", matchHandler);

    return () => {
      socket.off("match_found", matchHandler);
    };
  }, []);

  const handleCancel = () => {
    socket.emit("cancel_search");

    socket.off("match_found");

    navigation.replace("Home", { user });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={["#020c1b", "#021f3f", "#03396c"]}
        style={styles.container}
      >
        <View style={styles.loader}>
          <InfinityLoader />
        </View>

        <Text style={styles.text}>..... CONNECTING YOU TO YOUR GAME .....</Text>

        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
          <Text style={styles.cancelText}>CANCEL SEARCH</Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loader: {
    marginBottom: 40,
    transform: [{ scale: 1.2 }],
  },

  text: {
    color: "#ffffff",
    fontSize: 16,
    letterSpacing: 2,
    marginBottom: 50,
    opacity: 0.85,
  },

  cancelBtn: {
    position: "absolute",
    bottom: 20,

    alignSelf: "center",
    width: 220,
    paddingVertical: 12,

    borderRadius: 18,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",

    backgroundColor: "rgba(0, 200, 255, 0.15)",

    alignItems: "center",

    shadowColor: "#00e5ff",
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  cancelText: {
    color: "#fff",
    fontWeight: "bold",
    letterSpacing: 1.5,
    textShadowColor: "#00e5ff",
    textShadowRadius: 10,
  },
});
