import React, { useEffect, useState } from 'react';
import { ref, onValue, off, update } from 'firebase/database';
import Modal from 'react-modal';
import { rtdb } from '../firebase';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const WarnContainer = styled.p`
background: red;
    border-radius: 4px;
    color: white;
    padding: 7px;`;
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '400px',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
};

Modal.setAppElement('#root');

const LobbyContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const UserInfo = styled.div`
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);

  button{
    border: none;
    cursor: pointer;
    font-size: 14px;
    padding:10px 20px;
    color: white;
    background: linear-gradient(-60deg, green 50%, blue 50%);
    border-radius: 16px;
    }
`;

const Leaderboard = styled.div`
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);

  h2 {
    margin-bottom: 10px;
  }

  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;

    li {
      margin-bottom: 10px;
      padding: 10px;
      border-radius: 5px;
      background-color: #ffffff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);

      &:hover {
        background-color: #f0f0f0;
      }
    }
  }
`;

const OnlinePlayers = styled.div`
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);

  h2 {
    margin-bottom: 10px;
  }

  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;

    li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      padding: 10px;
      border-radius: 5px;
      background-color: #ffffff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);

      &:hover {
        background-color: #f0f0f0;
      }

      button {
        margin-left: 10px;
        padding: 8px 16px;
        font-size: 14px;
        border: none;
        border-radius: 5px;
        cursor: pointer;

        &:hover {
          opacity: 0.8;
        }
      }
    }
  }
`;

const InviteModalContent = styled.div`
  text-align: center;

  button {
    margin: 10px;
    padding: 10px 20px;
    font-size: 16px;
    border: none;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }
`;

