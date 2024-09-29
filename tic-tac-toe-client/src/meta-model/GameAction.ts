import { Board } from './Board';
import { CellOwner } from './CellOwner';

export interface AttackAction {
  affectedCellsAt: ReadonlyArray<number>;
  newOwner: Readonly<CellOwner>;
}

export interface GameAction {
  attack?: Readonly<AttackAction>;
  board: Readonly<Board>;
}
