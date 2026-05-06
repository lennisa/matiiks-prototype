const store = require("../data/store.js");
const { generateQuestion } = require("../game/gameLogic.js");

function createMatch(p1, p2, mode, rated) {
  const roomId = "room_" + Date.now();

  store.matches[roomId] = {
    players: [
      {
        socket: p1.socket,
        user: p1.user,
        score: 0,
        qIndex: 0,
        initialRating: p1.user.rating,
      },
      {
        socket: p2.socket,
        user: p2.user,
        score: 0,
        qIndex: 0,
        initialRating: p2.user.rating,
      },
    ],
    mode,
    rated,
    questions: [generateQuestion()],
  };

  return roomId;
}

function getMatch(roomId) {
  return store.matches[roomId];
}

function endGame(io, roomId, calculateElo) {
  const match = store.matches[roomId];
  if (!match) return;

  const p1 = match.players[0];
  const p2 = match.players[1];

  let newRatings = [p1.user.rating, p2.user.rating];

  if (match.rated) {
    const delta = calculateElo(
      p1.user.rating,
      p2.user.rating,
      p1.score,
      p2.score,
    );

    newRatings = [p1.user.rating + delta, p2.user.rating - delta];

    p1.user.rating = newRatings[0];
    p2.user.rating = newRatings[1];
  }

  io.to(p1.socket.id).emit("game_over", {
    myScore: p1.score,
    oppScore: p2.score,
    ratings: newRatings,
    opponentRating: p2.user.rating,
    opponentOldRating: p2.initialRating,
    isBot: p2.isBot || false,
  });

  io.to(p2.socket.id).emit("game_over", {
    myScore: p2.score,
    oppScore: p1.score,
    ratings: [newRatings[1], newRatings[0]],
    opponentRating: p1.user.rating,
    opponentOldRating: p1.initialRating,
    isBot: p1.isBot || false,
  });

  delete store.matches[roomId];
}

module.exports = {
  createMatch,
  getMatch,
  endGame,
};
