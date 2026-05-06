function botAnswer(question) {
  const accuracy = 0.75;

  const correct = Math.random() < accuracy;

  if (correct) return question.answer;

  return question.answer + Math.floor(Math.random() * 3) + 1;
}

module.exports = { botAnswer };
