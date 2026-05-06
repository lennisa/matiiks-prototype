const store = require("../data/store.js");
const { generateQuestion } = require("../game/gameLogic.js");
const { createMatch } = require("../game/matchManager.js");

const { calculateElo } = require("../utils/elo.js");
const User = require("../models/User.js");

module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("find_match", ({ user, mode, rated }) => {
      const queue = rated ? store.ratedQueue : store.unratedQueue;

      const opponentIndex = queue.findIndex(
        (p) => p.mode === mode && p.rated === !!rated,
      );

      if (opponentIndex !== -1) {
        const opponent = queue.splice(opponentIndex, 1)[0];

        const roomId = createMatch(
          { user, socket },
          { user: opponent.user, socket: opponent.socket },
          mode,
          !!rated,
        );

        socket.join(roomId);
        socket.roomId = roomId;
        opponent.socket.roomId = roomId;
        opponent.socket.join(roomId);

        startGame(io, roomId, false);
      } else {
        queue.push({ socket, user, mode, rated: !!rated });

        setTimeout(() => {
          const stillWaiting = queue.find((p) => p.socket.id === socket.id);

          if (!stillWaiting || !stillWaiting.user) {
            console.log("User already left matchmaking");
            return;
          }

          const safeUser = stillWaiting.user;

          store.ratedQueue = store.ratedQueue.filter(
            (p) => p.socket.id !== socket.id,
          );
          store.unratedQueue = store.unratedQueue.filter(
            (p) => p.socket.id !== socket.id,
          );

          const playerRating = safeUser.rating || 1000;
          const botRating = playerRating + (Math.random() > 0.5 ? 50 : -50);

          const roomId = createMatch(
            { socket, user: safeUser },
            {
              socket: null,
              user: { username: "BOT", rating: botRating },
              isBot: true,
            },
            mode,
            !!rated,
          );

          socket.join(roomId);
          socket.roomId = roomId;

          startGame(io, roomId, true);
        }, 7000);
      }
    });

    socket.on("cancel_search", () => {
      store.ratedQueue = store.ratedQueue.filter(
        (p) => p.socket.id !== socket.id,
      );
      store.unratedQueue = store.unratedQueue.filter(
        (p) => p.socket.id !== socket.id,
      );

      const roomId = socket.roomId;

      if (roomId && store.matches[roomId]) {
        const match = store.matches[roomId];

        if (match.timer) clearInterval(match.timer);

        if (match.botInterval) clearInterval(match.botInterval);

        match.players.forEach((p) => {
          if (p.socket) {
            p.socket.leave(roomId);
            p.socket.roomId = null;

            if (p.socket.id !== socket.id) {
              p.socket.emit("match_aborted");
            }
          }
        });

        delete store.matches[roomId];
      }

      socket.roomId = null;

      console.log("User cancelled matchmaking:", socket.id);
    });

    socket.on("submit_answer", ({ roomId, answer }) => {
      const match = store.matches[roomId];
      if (!match) return;

      const playerIndex = match.players.findIndex(
        (p) => p.socket && p.socket.id === socket.id,
      );
      if (playerIndex === -1) return;

      //Fastest
      if (match.mode === "fastest") {
        const correct = match.currentQuestion?.answer;
        if (!correct || match.locked) return;

        if (answer === correct) {
          match.locked = true;
          match.players[playerIndex].score++;

          const newQ = generateQuestion();
          match.currentQuestion = newQ;

          setTimeout(() => {
            match.locked = false;

            io.to(roomId).emit("score_update", {
              scores: match.players.map((p) => p.score),
              question: newQ,
            });
          }, 100);
        }
      } else {
        const player = match.players[playerIndex];

        if (!match.questions[player.qIndex]) {
          match.questions[player.qIndex] = generateQuestion();
        }

        const currentQ = match.questions[player.qIndex];

        if (answer === currentQ.answer) {
          player.score++;
          player.qIndex++;

          if (!match.questions[player.qIndex]) {
            match.questions.push(generateQuestion());
          }

          match.players.forEach((p, i) => {
            if (!p.socket) return;

            const q = match.questions[p.qIndex];

            p.socket.emit("score_update", {
              scores: match.players.map((pl) => pl.score),
              question: q,
            });
          });
        }
      }
    });
  });
};

