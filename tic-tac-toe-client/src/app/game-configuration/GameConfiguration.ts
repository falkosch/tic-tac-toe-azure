import { CellOwner, SpecificCellOwner } from '../../meta-model/CellOwner';

export enum PlayerType {
  Human = 'Human player',
  Mock = 'Random AI (local)',
  DQN = 'DQN AI (local)',
  Menace = 'Menace AI (local)',
  Azure = 'Azure function (remote)',
}

export type PlayerConfiguration = Record<SpecificCellOwner, Readonly<PlayerType>>;

export interface GameConfigurationType {
  autoNewGame: boolean;
  playerTypes: Readonly<PlayerConfiguration>;
}

export const initialGameConfiguration: Readonly<GameConfigurationType> = {
  autoNewGame: false,
  playerTypes: {
    [CellOwner.X]: PlayerType.Human,
    [CellOwner.O]: PlayerType.DQN,
  },
};
