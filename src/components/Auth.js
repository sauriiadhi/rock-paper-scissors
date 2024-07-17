import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, set, get, update } from 'firebase/database';
import { rtdb } from '../firebase';
import { handleVisibilityChange } from '../visibilityHandler';
import styled from 'styled-components';

const AuthContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
  text-align: center;
`;

const WarnContainer = styled.p`
background: red;
    border-radius: 4px;
    color: white;
    padding: 7px;`;

const AuthTitle = styled.h2`
  margin-bottom: 20px;
`;

const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const AuthInput = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const AuthButton = styled.button`
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
`;

function Auth({ setUsername }) {
  const [inputUsername, setInputUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = sessionStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
      navigate('/lobby');
      handleVisibilityChange(storedUsername);
    }
  }, [setUsername, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputUsername) {
      alert("Username cannot be empty");
      return;
    }

    try {
      const userRef = ref(rtdb, `players/${inputUsername}`);
      const snapshot = await get(userRef);

      const userData = {
        username: inputUsername,
        score: snapshot.exists() ? snapshot.val().score || 0 : 0,
        active: true,
      };

      if (snapshot.exists()) {
        await update(userRef, userData);
      } else {
        await set(userRef, userData);
      }

      setUsername(inputUsername);
      sessionStorage.setItem('username', inputUsername);
      navigate('/lobby');
      handleVisibilityChange(inputUsername);
    } catch (error) {
      console.error("Error writing to Realtime Database:", error);
    }
  };

  return (
    <AuthContainer>
      <WarnContainer>Please ensure that both tabs or players are active so that others can see you online.(like split screen) If your tab is not opened, you will be considered offline.</WarnContainer>
      <AuthTitle>Enter your username to join the game</AuthTitle>
      <AuthForm onSubmit={handleSubmit}>
        <AuthInput
          type="text"
          value={inputUsername}
          onChange={(e) => setInputUsername(e.target.value)}
          placeholder="Username"
        />
        <AuthButton type="submit">Join Game</AuthButton>
        <WarnContainer>WARNING:- "Username must be a non-empty string and cannot contain any of the following characters: ".", "#", "$", "[", or "]"."</WarnContainer>
      </AuthForm>
    </AuthContainer>
  );
}

export default Auth;
