function generateQuestion() {
  const ops = ["+", "-", "*", "/"];
  const op = ops[Math.floor(Math.random() * ops.length)];

  let a = Math.floor(Math.random() * 10) + 1;
  let b = Math.floor(Math.random() * 10) + 1;

  if (op === "+") return { a, b, op, answer: a + b };
  if (op === "*") return { a, b, op, answer: a * b };

  if (op === "-") {
    const max = Math.max(a, b);
    const min = Math.min(a, b);
    return { a: max, b: min, op, answer: max - min };
  }

  if (op === "/") {
    const divisor = Math.floor(Math.random() * 9) + 1;
    const answer = Math.floor(Math.random() * 10) + 1;
    const dividend = divisor * answer;

    return { a: dividend, b: divisor, op, answer };
  }
}

module.exports = { generateQuestion };
