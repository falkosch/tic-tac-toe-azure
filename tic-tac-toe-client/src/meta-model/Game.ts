import { Board } from './Board';

export interface Consecutiveness {
    cellsAt: number[];
}

export interface Game {
    board: Board;
    consecutiveness: Consecutiveness[];
}
