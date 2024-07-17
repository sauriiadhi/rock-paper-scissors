import React, { useEffect, useState } from 'react';
import { Routes, Route,useNavigate } from 'react-router-dom';
import Auth from './components/Auth';
import Lobby from './components/Lobby';
import Game from './components/Game';
import Leaderboard from './components/Leaderboard';
import { handleVisibilityChange } from './visibilityHandler';

function App() {
  const [username, setUsername] = useState('');
  const [opponent, setOpponent] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = sessionStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
      handleVisibilityChange(storedUsername);
      navigate('/lobby');
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Auth setUsername={setUsername} />} />
      <Route path="/lobby" element={<Lobby username={username} setOpponent={setOpponent} />} />
      <Route path="/game" element={<Game player1={username} player2={opponent} />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
    </Routes>
  );
}

export default App;
