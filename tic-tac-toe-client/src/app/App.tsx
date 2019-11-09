import React, { useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';

import GameView from './game-view/GameView';

import './App.css';

import logo from './logo.svg';

import MockDefender from '../defender/MockDefender';
import { Game } from '../meta-model/Game';

const defender = new MockDefender();

let game: Game;
async function handshake(): Promise<Game> {
  game = await defender.handshake();
  return game;
}

const App: React.FC = () => {
  const [_game, setGame] = useState(game);

  async function newGame(): Promise<void> {
    setGame(await handshake());
  }

  return (
    <div className="app">
      <Navbar expand="lg" className="bg-light">
        <Navbar.Brand href="/">
          <img src={logo} width="30" height="30" className="App-logo" alt="logo" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Button onClick={newGame}>New game</Button>
        </Navbar.Collapse>
      </Navbar>
      <GameView game={_game} />
    </div>
  );
};

export default App;