function Lobby({ username, setOpponent }) {
  const [players, setPlayers] = useState([]);
  const [waitingList, setWaitingList] = useState([]);
  const [inviteModalIsOpen, setInviteModalIsOpen] = useState(false);
  const [invitedPlayer, setInvitedPlayer] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const navigate = useNavigate();
  const [inviteTimeout, setInviteTimeout] = useState(null);

  useEffect(() => {
    const playersRef = ref(rtdb, 'players');

    const handlePlayersChange = (snapshot) => {
      const playersData = snapshot.val();
      if (playersData) {
        const playerList = Object.keys(playersData);

        const playerObjects = playerList.map(player => ({
          name: player,
          score: playersData[player]?.score || 0,
          active: playersData[player]?.active || false,
          inviteReceived: playersData[player]?.inviteReceived || null,
        }));

        const sortedPlayers = playerObjects.sort((a, b) => b.score - a.score);

        setPlayers(sortedPlayers);

        const activePlayers = sortedPlayers.filter(player => player.active && player.name !== username);
        setWaitingList(activePlayers);
      }
    };

    onValue(playersRef, handlePlayersChange);

    return () => {
      off(playersRef, 'value', handlePlayersChange);
    };
  }, [username]);

  const handlePlay = (player) => {
    setOpponent(player.name);
    navigate('/game');
  };

  const openInviteModal = (player) => {
    setSelectedPlayer(player);
    setInviteModalIsOpen(true);
  };

  const closeInviteModal = () => {
    clearInviteTimeout(); // Clear the timeout if the modal is closed
    setSelectedPlayer(null);
    setInviteModalIsOpen(false);
  };

  const clearInviteTimeout = () => {
    if (inviteTimeout) {
      clearTimeout(inviteTimeout);
      setInviteTimeout(null);
    }
  };

  const sendInvite = () => {
    if (selectedPlayer) {
      const playerRef = ref(rtdb, `players/${selectedPlayer.name}`);
      update(playerRef, { inviteReceived: username })
        .then(() => {
          console.log(`Invite sent to ${selectedPlayer.name}`);

          // Set a timeout to clear the invite after 30 seconds
          const timeout = setTimeout(() => {
            update(playerRef, { inviteReceived: null })
              .then(() => {
                console.log(`Invite to ${selectedPlayer.name} expired`);
                closeInviteModal();
              })
              .catch((error) => {
                console.error(`Error expiring invite to ${selectedPlayer.name}:`, error);
              });
          }, 30000); // 30 seconds

          setInviteTimeout(timeout);
          closeInviteModal();
          setOpponent(selectedPlayer.name);
          navigate('/game');
        })
        .catch((error) => {
          console.error(`Error sending invite to ${selectedPlayer.name}:`, error);
        });
    }
  };

  const acceptInvite = () => {
    if (invitedPlayer) {
      clearInviteTimeout(); // Clear the timeout when accepting
      const playerRef = ref(rtdb, `players/${username}`);
      update(playerRef, { inviteReceived: null })
        .then(() => {
          console.log(`Accepted invite from ${invitedPlayer}`);
          setOpponent(invitedPlayer);
          setInvitedPlayer(null); // Clear invited player state
          closeInviteModal(); // Close invite modal
          navigate('/game');
        })
        .catch((error) => {
          console.error(`Error accepting invite from ${invitedPlayer}:`, error);
        });
    }
  };

  const declineInvite = () => {
    if (invitedPlayer) {
      clearInviteTimeout();
      const playerRef = ref(rtdb, `players/${username}`);
      update(playerRef, { inviteReceived: null })
        .then(() => {
          console.log(`Declined invite from ${invitedPlayer}`);
          setInvitedPlayer(null);
          closeInviteModal();
        })
        .catch((error) => {
          console.error(`Error declining invite from ${invitedPlayer}:`, error);
        });
    }
  };

  useEffect(() => {
    if (invitedPlayer) {
      const timer = setTimeout(() => {
        declineInvite();
      }, 30000); // 30 seconds

      return () => clearTimeout(timer);
    }
  }, [invitedPlayer]);

  return (
    <LobbyContainer>
      <UserInfo>
        <h2>Your Info</h2>
        <p>Name: {username}</p>
        <p>Score: {players.find(player => player.name === username)?.score || 0}</p>
        {players.find(player => player.name === username)?.inviteReceived && (
          <button onClick={() => {
            const player = players.find(player => player.name === username);
            setInvitedPlayer(player.inviteReceived);
            setInviteModalIsOpen(true);
          }}>Accept Invitation</button>
        )}
      </UserInfo>
      <WarnContainer>Please ensure that both tabs or players are active so that others can see you online.(like split screen) If your tab is not opened, you will be considered offline.</WarnContainer>
      {waitingList.length > 0 && (
        <OnlinePlayers>
          <h2>Online Players</h2>
          <ul>
            {waitingList.map(waitingPlayer => (
              <li key={waitingPlayer.name}>
                <span>{waitingPlayer.name}</span>
                <div>
                  <button onClick={() => handlePlay(waitingPlayer)}>Play</button>
                  {username !== waitingPlayer.name && (
                    <button onClick={() => openInviteModal(waitingPlayer)}>Invite</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </OnlinePlayers>
      )}

      <Leaderboard>
        <h2>Leaderboard</h2>
        <ul>
          {players.map(player => (
            <li key={player.name}>
              {player.name} {player.name === username ? '(You)' : ''} - Score: {player.score}
              {player.active ? ' - Active' : ' - Inactive'}
            </li>
          ))}
        </ul>
      </Leaderboard>

      

      <Modal
        isOpen={inviteModalIsOpen}
        onRequestClose={closeInviteModal}
        style={customStyles}
        contentLabel="Invite Modal"
      >
        {selectedPlayer && (
          <InviteModalContent>
            <h2>Invite {selectedPlayer.name} to Play</h2>
            <button onClick={sendInvite}>Send Invite</button>
            <button onClick={closeInviteModal}>Cancel</button>
          </InviteModalContent>
        )}
        {invitedPlayer && (
          <InviteModalContent>
            <h2>Game Invitation</h2>
            <p>{invitedPlayer} has invited you to play a game!</p>
            <div>
              <button onClick={acceptInvite}>Accept</button>
              <button onClick={declineInvite}>Decline</button>
            </div>
          </InviteModalContent>
        )}
      </Modal>
    </LobbyContainer>
  );
}

export default Lobby;