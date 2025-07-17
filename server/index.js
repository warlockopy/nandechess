const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // URL del cliente de Vite
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Estado del juego
let gameState = {
  board: initializeBoard(),
  currentPlayer: 'white'
};

function initializeBoard() {
  // Inicializar el tablero de ajedrez
  return Array(8).fill(null).map(() => Array(8).fill(null));
}

// Manejo de conexiones de Socket.IO
io.on('connection', (socket) => {
  console.log('Cliente conectado');

  // Enviar estado inicial del juego
  socket.emit('gameState', gameState);

  // Manejar movimientos
  socket.on('move', ({ from, to }) => {
    // Aquí irá la lógica de validación de movimientos
    console.log('Movimiento recibido:', from, 'a', to);
    
    // Actualizar el estado del juego
    // Emitir el nuevo estado a todos los clientes
    io.emit('gameState', gameState);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
