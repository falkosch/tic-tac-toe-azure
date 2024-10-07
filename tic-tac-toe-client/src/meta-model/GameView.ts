import { Board } from './Board';
import { SpecificCellOwner } from './CellOwner';

export enum ConsecutiveDirection {
  Horizontal = 'H',
  Vertical = 'V',
  DiagonalTR2BL = 'TR2BL',
  DiagonalTL2BR = 'TL2BR',
}

export interface Consecutive {
  cellsAt: ReadonlyArray<number>;
  direction: Readonly<ConsecutiveDirection>;
}

export type Points = Record<SpecificCellOwner, number>;

export interface GameView {
  board: Readonly<Board>;
  consecutive: ReadonlyArray<Consecutive>;
  points: Readonly<Points>;
}
