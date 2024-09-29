import { AnyCellOwner } from './Cell';

export interface Board {
    cells: AnyCellOwner[];
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
