import { CellOwner } from './CellOwner';

export interface BoardDimensions {
  height: number;
  width: number;
}

export interface Board {
  cells: ReadonlyArray<CellOwner>;
  dimensions: Readonly<BoardDimensions>;
}
