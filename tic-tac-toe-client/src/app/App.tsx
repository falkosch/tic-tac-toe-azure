import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Form from 'react-bootstrap/Form';
import React, {
  useContext, useReducer, useRef, useState,
} from 'react';

import { gameConfigurationReducer, GameConfigurationActionType } from './configuration/GameConfigurationReducer';
import { GameConfiguration, PlayerType } from './configuration/GameConfiguration';
import { runNewGame } from '../mechanics/GameDirector';
import { AppNavbar } from './app-navbar/AppNavbar';
import { AttackGameAction } from '../meta-model/GameAction';
import { AzureFunctionPlayer } from '../computer-players/AzureFunctionPlayer';
import { CellClickDispatch } from './cell-actions/CellClickDispatch';
import { CellOwner, SpecificCellOwner } from '../meta-model/CellOwner';
import { DQNPlayer } from '../computer-players/DQNPlayer';
import { GameView } from './game-view/GameView';
import { GameView as ModelGameView } from '../meta-model/GameView';
import { MenacePlayer } from '../computer-players/MenacePlayer';
import { MockPlayer } from '../computer-players/MockPlayer';
import { Player } from '../meta-model/Player';

import './App.css';

type Players = Record<PlayerType, Readonly<Player>>;

interface ActionToken {
  attack(affectedCellsAt: ReadonlyArray<number>): void;
}

export const App: React.FC<{}> = () => {
  const [gameView, setGameView] = useState<Readonly<ModelGameView> | null>(null);
  const [actionToken, setActionToken] = useState<Readonly<ActionToken> | null>(null);
  const initialGameConfiguration = useContext(GameConfiguration);
  const [configuration, configurationDispatch] = useReducer(
    gameConfigurationReducer,
    initialGameConfiguration,
  );
  const configurationRef = useRef(initialGameConfiguration);

  configurationRef.current = configuration;

  const players: Readonly<Players> = {
    [PlayerType.Human]: { takeTurn: () => letPlayerTakeTurn() },
    [PlayerType.Mock]: new MockPlayer(),
    [PlayerType.DQN]: new DQNPlayer(),
    [PlayerType.Menace]: new MenacePlayer(),
    [PlayerType.Azure]: new AzureFunctionPlayer(),
  };
  const playerKeys = Object.keys(players);

  async function letPlayerTakeTurn(): Promise<AttackGameAction> {
    return new Promise((resolve) => {
      const newActionToken = {
        attack(affectedCellsAt: ReadonlyArray<number>) {
          setActionToken(null);
          resolve({ affectedCellsAt });
        },
      };
      setActionToken(newActionToken);
    });
  }

  async function makeNewGame(): Promise<void> {
    const updateGameView = async (
      newGameView: Readonly<ModelGameView>,
    ): Promise<void> => setGameView(newGameView);

    await runNewGame(
      {
        [CellOwner.X]: players[configuration.playerTypes[CellOwner.X]],
        [CellOwner.O]: players[configuration.playerTypes[CellOwner.O]],
      },
      updateGameView,
      updateGameView,
      updateGameView,
    );

    if (configurationRef.current.autoNewGame) {
      setTimeout(makeNewGame, 0);
    }
  }

  function toggleAutoNewGame(): void {
    configurationDispatch({
      type: GameConfigurationActionType.SetAutoNewGame,
      payload: {
        value: !configuration.autoNewGame,
      },
    });
  }

  function changePlayerType(cellOwner: SpecificCellOwner, playerKey: string): void {
    configurationDispatch({
      type: GameConfigurationActionType.SetPlayerType,
      payload: {
        player: cellOwner,
        playerType: playerKey as PlayerType,
      },
    });
  }

  function commenceAction(cellAt: number): void {
    if (actionToken) {
      actionToken.attack([cellAt]);
    }
  }

  function selectGameView(): JSX.Element {
    if (gameView) {
      return (
        <CellClickDispatch.Provider value={commenceAction}>
          <GameView gameView={gameView} />
        </CellClickDispatch.Provider>
      );
    }

    return <div>Create a new game first.</div>;
  }

  return (
    <div className="d-flex flex-column h-100">
      <AppNavbar>
        <Button className="mr-2" onClick={makeNewGame}>New game</Button>
        {
          Object.keys(configuration.playerTypes)
            .map((cellOwnerKey) => {
              const cellOwner = cellOwnerKey as SpecificCellOwner;
              return (
                <DropdownButton
                  className="mr-2"
                  id={`player-${cellOwner}-dropdown`}
                  key={`d${cellOwner}`}
                  title={`Player ${cellOwner}`}
                >
                  {
                    playerKeys
                      .map((playerKey) => (
                        <Dropdown.Item
                          active={playerKey === configuration.playerTypes[cellOwner]}
                          key={`d${cellOwner}${playerKey}`}
                          onClick={() => changePlayerType(cellOwner, playerKey)}
                        >
                          { playerKey }
                        </Dropdown.Item>
                      ))
                  }
                </DropdownButton>
              );
            })
        }
        <Form.Check
          inline
          type="checkbox"
          label="Auto new game"
          checked={configuration.autoNewGame}
          onChange={() => toggleAutoNewGame()}
        />
      </AppNavbar>
      <div className="app-game-view d-flex justify-content-center align-items-center">
        { selectGameView() }
      </div>
    </div>
  );
};
