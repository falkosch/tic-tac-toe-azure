import {
  cellAtCoordinate,
  forEachCellInLine,
  forEachLine,
  CellCoordinates,
  LineDimensions,
  LineIteratorsToCoordinates,
} from './CellCoordinates';
import { Board, BoardDimensions } from '../meta-model/Board';
import { CellOwner } from '../meta-model/CellOwner';
import { Coordinates } from './Coordinates';

export interface BoardNormalization {
  mirroring: Coordinates<boolean>;
}

function transformOnAxis(value: number, dimension: number, mirrored: boolean): number {
  return mirrored ? (dimension - value - 1) : value;
}

export function transformCoordinates(
  coordinates: Readonly<CellCoordinates>,
  boardDimensions: Readonly<BoardDimensions>,
  { mirroring }: Readonly<BoardNormalization>,
): CellCoordinates {
  return {
    x: transformOnAxis(coordinates.x, boardDimensions.width, mirroring.x),
    y: transformOnAxis(coordinates.y, boardDimensions.height, mirroring.y),
  };
}

function countFreeCellsInRegion(
  board: Readonly<Board>,
  lineDimensions: Readonly<LineDimensions>,
  iteratorsToCoordinates: LineIteratorsToCoordinates,
): number {
  let freeCells = 0;

  forEachLine(
    lineDimensions,
    iteratorsToCoordinates,
    (lineDimension, iteratorToCoordinates) => forEachCellInLine(
      board.dimensions,
      lineDimension,
      iteratorToCoordinates,
      (cellAt) => {
        if (board.cells[cellAt] === CellOwner.None) {
          freeCells += 1;
        }
      },
    ),
  );

  return freeCells;
}

function determineFreeCellsBalanceByDirection(
  board: Readonly<Board>,
  lineDimensions: Readonly<LineDimensions>,
  iteratorsToCoordinates: LineIteratorsToCoordinates,
): number {
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
}

export function determineBoardNormalization(
  board: Readonly<Board>,
): BoardNormalization {
  const balanceHorizontal = determineFreeCellsBalanceByDirection(
    board,
    {
      j: board.dimensions.width,
      i: (__) => board.dimensions.height,
    },
    (j, i) => ({ x: j, y: i }),
  );

  const balanceVertical = determineFreeCellsBalanceByDirection(
    board,
    {
      j: board.dimensions.height,
      i: (__) => board.dimensions.width,
    },
    (j, i) => ({ x: i, y: j }),
  );

  return {
    mirroring: {
      x: balanceHorizontal > 0,
      y: balanceVertical > 0,
    },
  };
}

export function inverseNormalization(
  normalization: Readonly<BoardNormalization>,
): BoardNormalization {
  // For now the mirror transformation is inverted by mirroring the coordinates once again, so
  // the inverse normalization is identical with the given normalization.
  return normalization;
}

export function transformBoardCells(
  { cells, dimensions }: Readonly<Board>,
  normalization: Readonly<BoardNormalization>,
): CellOwner[] {
  const transformedCells = Array.from<CellOwner>({ length: cells.length });

  forEachLine(
    {
      j: dimensions.height,
      i: (__) => dimensions.width,
    },
    (j, i) => ({ x: i, y: j }),
    (lineDimension, iteratorToCoordinates) => forEachCellInLine(
      dimensions,
      lineDimension,
      iteratorToCoordinates,
      (cellAt, coordinates) => {
        const transformedCoordinates = transformCoordinates(coordinates, dimensions, normalization);
        const transformedCellAt = cellAtCoordinate(transformedCoordinates, dimensions);
        transformedCells[transformedCellAt] = cells[cellAt];
      },
    ),
  );

  return transformedCells;
}
