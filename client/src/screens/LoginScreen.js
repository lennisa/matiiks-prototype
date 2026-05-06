import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL } from "../config";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    if (!username.trim() || !password.trim()) {
      alert("Username and Password cannot be empty");
      return;
    }

    try {
      console.log("LOGIN CLICKED");

      const res = await axios.post(`${BASE_URL}/auth/login`, {
        username,
        password,
      });

      console.log("RESPONSE:", res.data);

      if (res.data.success) {
        navigation.replace("Home", {
          user: res.data.user,
        });
      } else {
        alert(res.data.error || "Login failed");
      }
    } catch (err) {
      console.log("ERROR:", err.message);
      alert("Server error");
    }
  };

  const register = async () => {
    if (!username.trim() || !password.trim()) {
      alert("Username and Password cannot be empty");
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/auth/register`, {
        username,
        password,
      });

      if (res.data.error) {
        alert(res.data.error);
      } else {
        alert("Registered successfully. Now login.");
      }
    } catch (err) {
      console.log("REGISTER ERROR:", err.message);
      alert("Server error");
    }
  };

  return (
    <LinearGradient
      colors={["#020c1b", "#021f3f", "#03396c"]}
      style={styles.container}
    >
      <Text style={styles.logo}>MATIIKS</Text>
      <Text style={styles.subtitle}>Solve. Duel.</Text>

      <View style={styles.card}>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#00e5ff" />
          <TextInput
            placeholder="Username"
            placeholderTextColor="#aaa"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#00e5ff" />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
        </View>

        <TouchableOpacity onPress={login}>
          <LinearGradient colors={["#00c6ff", "#0072ff"]} style={styles.button}>
            <Text style={styles.buttonText}>LOGIN →</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.register}>
          New here?{" "}
          <Text style={styles.registerLink} onPress={register}>
            REGISTER
          </Text>
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 3,
  },

  subtitle: {
    color: "#00e5ff",
    marginBottom: 30,
  },

  card: {
    width: 300,
    padding: 20,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderColor: "#00e5ff",
    borderWidth: 1,
    shadowColor: "#00e5ff",
    shadowOpacity: 0.7,
    shadowRadius: 12,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00e5ff",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },

  input: {
    flex: 1,
    color: "#fff",
    padding: 10,
  },

  button: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    letterSpacing: 1,
  },

  register: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 15,
  },

  registerLink: {
    color: "#00e5ff",
    fontWeight: "bold",
  },
});
