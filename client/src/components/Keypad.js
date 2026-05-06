import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function Keypad({ onPress }) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {keys.map((k) => (
          <TouchableOpacity
            key={k}
            style={styles.key}
            onPress={() => onPress(k)}
          >
            <Text style={styles.text}>{k}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.bottomRow}>
        <TouchableOpacity
          style={[styles.key, styles.wide]}
          onPress={() => onPress("del")}
        >
          <Text style={styles.text}>DEL</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 300,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  key: {
    width: 55,
    height: 45,
    margin: 6,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },

  wide: {
    width: 130,
  },

  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
});
