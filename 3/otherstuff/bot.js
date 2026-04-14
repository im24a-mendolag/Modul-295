const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.post('/bot', (request, response) => {
  const { role, turn, history, payoffs } = request.body;

  if (turn === 0 || history.length === 0) {
    return response.json({ move: 'split' });
  }

  const last = history[history.length - 1];
  const myLastMove = last[role];
  const opponentRole = role === 'p1' ? 'p2' : 'p1';
  const opponentLastMove = last[opponentRole];

  const myLastScore = payoffs.matrix[myLastMove][opponentLastMove][role === 'p1' ? 0 : 1];

  // Win-Stay, Lose-Shift: if outcome was good (3 or 5), repeat; if bad (0 or 1), switch
  let move;
  if (myLastScore >= 3) {
    move = myLastMove;
  } else {
    move = myLastMove === 'split' ? 'steal' : 'split';
  }

  response.json({ move });
});

app.listen(port, () => {
  console.log(`Bot listening on port ${port}`);
});
