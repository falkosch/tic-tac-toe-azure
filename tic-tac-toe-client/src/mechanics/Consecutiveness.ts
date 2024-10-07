import { cellAtCoordinate, forEachLine, LineIteratorToCoordinates } from './CellCoordinates';
import { Board } from '../meta-model/Board';
import { CellOwner } from '../meta-model/CellOwner';
import { Consecutive, ConsecutiveDirection } from '../meta-model/GameView';

interface ConsecutiveConsumer {
  (nextConsecutive: Readonly<Consecutive>): void;
}

const findInCellOwnerSpans = (
  consecutiveConsumer: ConsecutiveConsumer,
  direction: Readonly<ConsecutiveDirection>,
  board: Readonly<Board>,
  lineDimension: number,
  minimumSpan: number,
  iteratorToCoordinates: LineIteratorToCoordinates,
): void => {
  // there are consecutive spans only if line dimension is big enough
  if (lineDimension < minimumSpan) {
    return;
  }

  const { cells, dimensions } = board;

  // first cell is our pivot cell for the first span
  const pivotCellAt = cellAtCoordinate(iteratorToCoordinates(0), dimensions);

  // track spans of same CellOwners
  let cellsAt = [pivotCellAt];
  let ownerOfSpan = cells[pivotCellAt];

  for (let i = 1; i < lineDimension; i += 1) {
    const iAsCellAt = cellAtCoordinate(iteratorToCoordinates(i), dimensions);
    const ownerAtCell = cells[iAsCellAt];

    // when the CellOwner changes, a span ends
    if (ownerOfSpan !== ownerAtCell) {
      // add span as consecutive if it exceeds the minimum span length
      if (cellsAt.length >= minimumSpan && ownerOfSpan !== CellOwner.None) {
        consecutiveConsumer({ cellsAt, direction });
      }
      // start next span
      cellsAt = [iAsCellAt];
      ownerOfSpan = ownerAtCell;
      return;
    }

    cellsAt.push(iAsCellAt);
  }

  // don't forget to check the last started span
  if (cellsAt.length >= minimumSpan && ownerOfSpan !== CellOwner.None) {
    consecutiveConsumer({ cellsAt, direction });
  }
};

export const findConsecutive = (board: Readonly<Board>, minimumSpan = 3): Consecutive[] => {
  const maxDiagonalLength = Math.min(board.dimensions.height, board.dimensions.width);

  const consecutive: Consecutive[] = [];
  const consecutiveConsumer: ConsecutiveConsumer = (c) => consecutive.push(c);

  // find consecutive in each horizontal span
  forEachLine(
    {
      j: board.dimensions.height,
      i: () => board.dimensions.width,
    },
    (j, i) => ({ x: i, y: j }),
    (lineDimension, iteratorToCoordinates) =>
      findInCellOwnerSpans(
        consecutiveConsumer,
        ConsecutiveDirection.Horizontal,
        board,
        lineDimension,
        minimumSpan,
        iteratorToCoordinates,
      ),
  );

  // find consecutive in each vertical span
  forEachLine(
    {
      j: board.dimensions.width,
      i: () => board.dimensions.height,
    },
    (j, i) => ({ x: j, y: i }),
    (lineDimension, iteratorToCoordinates) =>
      findInCellOwnerSpans(
        consecutiveConsumer,
        ConsecutiveDirection.Vertical,
        board,
        lineDimension,
        minimumSpan,
        iteratorToCoordinates,
      ),
  );

  // find consecutive in each TL to BR diagonal span
  // - j iterates from TL to TR
  forEachLine(
    {
      j: board.dimensions.width,
      i: (j: number) => Math.min(maxDiagonalLength, board.dimensions.width - j),
    },
    (j, i) => ({ x: j + i, y: i }),
    (lineDimension, iteratorToCoordinates) =>
      findInCellOwnerSpans(
        consecutiveConsumer,
        ConsecutiveDirection.DiagonalTL2BR,
        board,
        lineDimension,
        minimumSpan,
        iteratorToCoordinates,
      ),
  );

  // - j iterates from TL to BL
  forEachLine(
    {
      j: board.dimensions.height - 1,
      i: (j: number) => Math.min(maxDiagonalLength, board.dimensions.height - (j + 1)),
    },
    (j, i) => ({ x: i, y: j + 1 + i }),
    (lineDimension, iteratorToCoordinates) =>
      findInCellOwnerSpans(
        consecutiveConsumer,
        ConsecutiveDirection.DiagonalTL2BR,
        board,
        lineDimension,
        minimumSpan,
        iteratorToCoordinates,
      ),
  );

  // find consecutive in each TR to BL diagonal span
  // - j iterates from TR to TL
  forEachLine(
    {
      j: board.dimensions.width,
      i: (j: number) => Math.min(maxDiagonalLength, board.dimensions.width - j),
    },
    (j, i) => ({
      x: board.dimensions.width - 1 - (j + i),
      y: i,
    }),
    (lineDimension, iteratorToCoordinates) =>
      findInCellOwnerSpans(
        consecutiveConsumer,
        ConsecutiveDirection.DiagonalTR2BL,
        board,
        lineDimension,
        minimumSpan,
        iteratorToCoordinates,
      ),
  );

  // - j iterates from TR to BR
  forEachLine(
    {
      j: board.dimensions.height - 1,
      i: (j: number) => Math.min(maxDiagonalLength, board.dimensions.height - (j + 1)),
    },
    (j, i) => ({
      x: board.dimensions.width - 1 - i,
      y: j + 1 + i,
    }),
    (lineDimension, iteratorToCoordinates) =>
      findInCellOwnerSpans(
        consecutiveConsumer,
        ConsecutiveDirection.DiagonalTR2BL,
        board,
        lineDimension,
        minimumSpan,
        iteratorToCoordinates,
      ),
  );

  return consecutive;
};

export const coveredConsecutiveDirections = (
  cellAt: number,
  consecutive: ReadonlyArray<Consecutive>,
): ConsecutiveDirection[] => {
  const directions: ConsecutiveDirection[] = [];

  consecutive.forEach((c) => {
    if (c.cellsAt.includes(cellAt) && !directions.includes(c.direction)) {
      directions.push(c.direction);
    }
  });

  return directions;
};
