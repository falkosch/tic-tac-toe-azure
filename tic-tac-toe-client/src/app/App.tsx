import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Form from 'react-bootstrap/Form';
import Navbar from 'react-bootstrap/Navbar';
import React, { useState } from 'react';

import { evaluateReaction } from '../mechanics/Reactions';
import { prepareAttack } from '../mechanics/Actions';
import { AzureFunctionDefender } from '../defender/AzureFunctionDefender';
import { CellOwner } from '../meta-model/CellOwner';
import { Defender } from '../meta-model/Defender';
import { DQNDefender } from '../defender/client-local/DQNDefender';
import { Game } from '../meta-model/Game';
import { GameView } from './game-view/GameView';
import { MockDefender } from '../defender/MockDefender';

import './App.css';
import logo from './logo.svg';

const defenders: Readonly<Record<string, () => Defender>> = {
  [MockDefender.ReadableName]: () => new MockDefender(),
  [DQNDefender.ReadableName]: () => new DQNDefender(),
  [AzureFunctionDefender.ReadableName]: () => new AzureFunctionDefender(),
};

export const App: React.FC = () => {
  const [defenderName, setDefenderName] = useState<string>(MockDefender.ReadableName);
  const [defender, setDefender] = useState<Defender>(defenders[MockDefender.ReadableName]);
  const [game, setGame] = useState<Game>();

  async function newGame(): Promise<void> {
    setGame(await defender.handshake());
  }

  async function changeDefender(newDefenderName: string): Promise<void> {
    setDefenderName(newDefenderName);
    const newDefender = defenders[newDefenderName]();
    setDefender(newDefender);
    setGame(await newDefender.handshake());
  }

  async function commenceAction(cellAt: number): Promise<void> {
    if (!game) return;
    const action = prepareAttack(game.board, cellAt, CellOwner.X);
    const reaction = await defender.defend(action);
    const alteredGame = evaluateReaction(game, action, reaction);
    setGame(alteredGame);
  }

  function selectGameView(): JSX.Element {
    if (game === undefined || game === null) {
      return <div>Create a new game first.</div>;
    }

    return (
      <GameView
        game={game}
        onCellClick={(__event, cellAt) => commenceAction(cellAt)}
      />
    );
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
                  Object.entries(defenders)
                    .map(([_defenderName]) => (
                      <Dropdown.Item
                        active={_defenderName === defenderName}
                        key={_defenderName}
                        onClick={() => changeDefender(_defenderName)}
                      >
                        {_defenderName}
                      </Dropdown.Item>
                    ))
                }
              </DropdownButton>
            </Form>
          </Navbar.Collapse>
        </Navbar>
      </div>
      <div className="app-game-view d-flex justify-content-center align-items-center">
        { selectGameView() }
      </div>
    </div>
  );
};
