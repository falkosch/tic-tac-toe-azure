import { BoardDimensions } from '../meta-model/Board';
import { CellCoordinates } from './CellCoordinates';
import { Coordinates } from './Coordinates';

export enum EdgeClassifier {
  Lower = 'l',
  Inner = 'i',
  Upper = 'u',
}

export type EdgeClassifiers = Coordinates<EdgeClassifier>;

export function cellEdgeClassifier(coordinate: number, dimension: number): EdgeClassifier {
  if (coordinate <= 0) {
    return EdgeClassifier.Lower;
  }
  if (coordinate + 1 >= dimension) {
    return EdgeClassifier.Upper;
  }
  return EdgeClassifier.Inner;
}

export function cellEdgeClassifiers(
  coordinates: CellCoordinates,
  boardDimensions: BoardDimensions,
): EdgeClassifiers {
  return {
    x: cellEdgeClassifier(coordinates.x, boardDimensions.width),
    y: cellEdgeClassifier(coordinates.y, boardDimensions.height),
  };
}
