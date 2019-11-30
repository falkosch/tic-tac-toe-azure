import { Reducer } from 'react';

import { PlayerType, GameConfigurationType } from './GameConfiguration';
import { SpecificCellOwner } from '../../meta-model/CellOwner';

export enum GameConfigurationActionType {
  SetAutoNewGame,
  SetPlayerType,
}

export interface SetAutoNewGameActionPayload {
  value: boolean;
}

export interface SetPlayerTypeActionPayload {
  player: SpecificCellOwner;
  playerType: PlayerType;
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
    case GameConfigurationActionType.SetAutoNewGame: {
      const { value } = payload as SetAutoNewGameActionPayload;
      return {
        ...prevState,
        autoNewGame: value,
      };
    }
    case GameConfigurationActionType.SetPlayerType: {
      const { player, playerType } = payload as SetPlayerTypeActionPayload;
      return {
        ...prevState,
        playerTypes: {
          ...prevState.playerTypes,
          [player]: playerType,
        },
      };
    }
    default:
      throw new Error('unknown game configuration reducer action type');
  }
};
