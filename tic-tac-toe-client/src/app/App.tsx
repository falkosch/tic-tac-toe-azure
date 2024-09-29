import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Dropdown from 'react-bootstrap/Dropdown';
import { DropdownItemProps } from 'react-bootstrap/DropdownItem';
import Form from 'react-bootstrap/Form';
import React, {
  useReducer, useRef, useState, FC, MouseEventHandler,
} from 'react';

import { createAzureFunctionPlayer } from '../computer-players/AzureFunctionPlayer';
import { createDQNPlayer } from '../computer-players/DQNPlayer';
import { createMenacePlayer } from '../computer-players/MenacePlayer';
import { createMockPlayer } from '../computer-players/MockPlayer';
import { gameConfigurationReducer, GameConfigurationActionType } from './game-configuration/GameConfigurationReducer';
import { gameStateReducer, GameStateActionType } from './game-state/GameStateReducer';
import { initialGameConfiguration, PlayerType } from './game-configuration/GameConfiguration';
import { initialGameState } from './game-state/GameState';
import { runNewGame } from '../mechanics/GameDirector';
import { CellOwner, SpecificCellOwner } from '../meta-model/CellOwner';
import { GameStateView } from './game-state-view/GameStateView';
import { Header } from './header/Header';
import { Player, PlayerCreator } from '../meta-model/Player';

type Players = Record<PlayerType, PlayerCreator>;

export const App: FC<{}> = () => {
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

  async function createNewGame(): Promise<void> {
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
      setTimeout(createNewGame, 0);
    }
  }

  function canCreateNewGame(): boolean {
    return configuration.autoNewGame
      && gameState.gameView !== undefined
      && gameState.actionToken === undefined
      && gameState.winner === undefined;
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

  function createDropdownViewForCellOwner(cellOwner: SpecificCellOwner): JSX.Element {
    const dropdownId = `d${cellOwner}`;
    return (
      <Col key={dropdownId} xs="12" sm="4" md="auto">
        <Dropdown className="mt-2 mt-md-0">
          <Dropdown.Toggle className="w-100" id={dropdownId} variant="secondary">
            {`Player ${cellOwner}`}
          </Dropdown.Toggle>
          <Dropdown.Menu alignRight popperConfig={{ placement: 'auto' }}>
            {
              playerKeys.map(
                (playerKey) => {
                  const active = playerKey === configuration.playerTypes[cellOwner];
                  const itemId = `d${cellOwner}${playerKey}`;
                  const onClick: MouseEventHandler<DropdownItemProps> = () => {
                    changePlayerType(cellOwner, playerKey);
                  };
                  return (
                    <Dropdown.Item active={active} key={itemId} onClick={onClick}>
                      { playerKey }
                    </Dropdown.Item>
                  );
                },
              )
            }
          </Dropdown.Menu>
        </Dropdown>
      </Col>
    );
  }

  return (
    <div className="d-flex flex-column h-100">
      <Header>
        <Form>
          <Form.Row>
            <Col xs="12" sm="4" md="auto">
              <Button className="mt-2 mt-md-0" block disabled={canCreateNewGame()} onClick={createNewGame}>
                New game
              </Button>
            </Col>
            {
              Object.keys(configuration.playerTypes).map(
                (cellOwnerKey) => createDropdownViewForCellOwner(cellOwnerKey as SpecificCellOwner),
              )
            }
            <Col xs="12" md="auto">
              <div className="d-flex flex-row h-100 pt-2 pt-md-0">
                <Form.Check id="autoNewGame" inline checked={configuration.autoNewGame}>
                  <Form.Check.Input onChange={toggleAutoNewGame} />
                  <Form.Check.Label>Auto new game</Form.Check.Label>
                </Form.Check>
              </div>
            </Col>
          </Form.Row>
        </Form>
      </Header>
      <GameStateView gameState={gameState} />
    </div>
  );
};
