import { Board, BoardDimensions } from '../meta-model/Board';

import { Coordinates } from './Coordinates';

export type CellCoordinates = Coordinates<number>;

export interface LineDimensions {
  j: number;
  i: (atJ: number) => number;
}

export interface LineIteratorToCoordinates {
  (i: number): CellCoordinates;
}

export interface LineIteratorsToCoordinates {
  (j: number, i: number): CellCoordinates;
}

export interface ForEachCellInLineCallback {
  (cellAt: number, coordinates: CellCoordinates): void;
}

export function cellCoordinates(
  cellAt: number,
  boardDimensions: Readonly<BoardDimensions>,
): CellCoordinates {
  const span = boardDimensions.width;
  const x = Math.floor(cellAt % span);
  const y = Math.floor((cellAt - x) / span);
  return { x, y };
}

export function cellAtCoordinate(
  coordinates: Readonly<CellCoordinates>,
  boardDimensions: Readonly<BoardDimensions>,
): number {
  return Math.floor(coordinates.y * boardDimensions.width + coordinates.x);
}

export function forEachCellInLine(
  board: Readonly<Board>,
  lineDimension: number,
  iteratorToCoordinates: LineIteratorToCoordinates,
  callback: ForEachCellInLineCallback,
): void {
  for (let i = 0; i < lineDimension; i += 1) {
    const coordinates = iteratorToCoordinates(i);
    callback(
      cellAtCoordinate(coordinates, board.dimensions),
      coordinates,
    );
  }
}

export function forEachLine(
  board: Readonly<Board>,
  lineDimensions: Readonly<LineDimensions>,
  iteratorsToCoordinates: LineIteratorsToCoordinates,
  callback: ForEachCellInLineCallback,
): void {
  for (let j = 0; j < lineDimensions.j; j += 1) {
    forEachCellInLine(
      board,
      lineDimensions.i(j),
      (i) => iteratorsToCoordinates(j, i),
      callback,
    );
  }
}
