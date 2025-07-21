const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

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
app.use(session({ secret: 'chess-secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(new GoogleStrategy({
  clientID: 'GOOGLE_CLIENT_ID',
  clientSecret: 'GOOGLE_CLIENT_SECRET',
  callbackURL: 'http://localhost:3000/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

passport.use(new FacebookStrategy({
  clientID: 'FACEBOOK_APP_ID',
  clientSecret: 'FACEBOOK_APP_SECRET',
  callbackURL: 'http://localhost:3000/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'emails']
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

// Rutas de autenticación
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// Callbacks
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect('http://localhost:5173');
});
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), (req, res) => {
  res.redirect('http://localhost:5173');
});

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
