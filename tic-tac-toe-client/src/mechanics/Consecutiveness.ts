import { cellAtCoordinate, forEachLine, LineIteratorToCoordinates } from './CellCoordinates';
import { Board } from '../meta-model/Board';
import { CellOwner } from '../meta-model/CellOwner';
import { Consecutiveness, ConsecutivenessDirection } from '../meta-model/GameView';

interface ConsecutivenessConsumer {
  (nextConsecutiveness: Readonly<Consecutiveness>): void;
}

const findInCellOwnerSpans = (
  consecutivenessConsumer: ConsecutivenessConsumer,
  direction: Readonly<ConsecutivenessDirection>,
  board: Readonly<Board>,
  lineDimension: number,
  minimumSpan: number,
  iteratorToCoordinates: LineIteratorToCoordinates,
): void => {
  // there are consecutiveness only if line dimension is big enough
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
      // add span as consecutiveness if it exceeds the minimum span length
      if (cellsAt.length >= minimumSpan && ownerOfSpan !== CellOwner.None) {
        consecutivenessConsumer({ cellsAt, direction });
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
    consecutivenessConsumer({ cellsAt, direction });
  }
};

export const findConsecutiveness = (board: Readonly<Board>, minimumSpan = 3): Consecutiveness[] => {
  const maxDiagonalLength = Math.min(board.dimensions.height, board.dimensions.width);

  const consecutiveness: Consecutiveness[] = [];
  const consecutivenessConsumer: ConsecutivenessConsumer = (c) => consecutiveness.push(c);

  // find consecutiveness in each horizontal span
  forEachLine(
    {
      j: board.dimensions.height,
      i: () => board.dimensions.width,
    },
    (j, i) => ({ x: i, y: j }),
    (lineDimension, iteratorToCoordinates) =>
      findInCellOwnerSpans(
        consecutivenessConsumer,
        ConsecutivenessDirection.Horizontal,
        board,
        lineDimension,
        minimumSpan,
        iteratorToCoordinates,
      ),
  );

  // find consecutiveness in each vertical span
  forEachLine(
    {
      j: board.dimensions.width,
      i: () => board.dimensions.height,
    },
    (j, i) => ({ x: j, y: i }),
    (lineDimension, iteratorToCoordinates) =>
      findInCellOwnerSpans(
        consecutivenessConsumer,
        ConsecutivenessDirection.Vertical,
        board,
        lineDimension,
        minimumSpan,
        iteratorToCoordinates,
      ),
  );

  // find consecutiveness in each TL to BR diagonal span
  // - j iterates from TL to TR
  forEachLine(
    {
      j: board.dimensions.width,
      i: (j: number) => Math.min(maxDiagonalLength, board.dimensions.width - j),
    },
    (j, i) => ({ x: j + i, y: i }),
    (lineDimension, iteratorToCoordinates) =>
      findInCellOwnerSpans(
        consecutivenessConsumer,
        ConsecutivenessDirection.DiagonalTL2BR,
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
        consecutivenessConsumer,
        ConsecutivenessDirection.DiagonalTL2BR,
        board,
        lineDimension,
        minimumSpan,
        iteratorToCoordinates,
      ),
  );

  // find consecutiveness in each TR to BL diagonal span
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
        consecutivenessConsumer,
        ConsecutivenessDirection.DiagonalTR2BL,
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
        consecutivenessConsumer,
        ConsecutivenessDirection.DiagonalTR2BL,
        board,
        lineDimension,
        minimumSpan,
        iteratorToCoordinates,
      ),
  );

  return consecutiveness;
};

export const coveredConsecutivenessDirections = (
  cellAt: number,
  consecutiveness: ReadonlyArray<Consecutiveness>,
): ConsecutivenessDirection[] => {
  const directions: ConsecutivenessDirection[] = [];

  consecutiveness.forEach((c) => {
    if (c.cellsAt.includes(cellAt) && !directions.includes(c.direction)) {
      directions.push(c.direction);
    }
  });

  return directions;
};
