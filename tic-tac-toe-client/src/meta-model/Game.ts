import { Board } from './Board';

export interface Consecutiveness {
  cellsAt: ReadonlyArray<number>;
}

export interface Game {
  board: Readonly<Board>;
  consecutiveness: ReadonlyArray<Consecutiveness>;
}
