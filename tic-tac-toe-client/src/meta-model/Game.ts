import { Board } from './Board';
import { SpecificCellOwner } from './CellOwner';

export interface Consecutiveness {
  cellsAt: ReadonlyArray<number>;
}

export type Points = Record<SpecificCellOwner, number>;

export interface Game {
  board: Readonly<Board>;
  consecutiveness: ReadonlyArray<Consecutiveness>;
  points: Points;
  winner?: SpecificCellOwner;
}
