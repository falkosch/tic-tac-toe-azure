import { CellOwner, SpecificCellOwner } from '../../meta-model/CellOwner';
import { GameView } from '../../meta-model/GameView';

export interface ActionToken {
  (affectedCellsAt: ReadonlyArray<number>, error?: Readonly<Error>): void;
  (): void;
}

export interface GameStateType {
  actionToken?: ActionToken;
  gameView?: GameView;
  winner?: CellOwner | Error;
  wins: Record<SpecificCellOwner, number>;
}

export const initialGameState: Readonly<GameStateType> = {
  wins: {
    [CellOwner.X]: 0,
    [CellOwner.O]: 0,
  },
};
