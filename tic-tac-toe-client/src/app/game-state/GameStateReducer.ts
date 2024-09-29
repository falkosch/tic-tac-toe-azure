import { Reducer } from 'react';
import { SetActionTokenActionPayload, setActionToken } from './SetActionTokenAction';

import { addWin, AddWinActionPayload } from './AddWinAction';
import { resetWins, ResetWinsActionPayload } from './ResetWinsAction';
import { setInProgress, SetInProgressActionPayload } from './SetInProgressAction';
import { setGameView, SetGameViewActionPayload } from './SetGameViewAction';
import { setWinner, SetWinnerActionPayload } from './SetWinnerAction';
import { GameStateType } from './GameState';

export enum GameStateActionType {
  AddWin,
  ResetWins,
  SetActionToken,
  SetInProgress,
  SetGameView,
  SetWinner,
}

export interface GameStateAction {
  type: GameStateActionType;
  payload: AddWinActionPayload
    | ResetWinsActionPayload
    | SetActionTokenActionPayload
    | SetInProgressActionPayload
    | SetGameViewActionPayload
    | SetWinnerActionPayload;
}

export type GameStateReducer = Reducer<GameStateType, GameStateAction>;

export const gameStateReducer: GameStateReducer = (
  prevState: GameStateType,
  { type, payload },
) => {
  switch (type) {
    case GameStateActionType.AddWin:
      return addWin(prevState, payload as AddWinActionPayload);
    case GameStateActionType.ResetWins:
      return resetWins(prevState, payload as ResetWinsActionPayload);
    case GameStateActionType.SetActionToken:
      return setActionToken(prevState, payload as SetActionTokenActionPayload);
    case GameStateActionType.SetInProgress:
      return setInProgress(prevState, payload as SetInProgressActionPayload);
    case GameStateActionType.SetGameView:
      return setGameView(prevState, payload as SetGameViewActionPayload);
    case GameStateActionType.SetWinner:
      return setWinner(prevState, payload as SetWinnerActionPayload);
    default:
      throw new Error('unknown game state reducer action type');
  }
};
