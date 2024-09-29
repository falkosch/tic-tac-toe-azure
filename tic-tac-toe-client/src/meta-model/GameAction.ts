import { AnyCellOwner } from './Cell';
import { Board } from './Game';

export interface GameAction {
    board: Board;
}

export interface UpdateOwnerAction extends GameAction {
    affectedCellsAt: number[];
    newOwner: AnyCellOwner;
}
