import { Board } from './Board';
import { CellOwner } from './CellOwner';

export interface AttackAction {
    affectedCellsAt: number[];
    newOwner: CellOwner;
}

export interface GameAction {
  board: Board;
  attack?: AttackAction;
}
