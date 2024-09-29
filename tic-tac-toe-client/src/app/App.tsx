import React, { useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';

import { GameView } from './game-view/GameView';
import { MockDefender } from '../defender/MockDefender';
import { Game } from '../meta-model/Game';

import './App.css';
import logo from './logo.svg';

export const App: React.FC = () => {
  const [defender] = useState(new MockDefender());
  const [game, setGame] = useState<Game>();

  const appGameView = game === undefined || game === null
    ? <div>Create a new game first.</div>
    : <GameView game={game} />;

  async function newGame(): Promise<void> {
    setGame(await defender.handshake());
  }

  return (
    <div className="d-flex flex-column h-100">
      <div className="app-navbar">
        <Navbar expand="lg" bg="light" variant="light">
          <Navbar.Brand href="/">
            <img className="app-logo d-inline-block align-top" src={logo} alt="logo" />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Button onClick={newGame}>New game</Button>
          </Navbar.Collapse>
        </Navbar>
      </div>
      <div className="app-game-view d-flex justify-content-center align-items-center">
        {appGameView}
      </div>
    </div>
  );
};
