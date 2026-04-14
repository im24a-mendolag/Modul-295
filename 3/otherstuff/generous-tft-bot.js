const express = require('express');
const app = express();
const port = 3001;

app.use(express.json());

app.post('/bot', (request, response) => {
  const { role, turn, history } = request.body;

  if (turn === 0 || history.length === 0) {
    return response.json({ move: 'split' });
  }

  const opponentRole = role === 'p1' ? 'p2' : 'p1';
  const opponentLastMove = history[history.length - 1][opponentRole];

  // Generous Tit for Tat: copy opponent, but forgive a steal 1/3 of the time
  let move;
  if (opponentLastMove === 'steal' && Math.random() < 0.33) {
    move = 'split'; // forgive
  } else {
    move = opponentLastMove; // copy
  }

  response.json({ move });
});

app.listen(port, () => {
  console.log(`Generous TfT bot listening on port ${port}`);
});
