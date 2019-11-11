import { Board } from './Board';
import { CellOwner } from './CellOwner';

export interface GameAction {
    board: Board;
}

export interface AttackAction extends GameAction {
    affectedCellsAt: number[];
    newOwner: CellOwner;
}
