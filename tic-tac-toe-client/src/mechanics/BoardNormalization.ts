import {
  cellAtCoordinate,
  CellCoordinates,
  forEachCellInLine,
  forEachLine,
  LineDimensions,
  LineIteratorsToCoordinates,
} from './CellCoordinates';
import { Board, BoardDimensions } from '../meta-model/Board';
import { CellOwner } from '../meta-model/CellOwner';
import { Coordinates } from './Coordinates';

export interface BoardNormalization {
  mirroring: Coordinates<boolean>;
}

const transformOnAxis = (value: number, dimension: number, mirrored: boolean): number => {
  return mirrored ? dimension - value - 1 : value;
};

export const transformCoordinates = (
  coordinates: Readonly<CellCoordinates>,
  boardDimensions: Readonly<BoardDimensions>,
  normalization: Readonly<BoardNormalization>,
): CellCoordinates => {
  const { mirroring } = normalization;
  return {
    x: transformOnAxis(coordinates.x, boardDimensions.width, mirroring.x),
    y: transformOnAxis(coordinates.y, boardDimensions.height, mirroring.y),
  };
};

const countFreeCellsInRegion = (
  board: Readonly<Board>,
  lineDimensions: Readonly<LineDimensions>,
  iteratorsToCoordinates: LineIteratorsToCoordinates,
): number => {
  let freeCells = 0;

  forEachLine(lineDimensions, iteratorsToCoordinates, (lineDimension, iteratorToCoordinates) =>
    forEachCellInLine(board.dimensions, lineDimension, iteratorToCoordinates, (cellAt) => {
      if (board.cells[cellAt] === CellOwner.None) {
        freeCells += 1;
      }
    }),
  );

  return freeCells;
};

const determineFreeCellsBalanceByDirection = (
  board: Readonly<Board>,
  lineDimensions: Readonly<LineDimensions>,
  iteratorsToCoordinates: LineIteratorsToCoordinates,
): number => {
  // As a distinct middle line on a board is not part of either of the two adjacent sides, it is
  // skipped when determining the balance, i.e. a 3x3 board has a distinct middle line while a
  // 2x2 board has not.
  const halfLengths = Math.floor(lineDimensions.j / 2);
  const distinctMiddleOffset = lineDimensions.j - halfLengths;

  const first = countFreeCellsInRegion(
    board,
    {
      j: halfLengths,
      i: (atJ) => lineDimensions.i(atJ),
    },
    (j, i) => iteratorsToCoordinates(j, i),
  );

  const second = countFreeCellsInRegion(
    board,
    {
      j: halfLengths,
      i: (atJ) => lineDimensions.i(atJ + distinctMiddleOffset),
    },
    (j, i) => iteratorsToCoordinates(j + distinctMiddleOffset, i),
  );

  return first - second;
};

export const determineBoardNormalization = (board: Readonly<Board>): BoardNormalization => {
  const balanceHorizontal = determineFreeCellsBalanceByDirection(
    board,
    {
      j: board.dimensions.width,
      i: () => board.dimensions.height,
    },
    (j, i) => ({ x: j, y: i }),
  );

  const balanceVertical = determineFreeCellsBalanceByDirection(
    board,
    {
      j: board.dimensions.height,
      i: () => board.dimensions.width,
    },
    (j, i) => ({ x: i, y: j }),
  );

  return {
    mirroring: {
      x: balanceHorizontal > 0,
      y: balanceVertical > 0,
    },
  };
};

export const inverseNormalization = (
  normalization: Readonly<BoardNormalization>,
): BoardNormalization => {
  // For now the mirror transformation is inverted by mirroring the coordinates once again, so
  // the inverse normalization is identical with the given normalization.
  return normalization;
};

export const transformBoardCells = (
  board: Readonly<Board>,
  normalization: Readonly<BoardNormalization>,
): CellOwner[] => {
  const { cells, dimensions } = board;
  const transformedCells = Array.from<CellOwner>({ length: cells.length });

  forEachLine(
    {
      j: dimensions.height,
      i: () => dimensions.width,
    },
    (j, i) => ({ x: i, y: j }),
    (lineDimension, iteratorToCoordinates) =>
      forEachCellInLine(dimensions, lineDimension, iteratorToCoordinates, (cellAt, coordinates) => {
        const transformedCoordinates = transformCoordinates(coordinates, dimensions, normalization);
        const transformedCellAt = cellAtCoordinate(transformedCoordinates, dimensions);
        transformedCells[transformedCellAt] = cells[cellAt];
      }),
  );

  return transformedCells;
};
