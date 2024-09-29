import { BoardDimensions } from '../meta-model/Board';
import { Coordinates } from './Coordinates';

export type CellCoordinates = Coordinates<number>;

export function cellCoordinates(
  cellAt: number,
  boardDimensions: BoardDimensions,
): CellCoordinates {
  const span = boardDimensions.width;
  const x = cellAt % span;
  const y = (cellAt - x) / span;
  return { x, y };
}
