import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import socket from "../utils/socket";

export default function HomeScreen({ navigation, route }) {
  const user = route.params?.user || {};
  const [rating, setRating] = useState(user?.rating || 1000);

  const [rated, setRated] = useState(route.params?.rated ?? true);

  useEffect(() => {
    socket.on("rating_update", ({ rating }) => {
      setRating(rating);
    });

    return () => socket.off("rating_update");
  }, []);

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <LinearGradient
      colors={["#020c1b", "#021f3f", "#03396c"]}
      style={styles.container}
    >
      <View style={styles.userCard}>
        <Ionicons name="person-circle-outline" size={32} color="#00e5ff" />

        <View style={{ marginLeft: 10 }}>
          <Text style={styles.username}>{user?.username}</Text>
          <Text style={styles.rating}>{rating}</Text>
        </View>

        <Ionicons name="star" size={20} color="#00e5ff" />
      </View>

      <View style={styles.toggleContainer}>
        <Text style={styles.toggleText}>
          {rated ? "RATED MODE " : "UNRATED MODE"}
        </Text>

        <Switch
          value={rated}
          onValueChange={() => setRated((prev) => !prev)}
          trackColor={{ false: "#555", true: "#00e5ff" }}
          thumbColor="#fff"
        />
      </View>

      <View style={styles.center}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("Matchmaking", {
              user,
              mode: "sprint",
              rated,
            })
          }
        >
          <LinearGradient
            colors={["rgba(0,51,102,0.8)", "rgba(0,198,255,0.8)"]}
            style={styles.button}
          >
            <Text style={styles.buttonText}>SPRINT DUELS</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate("Matchmaking", {
              user,
              mode: "fastest",
              rated,
            })
          }
        >
          <LinearGradient
            colors={["rgba(0,51,102,0.8)", "rgba(0,198,255,0.8)"]}
            style={styles.button}
          >
            <Text style={styles.buttonText}>FAST & FIRST FINGER DUELS</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Linking.openURL("https://matcattiks.onrender.com/");
          }}
        >
          <LinearGradient
            colors={["rgba(126,34,206,0.8)", "rgba(168,85,247,0.8)"]}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Play MatCattiks</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>LOGOUT</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  userCard: {
    position: "absolute",
    top: 50,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#00e5ff",
    backgroundColor: "rgba(0,0,0,0.4)",
    shadowColor: "#00e5ff",
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },

  username: {
    color: "#fff",
    fontSize: 12,
  },

  rating: {
    color: "#00e5ff",
    fontSize: 18,
    fontWeight: "bold",
  },

  toggleContainer: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 10,
  },

  toggleText: {
    color: "#00e5ff",
    marginBottom: 5,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "box-none",
  },

  button: {
    width: 300,
    padding: 20,
    borderRadius: 15,
    marginVertical: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    shadowColor: "#00e5ff",
    shadowOpacity: 0.7,
    shadowRadius: 12,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 2,
  },

  logoutBtn: {
    position: "absolute",
    bottom: 30,
    right: 20,

    paddingVertical: 10,
    paddingHorizontal: 20,

    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#00e5ff",

    backgroundColor: "rgba(255,255,255,0.08)",

    shadowColor: "#00e5ff",
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },

  logoutText: {
    color: "#00e5ff",
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
