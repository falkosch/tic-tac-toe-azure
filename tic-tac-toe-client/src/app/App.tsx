import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Form from 'react-bootstrap/Form';
import React, {
  useContext, useReducer, useRef,
} from 'react';

import { createAzureFunctionPlayer } from '../computer-players/AzureFunctionPlayer';
import { createDQNPlayer } from '../computer-players/DQNPlayer';
import { createMenacePlayer } from '../computer-players/MenacePlayer';
import { createMockPlayer } from '../computer-players/MockPlayer';
import { gameConfigurationReducer, GameConfigurationActionType } from './game-configuration/GameConfigurationReducer';
import { gameStateReducer, GameStateActionType } from './game-state/GameStateReducer';
import { runNewGame } from '../mechanics/GameDirector';
import { ActionToken, GameState } from './game-state/GameState';
import { AppNavbar } from './app-navbar/AppNavbar';
import { AttackGameAction } from '../meta-model/GameAction';
import { CellClickDispatch } from './cell-actions/CellClickDispatch';
import { CellOwner, SpecificCellOwner } from '../meta-model/CellOwner';
import { GameConfiguration, PlayerType } from './game-configuration/GameConfiguration';
import { GameView } from './game-view/GameView';
import { Player, PlayerCreator } from '../meta-model/Player';

import './App.css';

type Players = Record<PlayerType, PlayerCreator>;

export const App: React.FC<{}> = () => {
  const initialGameConfiguration = useContext(GameConfiguration);
  const [configuration, configurationDispatch] = useReducer(
    gameConfigurationReducer,
    initialGameConfiguration,
  );

  const initialGameState = useContext(GameState);
  const [gameState, gameStateDispatch] = useReducer(
    gameStateReducer,
    initialGameState,
  );

  const gameRef = useRef({ gameState, configuration });
  gameRef.current = { gameState, configuration };

  const players: Readonly<Players> = {
    [PlayerType.Human]: createHumanPlayer,
    [PlayerType.Mock]: createMockPlayer,
    [PlayerType.DQN]: createDQNPlayer,
    [PlayerType.Menace]: createMenacePlayer,
    [PlayerType.Azure]: createAzureFunctionPlayer,
  };
  const playerKeys = Object.keys(players);

  async function createHumanPlayer(): Promise<Player> {
    return {
      takeTurn: () => letPlayerTakeTurn(),
    };
  }

  function letPlayerTakeTurn(): Promise<AttackGameAction> {
    return new Promise((resolve, reject) => {
      const actionToken: ActionToken = (affectedCellsAt, error) => {
        gameStateDispatch({
          type: GameStateActionType.SetActionToken,
          payload: { },
        });

        if (error) {
          reject(error);
        } else {
          resolve({ affectedCellsAt });
        }
      };

      gameStateDispatch({
        type: GameStateActionType.SetActionToken,
        payload: { actionToken },
      });
    });
  }

  function makeNewGame(): void {
    const { playerTypes } = gameRef.current.configuration;
    const joiningPlayers = {
      [CellOwner.X]: players[playerTypes[CellOwner.X]],
      [CellOwner.O]: players[playerTypes[CellOwner.O]],
    };

    runNewGame(
      joiningPlayers,
      async (newGameView) => {
        gameStateDispatch({
          type: GameStateActionType.StartNewGame,
          payload: { gameView: newGameView },
        });
      },
      async (newGameView) => {
        gameStateDispatch({
          type: GameStateActionType.UpdateGame,
          payload: { gameView: newGameView },
        });
      },
      async (newGameView, endState) => {
        gameStateDispatch({
          type: GameStateActionType.EndGame,
          payload: { gameView: newGameView, endState },
        });

        if (gameRef.current.configuration.autoNewGame && !(endState.winner instanceof Error)) {
          setTimeout(makeNewGame, 0);
        }
      },
    );
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
    gameStateDispatch({ type: GameStateActionType.ResetWins, payload: { player: cellOwner } });
    configurationDispatch({
      type: GameConfigurationActionType.SetPlayerType,
      payload: {
        player: cellOwner,
        playerType: playerKey as PlayerType,
      },
    });
  }

  function commenceAction(cellAt: number): void {
    if (gameState.actionToken) {
      gameState.actionToken([cellAt]);
    }
  }

  function selectHumanPlayerStatusView(): JSX.Element {
    if (gameState.actionToken) {
      return (
        <div className="app-game-view-human-player-status">It is your turn! Select a free cell.</div>
      );
    }

    return <></>;
  }

  function selectGameView(): JSX.Element {
    if (gameState.gameView) {
      return (
        <CellClickDispatch.Provider value={commenceAction}>
          <GameView gameView={gameState.gameView} />
        </CellClickDispatch.Provider>
      );
    }

    return <div className="app-game-view-create-new-game">Create a new game first.</div>;
  }

  function selectWinnerView(): JSX.Element {
    if (!gameState.winner) {
      return <></>;
    }

    if ((gameState.winner as any).isAxiosError) {
      return (
        <div className="app-game-view-error">
          Azure player is not available, because the backend is not reachable. Please try another
          player type.
        </div>
      );
    }

    if (gameState.winner instanceof Error) {
      return <div className="app-game-view-error">{ `Something unexpected happened: ${gameState.winner}.` }</div>;
    }

    if (gameState.winner === CellOwner.None) {
      return <div className="app-game-view-winner">It&apos;s a draw!</div>;
    }

    return (
      <div className="app-game-view-winner">
        { `Winner is ${gameState.winner} and has ${gameState.wins[gameState.winner]} wins so far.` }
      </div>
    );
  }

  return (
    <div className="d-flex flex-column h-100">
      <AppNavbar>
        <Button
          className="mr-2"
          onClick={makeNewGame}
          disabled={
            gameState.inProgress
            && configuration.autoNewGame
          }
        >
          New game
        </Button>
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
      <div className="app-game-view d-flex flex-column justify-content-center align-items-center">
        { selectGameView() }
        { selectHumanPlayerStatusView() }
        { selectWinnerView() }
      </div>
    </div>
  );
};
