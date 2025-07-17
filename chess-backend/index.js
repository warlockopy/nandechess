const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { Chess } = require('chess.js');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Almacén simple de partidas
const games = {};

// Crear nueva partida
app.post('/create-game', (req, res) => {
  const gameId = Math.random().toString(36).substr(2, 9);
  games[gameId] = {
    chess: new Chess(),
    players: [],
  };
  res.json({ gameId });
});

io.on('connection', (socket) => {
  socket.on('joinGame', ({ gameId }) => {
    if (!games[gameId]) return;
    if (games[gameId].players.length < 2) {
      games[gameId].players.push(socket.id);
      socket.join(gameId);
      socket.emit('gameState', games[gameId].chess.fen());
      if (games[gameId].players.length === 2) {
        io.to(gameId).emit('startGame');
      }
    }
  });

  socket.on('move', ({ gameId, from, to, promotion }) => {
    const game = games[gameId];
    if (!game) return;
    const move = game.chess.move({ from, to, promotion });
    if (move) {
      io.to(gameId).emit('move', { from, to, promotion, fen: game.chess.fen(), move });
      if (game.chess.game_over()) {
        io.to(gameId).emit('gameOver', { result: game.chess.result() });
      }
    }
  });

  socket.on('disconnect', () => {
    // Opcional: limpiar partidas o notificar desconexión
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Servidor de ajedrez escuchando en puerto ${PORT}`);
});