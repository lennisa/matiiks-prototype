import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ConfettiCannon from "react-native-confetti-cannon";
import { CommonActions } from "@react-navigation/native";

export default function ResultScreen({ navigation, route }) {
  const [result, setResult] = useState("");

  const {
    userScore = 0,
    oppScore = 0,
    oldRating = 1000,
    ratings,
    user = {},
    rated = true,
    mode,
    opponentRating = 1000,
    opponentOldRating = 1000,
    isBot = false,
  } = route.params || {};

  const isRated = rated && ratings;

  const newUserRating = isRated ? ratings[0] : oldRating;
  const userDiff = isRated ? newUserRating - oldRating : 0;

  const newOpponentRating = isRated ? ratings[1] : opponentOldRating;
  const opponentDiff = isRated ? newOpponentRating - opponentOldRating : 0;

  useEffect(() => {
    if (userScore > oppScore) setResult("VICTORY");
    else if (userScore < oppScore) setResult("DEFEAT");
    else setResult("TIED");
  }, []);

  const getColor = () => {
    if (result === "VICTORY") return "#00e5ff";
    if (result === "DEFEAT") return "#ff4d4d";
    return "#aaa";
  };

  const goHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: "Home",
            params: {
              user: {
                ...user,
                rating: newUserRating,
              },
              rated,
            },
          },
        ],
      }),
    );
  };

  const playAgain = () => {
    navigation.replace("Matchmaking", {
      user: {
        ...user,
        rating: newUserRating,
      },
      rated,
      mode,
    });
  };

  return (
    <LinearGradient
      colors={["#020c1b", "#021f3f", "#03396c"]}
      style={styles.container}
    >
      {result === "VICTORY" && (
        <ConfettiCannon count={250} origin={{ x: 200, y: 0 }} fadeOut />
      )}

      <Text style={[styles.resultText, { color: getColor() }]}>{result}!</Text>

      {!rated && <Text style={styles.unratedText}>UNRATED MATCH</Text>}

      <View style={styles.row}>
        <View style={styles.card}>
          <Text style={styles.label}>You</Text>

          <Text style={styles.score}>{userScore}</Text>

          <Text style={styles.ratingMain}>{newUserRating}</Text>

          <Text
            style={[
              styles.ratingDiff,
              { color: userDiff >= 0 ? "#00ff9c" : "#ff4d4d" },
            ]}
          >
            {userDiff > 0 ? `+${userDiff}` : userDiff}
          </Text>
        </View>

        <Text style={styles.vs}>VS</Text>

        <View style={styles.card}>
          <Text style={styles.label}>{isBot ? "Bot" : "Opponent"}</Text>

          <Text style={styles.score}>{oppScore}</Text>

          <Text style={styles.ratingMain}>{newOpponentRating}</Text>

          <Text
            style={[
              styles.ratingDiff,
              { color: opponentDiff >= 0 ? "#00ff9c" : "#ff4d4d" },
            ]}
          >
            {opponentDiff > 0 ? `+${opponentDiff}` : opponentDiff}
          </Text>
        </View>
      </View>

      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.button} onPress={playAgain}>
          <Text style={styles.btnText}>PLAY AGAIN</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={goHome}>
          <Text style={styles.btnText}>HOME</Text>
        </TouchableOpacity>
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

  resultText: {
    fontSize: 44,
    fontWeight: "bold",
    marginBottom: 20,
    textShadowColor: "#00e5ff",
    textShadowRadius: 20,
  },

  unratedText: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 20,
    letterSpacing: 1,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },

  card: {
    width: 140,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
  },

  label: {
    color: "#aaa",
    marginBottom: 5,
  },

  score: {
    fontSize: 26,
    color: "#fff",
    marginVertical: 5,
  },

  ratingMain: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
  },

  ratingDiff: {
    marginTop: 4,
    fontWeight: "bold",
  },

  vs: {
    color: "#fff",
    fontSize: 22,
    marginHorizontal: 20,
  },

  btnRow: {
    flexDirection: "row",
    gap: 20,
  },

  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#00e5ff",
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