async function startGame(io, roomId, isBot) {
  const match = store.matches[roomId];
  if (!match) return;
  console.log("MATCH MODE:", match.mode, "RATED:", match.rated);

  //fastest
  if (match.mode === "fastest") {
    const q = generateQuestion();
    match.currentQuestion = q;

    match.players.forEach((p, index) => {
      if (p.socket) {
        p.socket.emit("match_found", {
          roomId,
          question: q,
          timeLeft: 60,
          playerIndex: index,
        });
      }
    });
  }

  //sprint
  else {
    const firstQ = match.questions[0];

    match.players.forEach((p, index) => {
      if (p.socket) {
        p.socket.emit("match_found", {
          roomId,
          question: firstQ,
          playerIndex: index,
          timeLeft: 60,
        });
      }
    });
  }

  //timer
  let timeLeft = 60;

  io.to(roomId).emit("timer_update", { timeLeft });

  const timer = setInterval(async () => {
    timeLeft--;

    io.to(roomId).emit("timer_update", { timeLeft });

    if (timeLeft <= 0) {
      clearInterval(timer);

      const p1 = match.players[0];
      const p2 = match.players[1];

      const score1 = p1.score > p2.score ? 1 : p1.score < p2.score ? 0 : 0.5;

      let finalRatings = [p1.user.rating, p2.user.rating];

      if (match.rated === true) {
        const [newR1, newR2] = calculateElo(
          p1.user.rating || 1000,
          p2.user.rating || 1000,
          score1,
        );

        console.log("NEW RATINGS:", newR1, newR2);

        await User.findOneAndUpdate(
          { username: p1.user.username },
          { $set: { rating: newR1 } },
        );

        if (p2.user.username !== "BOT") {
          await User.findOneAndUpdate(
            { username: p2.user.username },
            { $set: { rating: newR2 } },
          );
        }

        finalRatings = [newR1, newR2];

        if (p1.socket) {
          p1.socket.emit("rating_update", { rating: newR1 });
        }

        if (p2.socket && p2.user.username !== "BOT") {
          p2.socket.emit("rating_update", { rating: newR2 });
        }
      }

      const p1Initial = p1.initialRating || p1.user.rating || 1000;
      const p2Initial = p2.initialRating || p2.user.rating || 1000;

      io.to(p1.socket.id).emit("game_over", {
        myScore: p1.score,
        oppScore: p2.score,
        ratings: match.rated ? finalRatings : null,
        opponentRating: p2.user.rating || p2Initial,
        opponentOldRating: p2Initial,
        isBot: p2.socket === null,
      });

      if (p2.socket) {
        io.to(p2.socket.id).emit("game_over", {
          myScore: p2.score,
          oppScore: p1.score,
          ratings: match.rated ? [finalRatings[1], finalRatings[0]] : null,
          opponentRating: p1.user.rating || p1Initial,
          opponentOldRating: p1Initial,
          isBot: false,
        });
      }

      delete store.matches[roomId];
    }
  }, 1000);
  match.timer = timer;

  if (isBot) {
    const botInterval = setInterval(() => {
      const match = store.matches[roomId];
      if (!match) {
        clearInterval(botInterval);
        return;
      }

      const bot = match.players[1];

      if (match.mode === "fastest") {
        if (match.locked) return;

        const correct = match.currentQuestion.answer;

        const delay = 800 + Math.random() * 1500;

        setTimeout(() => {
          if (match.locked) return;

          const isCorrect = Math.random() < 0.8;

          if (isCorrect) {
            match.locked = true;
            bot.score++;

            const newQ = generateQuestion();
            match.currentQuestion = newQ;

            setTimeout(() => {
              match.locked = false;

              io.to(roomId).emit("score_update", {
                scores: match.players.map((p) => p.score),
                question: newQ,
              });
            }, 100);
          }
        }, delay);
      } else {
        const bot = match.players[1];

        const qIndex = bot.qIndex || 0;

        const correct = match.questions[qIndex]?.answer;
        if (!correct) return;

        const delay = 800 + Math.random() * 1500;

        setTimeout(() => {
          const isCorrect = Math.random() < 0.85;

          if (isCorrect) {
            bot.score++;
            bot.qIndex++;

            if (!match.questions[bot.qIndex]) {
              match.questions.push(generateQuestion());
            }

            io.to(roomId).emit("score_update", {
              scores: match.players.map((p) => p.score),
            });
          }
        }, delay);
      }
    }, 2000);

    match.botInterval = botInterval;
  }
}
