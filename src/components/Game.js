// src/components/Game.js

import React, { useEffect, useState } from 'react';
import { ref, update, increment, remove, serverTimestamp, onValue } from 'firebase/database';
import { rtdb } from '../firebase';
import { useNavigate } from 'react-router-dom';
import  Modal from 'react-modal';
import styled from 'styled-components';

// Modal styles
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

// Styled components
const GameContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
  text-align: center;
`;

const GameHeader = styled.h2`
  margin-bottom: 20px;
`;

const ModalContent = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  text-align: center;
`;

const ModalHeader = styled.h2`
  color: ${props => props.winner === 'draw' ? '#333' : props.theme.primaryColor};
  font-size: 24px;
  margin-bottom: 10px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;

  button {
    margin: 0 10px;
    padding: 10px 20px;
    font-size: 16px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
      background-color: #0056b3;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
`;

const GameChoices = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;

  button {
    margin: 0 10px;
    padding: 10px 20px;
    font-size: 16px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
      background-color: #0056b3;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
`;

const GameResult = styled.p`
  margin-bottom: 10px;
`;

const GameTimer = styled.p`
  margin-bottom: 20px;
`;

const GameModal = styled(Modal)`
  ${customStyles.content}
`;

function Game({ player1, player2 }) {
  const [choice1, setChoice1] = useState('');
  const [choice2, setChoice2] = useState('');
  const [winner, setWinner] = useState('');
  const [modalIsOpen, setIsOpen] = useState(false);
  const [timer, setTimer] = useState(30); // Timer state
  const navigate = useNavigate();

  const gameId = player1 < player2 ? `${player1}-${player2}` : `${player2}-${player1}`;

  useEffect(() => {
    const gameRef = ref(rtdb, `games/${gameId}`);
    // Set initial game state including timestamp
    update(gameRef, {
      [player1]: { choice: '' },
      [player2]: { choice: '' },
      EndGame: false,
      startTime: serverTimestamp() // Set start time to current server timestamp
    }).then(() => {
      console.log(`Game started successfully for ${gameId}`);
    }).catch((error) => {
      console.error(`Error starting game for ${gameId}:`, error);
    });

    const unsubscribe = onValue(gameRef, (snapshot) => {
      const gameData = snapshot.val();
      if (gameData) {
        setChoice1(gameData[player1]?.choice || '');
        setChoice2(gameData[player2]?.choice || '');
        if (gameData.EndGame) {
          setIsOpen(true); // Open modal if EndGame is true
        }
        // Calculate remaining time based on server timestamp
        if (gameData.startTime) {
          const startTime = new Date(gameData.startTime);
          const currentTime = new Date();
          const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
          const remainingTime = Math.max(0, 30 - elapsedSeconds); // 30 seconds timer
          setTimer(remainingTime);
        }
      }
    });

    return () => unsubscribe();
  }, [gameId, player1, player2]);

  const handleChoice = (player, choice) => {
    const gameRef = ref(rtdb, `games/${gameId}`);
    update(gameRef, { [player]: { choice } }).then(() => {
      console.log(`Choice updated successfully for ${player}`);
    }).catch((error) => {
      console.error(`Error updating choice for ${player}:`, error);
    });
  };

  const determineWinner = () => {
    if (choice1 === choice2) return 'draw';
    if (
      (choice1 === 'rock' && choice2 === 'scissors') ||
      (choice1 === 'scissors' && choice2 === 'paper') ||
      (choice1 === 'paper' && choice2 === 'rock')
    ) {
      return player1;
    } else {
      return player2;
    }
  };

  const endGame = () => {
    const result = determineWinner();
    setWinner(result);

    if (result !== 'draw') {
      const playerRef = ref(rtdb, `players/${result}`);
      update(playerRef, {
        score: increment(1)
      }).then(() => {
        console.log(`Score updated successfully for ${result}`);
      }).catch((error) => {
        console.error(`Error updating score for ${result}:`, error);
      });
    }

    const gameRef = ref(rtdb, `games/${gameId}`);
    update(gameRef, { EndGame: true }).then(() => {
      console.log(`EndGame flag set to true for ${gameId}`);
    }).catch((error) => {
      console.error(`Error setting EndGame flag for ${gameId}:`, error);
    });

    setIsOpen(true); // Open the modal
  };

  const closeModal = () => {
    setIsOpen(false);
    navigate('/lobby');
  };

  const playAgain = () => {
    const gameRef = ref(rtdb, `games/${gameId}`);
    update(gameRef, {
      [player1]: { choice: '' },
      [player2]: { choice: '' },
      EndGame: false,
      startTime: serverTimestamp() // Reset start time on play again
    }).then(() => {
      setChoice1('');
      setChoice2('');
      setIsOpen(false);
      setTimer(30); // Reset timer
      console.log('Choices reset successfully');
    }).catch((error) => {
      console.error('Error resetting choices:', error);
    });
  };

  useEffect(() => {
    if (choice1 && choice2) {
      endGame();
    }
  }, [choice1, choice2]);

  // Timer effect
  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    } else {
      if (!choice1 || !choice2) {
        endGame();
      }
    }
  }, [timer, choice1, choice2]);

  // Delete game data and reset on modal open
  useEffect(() => {
    if (modalIsOpen) {
      const gameRef = ref(rtdb, `games/${gameId}`);
      remove(gameRef).then(() => {
        console.log(`Game data deleted successfully for ${gameId}`);
      }).catch((error) => {
        console.error(`Error deleting game data for ${gameId}:`, error);
      });
    }
  }, [modalIsOpen, gameId]);

  return (
    <GameContainer>
      <GameHeader>{player1} vs {player2}</GameHeader>
      <div>
        <GameResult>{player1}'s choice: {choice1 || 'Waiting...'}</GameResult>
        <GameResult>{player2}'s choice: {choice2 || 'Waiting...'}</GameResult>
      </div>
      <GameChoices>
        <button onClick={() => handleChoice(player1, 'rock')} disabled={!!choice1}>Rock</button>
        <button onClick={() => handleChoice(player1, 'paper')} disabled={!!choice1}>Paper</button>
        <button onClick={() => handleChoice(player1, 'scissors')} disabled={!!choice1}>Scissors</button>
      </GameChoices>
      <GameTimer>Time left: {timer} seconds</GameTimer>

      <Modal
  isOpen={modalIsOpen}
  onRequestClose={closeModal}
  style={customStyles}
  contentLabel="End Game Modal"
>
  <ModalContent>
    <ModalHeader>{winner === 'draw' ? 'It\'s a draw!' : `${winner} wins!`}</ModalHeader>
    <GameResult>{player1}'s choice: {choice1}</GameResult>
    <GameResult>{player2}'s choice: {choice2}</GameResult>
    <ButtonContainer>
      <button onClick={playAgain}>Play Again</button>
      <button onClick={closeModal}>End Game</button>
    </ButtonContainer>
  </ModalContent>
</Modal>
    </GameContainer>
  );
}

export default Game;
