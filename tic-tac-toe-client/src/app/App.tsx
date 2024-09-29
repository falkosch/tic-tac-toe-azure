import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Form from 'react-bootstrap/Form';
import React, { useReducer, useRef, useState } from 'react';

import { createAzureFunctionPlayer } from '../computer-players/AzureFunctionPlayer';
import { createDQNPlayer } from '../computer-players/DQNPlayer';
import { createMenacePlayer } from '../computer-players/MenacePlayer';
import { createMockPlayer } from '../computer-players/MockPlayer';
import { gameConfigurationReducer, GameConfigurationActionType } from './game-configuration/GameConfigurationReducer';
import { gameStateReducer, GameStateActionType } from './game-state/GameStateReducer';
import { initialGameConfiguration, PlayerType } from './game-configuration/GameConfiguration';
import { initialGameState } from './game-state/GameState';
import { runNewGame } from '../mechanics/GameDirector';
import { AppNavbar } from './app-navbar/AppNavbar';
import { CellClickDispatch } from './cell-actions/CellClickDispatch';
import { CellOwner, SpecificCellOwner } from '../meta-model/CellOwner';
import { GameView } from './game-view/GameView';
import { Player, PlayerCreator } from '../meta-model/Player';

import './App.css';

type Players = Record<PlayerType, PlayerCreator>;

export const App: React.FC<{}> = () => {
  const [
    runningGame,
    setRunningGame,
  ] = useState<Promise<any>>(Promise.resolve());
  const [
    configuration,
    configurationDispatch,
  ] = useReducer(gameConfigurationReducer, initialGameConfiguration);
  const [
    gameState,
    gameStateDispatch,
  ] = useReducer(gameStateReducer, initialGameState);

  const game = { gameState, configuration, runningGame };
  const gameRef = useRef(game);
  gameRef.current = game;

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
      takeTurn: () => new Promise((resolve, reject) => {
        const actionToken = (affectedCellsAt?: ReadonlyArray<number>, error?: Error): void => {
          gameStateDispatch({
            type: GameStateActionType.SetActionToken,
            payload: { actionToken: undefined },
          });

          if (error) {
            reject(error);
          } else if (affectedCellsAt) {
            resolve({ affectedCellsAt });
          } else {
            resolve({ affectedCellsAt: [] });
          }
        };

        gameStateDispatch({
          type: GameStateActionType.SetActionToken,
          payload: { actionToken },
        });
      }),
    };
  }

  async function makeNewGame(): Promise<void> {
    // break a running game that awaits human player's next action
    const rememberedRunningGame = runningGame;
    const { actionToken } = gameRef.current.gameState;
    if (actionToken) {
      setRunningGame(Promise.resolve());
      actionToken();
    }
    await rememberedRunningGame;

    const { playerTypes } = gameRef.current.configuration;
    const joiningPlayers = {
      [CellOwner.X]: players[playerTypes[CellOwner.X]],
      [CellOwner.O]: players[playerTypes[CellOwner.O]],
    };

    const newRunningGame = runNewGame(
      joiningPlayers,
      async (newGameView) => gameStateDispatch({
        type: GameStateActionType.StartNewGame,
        payload: { gameView: newGameView },
      }),
      async (newGameView) => gameStateDispatch({
        type: GameStateActionType.UpdateGame,
        payload: { gameView: newGameView },
      }),
      async (endState) => gameStateDispatch({
        type: GameStateActionType.EndGame,
        payload: { endState },
      }),
    );
    setRunningGame(newRunningGame);

    await newRunningGame;
    if (gameRef.current.runningGame === newRunningGame
      && gameRef.current.configuration.autoNewGame
      && !(gameRef.current.gameState.winner instanceof Error)) {
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
    gameStateDispatch({
      type: GameStateActionType.ResetWins,
      payload: {
        player: cellOwner,
      },
    });
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
    if (gameState.actionToken === undefined) {
      return <></>;
    }

    return (
      <div className="app-game-view-human-player-status">It is your turn! Select a free cell.</div>
    );
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

    const numberOfWins = gameState.wins[gameState.winner as SpecificCellOwner];
    return (
      <div className="app-game-view-winner">
        { `Winner is ${gameState.winner} and has ${numberOfWins} wins so far.` }
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
            configuration.autoNewGame
            && gameState.gameView
            && gameState.actionToken === undefined
            && gameState.winner === undefined
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
