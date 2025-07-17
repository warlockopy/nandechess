import React, { useEffect, useState, useRef } from 'react';
import Chessboard from 'chessboardjsx';
import io from 'socket.io-client';
import { Chess } from 'chess.js';
import './App.css';

const BACKEND_URL = 'http://localhost:4000';

function App() {
  const [gameId, setGameId] = useState('');
  const [fen, setFen] = useState('start');
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [status, setStatus] = useState('');
  const [joined, setJoined] = useState(false);
  const [inputGameId, setInputGameId] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const chessRef = useRef(new Chess());
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(BACKEND_URL);
    socketRef.current.on('gameState', (fen) => {
      chessRef.current.load(fen);
      setFen(fen);
    });
    socketRef.current.on('move', ({ fen }) => {
      chessRef.current.load(fen);
      setFen(fen);
      setIsMyTurn(true);
    });
    socketRef.current.on('startGame', () => {
      setStatus('¡Partida iniciada!');
      setIsMyTurn(true);
    });
    socketRef.current.on('gameOver', ({ result }) => {
      setStatus('Fin de la partida: ' + result);
      setGameOver(true);
    });
    return () => socketRef.current.disconnect();
  }, []);

  const createGame = async () => {
    const res = await fetch(BACKEND_URL + '/create-game', { method: 'POST' });
    const data = await res.json();
    setGameId(data.gameId);
    setJoined(true);
    socketRef.current.emit('joinGame', { gameId: data.gameId });
    setStatus('Esperando a otro jugador...');
  };

  const joinGame = () => {
    setGameId(inputGameId);
    setJoined(true);
    socketRef.current.emit('joinGame', { gameId: inputGameId });
    setStatus('Esperando a que inicie la partida...');
  };

  const onDrop = ({ sourceSquare, targetSquare, piece }) => {
    if (!isMyTurn || gameOver) return;
    const move = chessRef.current.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: piece[1] === 'P' ? 'q' : undefined,
    });
    if (move) {
      setFen(chessRef.current.fen());
      setIsMyTurn(false);
      socketRef.current.emit('move', {
        gameId,
        from: sourceSquare,
        to: targetSquare,
        promotion: move.promotion,
      });
    }
  };

  return (
    <div className="App">
      <h1>Ajedrez Multijugador</h1>
      {!joined ? (
        <div>
          <button onClick={createGame}>Crear partida</button>
          <div style={{ margin: '20px' }}>
            <input
              type="text"
              placeholder="ID de partida"
              value={inputGameId}
              onChange={e => setInputGameId(e.target.value)}
            />
            <button onClick={joinGame}>Unirse a partida</button>
          </div>
        </div>
      ) : (
        <div>
          <p><b>ID de partida:</b> {gameId}</p>
          <p>{status}</p>
          <Chessboard
            width={400}
            position={fen}
            onDrop={onDrop}
            draggable={!gameOver && isMyTurn}
            boardStyle={{ margin: 'auto' }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
