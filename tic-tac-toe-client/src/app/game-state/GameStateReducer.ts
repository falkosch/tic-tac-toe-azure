import { Reducer } from 'react';

import { addWin, AddWinActionPayload } from './AddWinAction';
import { endGame, EndGameActionPayload } from './EndGameAction';
import { resetWins, ResetWinsActionPayload } from './ResetWinsAction';
import { setActionToken, SetActionTokenActionPayload } from './SetActionTokenAction';
import { setGameView, SetGameViewActionPayload } from './SetGameViewAction';
import { setWinner, SetWinnerActionPayload } from './SetWinnerAction';
import { startNewGame, StartNewGameActionPayload } from './StartNewGameAction';
import { updateGame, UpdateGameActionPayload } from './UpdateGameAction';
import { GameStateType } from './GameState';

export enum GameStateActionType {
  AddWin,
  EndGame,
  ResetWins,
  SetActionToken,
  SetGameView,
  SetWinner,
  StartNewGame,
  UpdateGame,
}

export type GameStateActionPayload = AddWinActionPayload
  | EndGameActionPayload
  | ResetWinsActionPayload
  | SetActionTokenActionPayload
  | SetGameViewActionPayload
  | SetWinnerActionPayload
  | StartNewGameActionPayload
  | UpdateGameActionPayload;

export interface GameStateAction {
  type: GameStateActionType;
  payload: GameStateActionPayload;
}

interface ActionDelegate {
  (prevState: Readonly<GameStateType>, payload: GameStateActionPayload): GameStateType;
}

const typeToAction: Readonly<Record<GameStateActionType, ActionDelegate>> = {
  [GameStateActionType.AddWin]: (
    prevState, payload,
  ) => addWin(prevState, payload as AddWinActionPayload),

  [GameStateActionType.EndGame]: (
    prevState, payload,
  ) => endGame(prevState, payload as EndGameActionPayload),

  [GameStateActionType.ResetWins]: (
    prevState, payload,
  ) => resetWins(prevState, payload as ResetWinsActionPayload),

  [GameStateActionType.SetActionToken]: (
    prevState, payload,
  ) => setActionToken(prevState, payload as SetActionTokenActionPayload),

  [GameStateActionType.SetGameView]: (
    prevState, payload,
  ) => setGameView(prevState, payload as SetGameViewActionPayload),

  [GameStateActionType.SetWinner]: (
    prevState, payload,
  ) => setWinner(prevState, payload as SetWinnerActionPayload),

  [GameStateActionType.StartNewGame]: (
    prevState, payload,
  ) => startNewGame(prevState, payload as StartNewGameActionPayload),

  [GameStateActionType.UpdateGame]: (
    prevState, payload,
  ) => updateGame(prevState, payload as UpdateGameActionPayload),
};

export type GameStateReducer = Reducer<GameStateType, GameStateAction>;

export const gameStateReducer: GameStateReducer = (prevState: GameStateType, { type, payload }) => {
  const actionDelegate = typeToAction[type];
  if (actionDelegate) {
    return actionDelegate(prevState, payload);
  }
  throw new Error('unknown game state reducer action type');
};
