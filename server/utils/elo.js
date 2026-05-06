function calculateElo(r1, r2, score1) {
  const K = 32;

  const expected1 = 1 / (1 + Math.pow(10, (r2 - r1) / 400));
  const expected2 = 1 / (1 + Math.pow(10, (r1 - r2) / 400));

  const newR1 = r1 + K * (score1 - expected1);
  const newR2 = r2 + K * (1 - score1 - expected2);

  return [Math.round(newR1), Math.round(newR2)];
}

module.exports = { calculateElo };
