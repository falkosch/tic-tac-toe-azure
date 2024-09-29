import { Reducer } from 'react';

import { setAutoNewGame, SetAutoNewGameActionPayload } from './SetAutoNewGameAction';
import { setPlayerType, SetPlayerTypeActionPayload } from './SetPlayerTypeAction';
import { GameConfigurationType } from './GameConfiguration';

export enum GameConfigurationActionType {
  SetAutoNewGame,
  SetPlayerType,
}

export interface GameConfigurationAction {
  type: GameConfigurationActionType;
  payload: SetAutoNewGameActionPayload | SetPlayerTypeActionPayload;
}

export type GameConfigurationReducer = Reducer<GameConfigurationType, GameConfigurationAction>;

export const gameConfigurationReducer: GameConfigurationReducer = (
  prevState: GameConfigurationType,
  { type, payload },
) => {
  switch (type) {
    case GameConfigurationActionType.SetAutoNewGame:
      return setAutoNewGame(prevState, payload as SetAutoNewGameActionPayload);
    case GameConfigurationActionType.SetPlayerType:
      return setPlayerType(prevState, payload as SetPlayerTypeActionPayload);
    default:
      throw new Error('unknown game configuration reducer action type');
  }
};
