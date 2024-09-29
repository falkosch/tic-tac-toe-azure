import { Board } from './Board';
import { SpecificCellOwner } from './CellOwner';

export enum ConsecutivenessDirection {
  Horizontal = 'H',
  Vertical = 'V',
  DiagonalTR2BL = 'TR2BL',
  DiagonalTL2BR = 'TL2BR',
}

export interface Consecutiveness {
  cellsAt: ReadonlyArray<number>;
  direction: ConsecutivenessDirection;
}

export type Points = Record<SpecificCellOwner, number>;

export interface GameView {
  board: Readonly<Board>;
  consecutiveness: ReadonlyArray<Consecutiveness>;
  points: Readonly<Points>;
}
