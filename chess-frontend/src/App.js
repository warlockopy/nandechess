import React, { useEffect, useState, useRef } from 'react';
import Chessboard from 'chessboardjsx';
import io from 'socket.io-client';
import { Chess } from 'chess.js';
import './App.css';
import Login from './Login';

const BACKEND_URL = 'http://localhost:4000';

function App() {
  return (
    <div className="App">
      <Login />
    </div>
  );
}

export default App;
