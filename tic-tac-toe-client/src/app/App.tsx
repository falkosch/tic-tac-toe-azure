import fpEntries from 'lodash/fp/entries';
import fpFlow from 'lodash/fp/flow';
import fpMap from 'lodash/fp/map';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Form from 'react-bootstrap/Form';
import Navbar from 'react-bootstrap/Navbar';
import React, { useState } from 'react';

import { ClientDefender } from '../defender/ClientDefender';
import { Game } from '../meta-model/Game';
import { GameView } from './game-view/GameView';
import { MockDefender } from '../defender/MockDefender';

import './App.css';
import logo from './logo.svg';

const mockDefenderName = 'Mock defender';
const defenders = {
  [mockDefenderName]: () => new MockDefender(),
  'Client-side defender': () => new ClientDefender(),
  'Azure Function defender': () => new MockDefender(),
};

export const App: React.FC = () => {
  const [defenderName, setDefenderName] = useState(mockDefenderName);
  const [game, setGame] = useState<Game>();

  const appGameView = game === undefined || game === null
    ? <div>Create a new game first.</div>
    : <GameView game={game} />;

  async function newGame(): Promise<void> {
    setGame(await defenders[defenderName]().handshake());
  }

  return (
    <div className="d-flex flex-column h-100">
      <div className="app-navbar">
        <Navbar expand="lg" bg="light" variant="light">
          <Navbar.Brand href="/">
            <img className="app-logo d-inline-block align-top" src={logo} alt="logo" />
            <span> Tic Tac Toe with Azure</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Form inline>
              <Button className="mr-2" onClick={newGame}>New game</Button>
              <DropdownButton id="defenders-dropdown" title="Defender">
                {
                  fpFlow(
                    fpEntries,
                    fpMap(
                      ([_defenderName]: [string]) => (
                        <Dropdown.Item
                          active={_defenderName === defenderName}
                          key={_defenderName}
                          onClick={() => setDefenderName(_defenderName)}
                        >
                          {_defenderName}
                        </Dropdown.Item>
                      ),
                    ),
                  )(defenders)
                }
              </DropdownButton>
            </Form>
          </Navbar.Collapse>
        </Navbar>
      </div>
      <div className="app-game-view d-flex justify-content-center align-items-center">
        {appGameView}
      </div>
    </div>
  );
};
