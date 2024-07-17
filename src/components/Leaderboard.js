import React, { useEffect, useState } from 'react';
import { rtdb } from '../firebase';
import { ref, onValue, off, set } from 'firebase/database';

import Modal from 'react-modal';


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

function Leaderboard({ currentUser }) {
  const [players, setPlayers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [requestingPlayer, setRequestingPlayer] = useState(null);
  const [modalIsOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const playersRef = ref(rtdb, 'players');
    const handleValueChange = (snapshot) => {
      const playersData = snapshot.val();
      if (playersData) {
        const playerList = Object.keys(playersData).map(key => ({
          username: key,
          score: playersData[key].score
        }));
        setPlayers(playerList);
      }
    };

    onValue(playersRef, handleValueChange);

    return () => {
      off(playersRef, 'value', handleValueChange); // Use off to unsubscribe
    };
  }, []);

  useEffect(() => {
    const gameRequestsRef = ref(rtdb, `gameRequests/${currentUser.username}`);
    const handleRequests = (snapshot) => {
      const requestsData = snapshot.val();
      if (requestsData) {
        const incomingRequests = Object.keys(requestsData).filter(key => !requestsData[key].accepted);
        setRequests(incomingRequests);
      }
    };

    onValue(gameRequestsRef, handleRequests);

    return () => {
      off(gameRequestsRef, 'value', handleRequests); // Use off to unsubscribe
    };
  }, [currentUser]);

  const handleGameRequest = (requestedPlayer) => {
    const gameRequestsRef = ref(rtdb, `gameRequests/${requestedPlayer}/${currentUser.username}`);
    set(gameRequestsRef, {
      requestedBy: currentUser.username,
      accepted: false
    }).then(() => {
      console.log(`Game request sent to ${requestedPlayer}`);
      setRequestingPlayer(requestedPlayer);
      setIsOpen(true);
    }).catch((error) => {
      console.error('Error sending game request:', error);
    });
  };

  const acceptGameRequest = () => {
    const gameRequestRef = ref(rtdb, `gameRequests/${currentUser.username}/${requestingPlayer}`);
    set(gameRequestRef, {
      ...requests[requestingPlayer],
      accepted: true
    }).then(() => {
      console.log(`Accepted game request from ${requestingPlayer}`);
      setIsOpen(false);
    }).catch((error) => {
      console.error('Error accepting game request:', error);
    });
  };

  const declineGameRequest = () => {
    const gameRequestRef = ref(rtdb, `gameRequests/${currentUser.username}/${requestingPlayer}`);
    set(gameRequestRef, null).then(() => {
      console.log(`Declined game request from ${requestingPlayer}`);
      setIsOpen(false);
    }).catch((error) => {
      console.error('Error declining game request:', error);
    });
  };

  const closeModal = () => {
    setIsOpen(false);
    setRequestingPlayer(null);
  };

  return (
    <div className="leaderboard">
      <h2>Leaderboard</h2>
      <ul>
        {players.sort((a, b) => b.score - a.score).map(player => (
          <li key={player.username}>
            {player.username}: {player.score}
            {player.username !== currentUser.username && (
              <button onClick={() => handleGameRequest(player.username)}>Request Game</button>
            )}
          </li>
        ))}
      </ul>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Game Request Modal"
      >
        <h2>Game Request</h2>
        <p>{requestingPlayer} has requested a game with you!</p>
        <button onClick={acceptGameRequest}>Accept</button>
        <button onClick={declineGameRequest}>Decline</button>
        <button onClick={closeModal}>Close</button>
      </Modal>
    </div>
  );
}

export default Leaderboard;
