import { CellOwner } from './Cell';

export interface Board {
    cells: CellOwner[];
    height: number;
    width: number;
}

export interface Consecutiveness {
    cellsAt: number[];
}

export interface Game {
    board: Board;
    consecutiveness: Consecutiveness[];
}
