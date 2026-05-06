import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, BackHandler } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import socket from "../utils/socket";
import Keypad from "../components/Keypad";
import { formatQuestion } from "../utils/questionGenerator";
import { useNavigation } from "@react-navigation/native";

export default function GameScreen({ route }) {
  const navigation = useNavigation();
  const { roomId, question, user, playerIndex } = route.params;

  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [currentQ, setCurrentQ] = useState(question);
  const [input, setInput] = useState("");
  const [scores, setScores] = useState([0, 0]);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    socket.off("score_update");
    socket.off("timer_update");
    socket.off("game_over");

    const scoreHandler = ({ scores, question }) => {
      setScores(scores);

      if (question) {
        setCurrentQ(question);
        setInput("");
      }

      setLocked(false);
    };

    const timerHandler = ({ timeLeft }) => {
      setTimeLeft(timeLeft);
    };

    const gameOverHandler = ({
      myScore,
      oppScore,
      ratings,
      opponentRating,
      opponentOldRating,
      isBot,
    }) => {
      if (gameOver) return;
      if (myScore === undefined || oppScore === undefined) return;

      setGameOver(true);

      navigation.replace("Result", {
        userScore: myScore,
        oppScore: oppScore,
        oldRating: user?.rating,
        ratings,
        user,
        rated: route.params?.rated,
        mode: route.params?.mode,
        opponentRating,
        opponentOldRating,
        isBot,
      });
    };

    socket.on("score_update", scoreHandler);
    socket.on("timer_update", timerHandler);
    socket.on("game_over", gameOverHandler);

    return () => {
      socket.off("score_update", scoreHandler);
      socket.off("timer_update", timerHandler);
      socket.off("game_over", gameOverHandler);
    };
  }, []);

  useEffect(() => {
    socket.off("match_aborted");
    const abortHandler = () => {
      navigation.replace("Home", { user });
    };

    socket.on("match_aborted", abortHandler);

    return () => {
      socket.off("match_aborted", abortHandler);
    };
  }, []);

  useEffect(() => {
    if (currentQ?.answer === 0 && !locked && !gameOver) {
      setLocked(true);

      socket.emit("submit_answer", {
        roomId,
        answer: 0,
      });
    }
  }, [currentQ, locked, gameOver]);

  const handleKeypad = (val) => {
    if (gameOver || locked) return;

    if (val === "del") {
      setInput((prev) => prev.slice(0, -1));
      return;
    }

    setInput((prev) => {
      const newInput = prev + val;

      if (newInput === "") return newInput;

      const numericInput = Number(newInput);
      const correctAnswer = currentQ?.answer;

      if (numericInput === correctAnswer) {
        setLocked(true);

        socket.emit("submit_answer", {
          roomId,
          answer: numericInput,
        });

        return "";
      }

      return newInput;
    });
  };

  return (
    <LinearGradient
      colors={["#021b2e", "#031f3f", "#052a55"]}
      style={styles.container}
    >
      <View style={styles.topRow}>
        <View style={styles.card}>
          <Text style={styles.cardText}>
            You: <Text style={styles.bold}>{scores[playerIndex]}</Text>
          </Text>
          <View style={styles.divider} />
          <Text style={styles.cardText}>
            Opponent: <Text style={styles.bold}>{scores[1 - playerIndex]}</Text>
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardText}>Time Left</Text>
          <Text style={styles.timer}>{timeLeft}s</Text>
        </View>
      </View>

      <Text style={styles.question}>{formatQuestion(currentQ)}</Text>

      <View style={styles.inputBox}>
        <Text style={styles.inputText}>{input || "|"}</Text>
      </View>

      <Keypad onPress={handleKeypad} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  topRow: {
    position: "absolute",
    top: 70,
    width: "85%",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  card: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    backgroundColor: "rgba(255,255,255,0.08)",
    minWidth: 120,
    alignItems: "center",
  },

  cardText: {
    color: "#fff",
    fontSize: 14,
  },

  bold: {
    fontWeight: "bold",
  },

  divider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(255,255,255,0.4)",
    marginVertical: 4,
  },

  timer: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
    marginTop: 5,
  },

  question: {
    fontSize: 48,
    color: "#fff",
    marginBottom: 20,
  },

  inputBox: {
    width: 220,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    borderRadius: 10,
    paddingVertical: 6,
    alignItems: "center",
    marginBottom: 25,
  },

  inputText: {
    fontSize: 22,
    color: "#fff",
  },
});
