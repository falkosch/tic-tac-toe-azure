import React from 'react';

import { CellOwner, SpecificCellOwner } from '../../meta-model/CellOwner';
import { GameView } from '../../meta-model/GameView';

export interface ActionToken {
  (affectedCellsAt: ReadonlyArray<number>, error?: Error): void;
}

export interface GameStateType {
  actionToken?: ActionToken;
  inProgress: boolean;
  gameView?: GameView;
  winner?: CellOwner | Error;
  wins: Record<SpecificCellOwner, number>;
}

export const GameState = React.createContext<GameStateType>({
  inProgress: false,
  wins: {
    [CellOwner.X]: 0,
    [CellOwner.O]: 0,
  },
});
