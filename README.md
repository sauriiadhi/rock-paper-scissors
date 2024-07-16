# Game Project

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Description

A web-based game application where two players can compete against each other by making their choices. The game uses Firebase for real-time updates and a countdown timer to add excitement.

## Features

- Real-time game updates using Firebase
- Countdown timer for each game round
- Automatic determination of game winner
- Modal display for game results
- Option to play again or end the game

## Demo

Include a screenshot or link to a live demo if available.

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/your-repository.git
2. Navigate to the project directory:
   ```sh
   cd your-repository
3. Install dependencies:
   ```sh
   npm install
## Usage

1. Start the development server:
	  ```sh
	   npm start 
2. Open your browser and navigate to `http://localhost:3000`.

## Configuration

Explain any configuration options and how to set them up.

## Firebase Setup

1.  Create a Firebase project at Firebase Console.
2.  Add a new web app and copy the Firebase configuration details.
3.  Create a `.env` file in the root directory and add your Firebase configuration:
    
    ```sh
    REACT_APP_API_KEY=your-api-key
    REACT_APP_AUTH_DOMAIN=your-auth-domain
    REACT_APP_DATABASE_URL=your-database-url
    REACT_APP_PROJECT_ID=your-project-id
    REACT_APP_STORAGE_BUCKET=your-storage-bucket
    REACT_APP_MESSAGING_SENDER_ID=your-messaging-sender-id
    REACT_APP_APP_ID=your-app-id`

## Components

### Game

-   **Description:** Manages the game logic and user interface.
-   **Props:**
    -   `player1` (string): Username of player 1.
    -   `player2` (string): Username of player 2.
-   **State:**
    -   `choice1` (string): Choice of player 1.
    -   `choice2` (string): Choice of player 2.
    -   `winner` (string): Winner of the game.
    -   `modalIsOpen` (boolean): State to control the visibility of the modal.
    -   `timer` (number): Countdown timer for the game.

## Modal

The modal displays the game result and provides options to play again or end the game.

**Styled Components:**

-   `GameContainer`: Styles the main game container.
-   `GameHeader`: Styles the game header.
-   `GameChoices`: Styles the buttons for player choices.
-   `GameResult`: Styles the text displaying player choices.
-   `GameTimer`: Styles the countdown timer.
-   `GameModal`: Styles the modal.

### Functions

-   `handleChoice`: Updates the player's choice in Firebase.
-   `determineWinner`: Determines the winner based on player choices.
-   `endGame`: Ends the game, updates the winner's score, and sets the EndGame flag.
-   `closeModal`: Closes the modal and navigates to the lobby.
-   `playAgain`: Resets the game choices and timer for a new round.
-   `useEffect` hooks:
    -   Initializes the game and sets the timer.
    -   Monitors changes in player choices to determine the winner.
    -   Handles the countdown timer logic.
