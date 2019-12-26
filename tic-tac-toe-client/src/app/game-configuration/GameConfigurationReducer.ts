import { Reducer } from 'react';

import { setAutoNewGame, SetAutoNewGameActionPayload } from './SetAutoNewGameAction';
import { setPlayerType, SetPlayerTypeActionPayload } from './SetPlayerTypeAction';
import { GameConfigurationType } from './GameConfiguration';

export enum GameConfigurationActionType {
  SetAutoNewGame,
  SetPlayerType,
}

export type GameConfigurationActionPayload = SetAutoNewGameActionPayload
  | SetPlayerTypeActionPayload;

export interface GameConfigurationAction {
  type: Readonly<GameConfigurationActionType>;
  payload: Readonly<GameConfigurationActionPayload>;
}

interface ActionDelegate {
  (
    prevState: Readonly<GameConfigurationType>,
    payload: Readonly<GameConfigurationActionPayload>,
  ): GameConfigurationType;
}

const typeToAction: Readonly<Record<GameConfigurationActionType, ActionDelegate>> = {
  [GameConfigurationActionType.SetAutoNewGame]: (
    prevState, payload,
  ) => setAutoNewGame(prevState, payload as SetAutoNewGameActionPayload),

  [GameConfigurationActionType.SetPlayerType]: (
    prevState, payload,
  ) => setPlayerType(prevState, payload as SetPlayerTypeActionPayload),
};

export type GameConfigurationReducer = Reducer<GameConfigurationType, GameConfigurationAction>;

export const gameConfigurationReducer: GameConfigurationReducer = (
  prevState: Readonly<GameConfigurationType>,
  gameConfigurationAction: Readonly<GameConfigurationAction>,
) => {
  const { type, payload } = gameConfigurationAction;
  const actionDelegate = typeToAction[type];
  if (actionDelegate) {
    return actionDelegate(prevState, payload);
  }
  throw new Error('unknown game configuration reducer action type');
};
