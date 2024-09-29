import { BoardDimensions } from '../meta-model/Board';
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
  (cellAt: number, coordinates: Readonly<CellCoordinates>): void;
}

export interface ForEachLineCallback {
  (lineDimension: number, iteratorToCoordinates: LineIteratorToCoordinates): void;
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
  boardDimensions: Readonly<BoardDimensions>,
  lineDimension: number,
  iteratorToCoordinates: LineIteratorToCoordinates,
  forEachCellInLineCallback: ForEachCellInLineCallback,
): void {
  for (let i = 0; i < lineDimension; i += 1) {
    const coordinates = iteratorToCoordinates(i);
    const cellAt = cellAtCoordinate(coordinates, boardDimensions);
    forEachCellInLineCallback(cellAt, coordinates);
  }
}

export function forEachLine(
  lineDimensions: Readonly<LineDimensions>,
  iteratorsToCoordinates: LineIteratorsToCoordinates,
  forEachLineCallback: ForEachLineCallback,
): void {
  for (let j = 0; j < lineDimensions.j; j += 1) {
    const lineDimension = lineDimensions.i(j);
    const iteratorToCoordinates: LineIteratorToCoordinates = (i) => iteratorsToCoordinates(j, i);
    forEachLineCallback(lineDimension, iteratorToCoordinates);
  }
}
