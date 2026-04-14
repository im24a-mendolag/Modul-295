const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.post('/bot', (request, response) => {
  const { role, turn, history } = request.body;

  // First move: cooperate
  if (turn === 0 || history.length === 0) {
    return response.json({ move: 'split' });
  }

  const opponentRole = role === 'p1' ? 'p2' : 'p1';

  // Count how often opponent has cooperated
  const opponentMoves = history.map(h => h[opponentRole]);
  const cooperationRate = opponentMoves.filter(m => m === 'split').length / opponentMoves.length;

  const last = history[history.length - 1];
  const opponentLastMove = last[opponentRole];

  let move;

  if (cooperationRate > 0.7) {
    // Opponent is mostly cooperative — keep splitting, add small noise to avoid exploitation
    move = Math.random() < 0.05 ? 'steal' : 'split';
  } else if (cooperationRate < 0.3) {
    // Opponent is mostly defecting — retaliate, but probe occasionally to test if they changed
    move = Math.random() < 0.15 ? 'split' : 'steal';
  } else {
    // Mixed opponent — use Tit for Tat with forgiveness
    if (opponentLastMove === 'steal' && Math.random() < 0.25) {
      move = 'split'; // forgive
    } else {
      move = opponentLastMove;
    }
  }

  response.json({ move });
});

app.listen(port, () => {
  console.log(`Adaptive bot listening on port ${port}`);
});
