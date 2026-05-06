function calculateElo(r1, r2, result) {
  const K = 32;

  const expected1 = 1 / (1 + Math.pow(10, (r2 - r1) / 400));
  const expected2 = 1 / (1 + Math.pow(10, (r1 - r2) / 400));

  const score1 = result === 1 ? 1 : 0;
  const score2 = result === 1 ? 0 : 1;

  return {
    newR1: Math.round(r1 + K * (score1 - expected1)),
    newR2: Math.round(r2 + K * (score2 - expected2)),
  };
}

module.exports = { calculateElo };
