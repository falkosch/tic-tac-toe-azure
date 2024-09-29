import React from 'react';

import { CellOwner, SpecificCellOwner } from '../../meta-model/CellOwner';

export enum PlayerType {
  Human = 'Human player',
  Mock = 'Mock computer player (local)',
  DQN = 'DQN AI computer player (local)',
  Menace = 'Menace AI computer player (local)',
  Azure = 'Azure function as computer player (remote)',
}

export type PlayerConfiguration = Record<SpecificCellOwner, Readonly<PlayerType>>;

export interface GameConfigurationType {
  autoNewGame: boolean;
  playerTypes: Readonly<PlayerConfiguration>;
}

export const GameConfiguration = React.createContext<GameConfigurationType>({
  autoNewGame: false,
  playerTypes: {
    [CellOwner.X]: PlayerType.Human,
    [CellOwner.O]: PlayerType.Azure,
  },
});
