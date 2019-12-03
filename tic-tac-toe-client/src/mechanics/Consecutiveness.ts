import { cellAtCoordinate, CellCoordinates } from './CellCoordinates';
import { Board } from '../meta-model/Board';
import { CellOwner } from '../meta-model/CellOwner';
import { Consecutiveness } from '../meta-model/GameView';

interface IteratorToCoordinates {
  (i: number): CellCoordinates;
}

interface IteratorsToCoordinates {
  (j: number, i: number): CellCoordinates;
}

interface LineDimensions {
  j: number;
  i: (atJ: number) => number;
}

interface ConsecutivenessConsumer {
  (nextConsecutiveness: Consecutiveness): void;
}

function findInCellOwnerSpans(
  consecutivenessConsumer: ConsecutivenessConsumer,
  board: Readonly<Board>,
  lineDimension: number,
  minimumSpan: number,
  iteratorToCoordinates: IteratorToCoordinates,
): void {
  // there are consecutiveness only if line dimension is big enough
  if (lineDimension < minimumSpan) {
    return;
  }

  // first cell is our pivot cell for the first span
  const pivotCellAt = cellAtCoordinate(iteratorToCoordinates(0), board.dimensions);

  // track spans of same CellOwners
  let cellsAt = [pivotCellAt];
  let ownerOfSpan = board.cells[pivotCellAt];

  Array.from({ length: lineDimension - 1 })
    .forEach((__, i) => {
      const index = i + 1;
      const iAsCellAt = cellAtCoordinate(iteratorToCoordinates(index), board.dimensions);
      const ownerAtCell = board.cells[iAsCellAt];

      // when the CellOwner changes, a span ends
      if (ownerOfSpan !== ownerAtCell) {
        // add span as consecutiveness if it exceeds the minimum span length
        if (cellsAt.length >= minimumSpan && ownerOfSpan !== CellOwner.None) {
          consecutivenessConsumer({ cellsAt });
        }
        // start next span
        cellsAt = [iAsCellAt];
        ownerOfSpan = ownerAtCell;
        return;
      }

      cellsAt.push(iAsCellAt);
    });

  // don't forget to check the last started span
  if (cellsAt.length >= minimumSpan && ownerOfSpan !== CellOwner.None) {
    consecutivenessConsumer({ cellsAt });
  }
}

function findForEachLine(
  consecutivenessConsumer: ConsecutivenessConsumer,
  board: Readonly<Board>,
  lineDimensions: Readonly<LineDimensions>,
  minimumSpan: number,
  coordinatesFromIterators: IteratorsToCoordinates,
): void {
  Array.from({ length: lineDimensions.j })
    .forEach((__, j: number) => {
      const dimensionJForI = lineDimensions.i(j);
      const iteratorToCoordinates: IteratorToCoordinates = (i) => coordinatesFromIterators(j, i);
      findInCellOwnerSpans(
        consecutivenessConsumer,
        board,
        dimensionJForI,
        minimumSpan,
        iteratorToCoordinates,
      );
    });
}

export function findConsecutiveness(board: Readonly<Board>, minimumSpan = 3): Consecutiveness[] {
  const maxDiagonalLength = Math.min(board.dimensions.height, board.dimensions.width);

  const consecutiveness: Consecutiveness[] = [];
  const consecutivenessConsumer: ConsecutivenessConsumer = (c) => consecutiveness.push(c);

  // find consecutiveness in each horizontal span
  findForEachLine(
    consecutivenessConsumer,
    board,
    {
      j: board.dimensions.height,
      i: () => board.dimensions.width,
    },
    minimumSpan,
    (j, i) => ({
      x: i,
      y: j,
    }),
  );

  // find consecutiveness in each vertical span
  findForEachLine(
    consecutivenessConsumer,
    board,
    {
      j: board.dimensions.width,
      i: () => board.dimensions.height,
    },
    minimumSpan,
    (j, i) => ({
      x: j,
      y: i,
    }),
  );

  // find consecutiveness in each TL to BR diagonal span
  // - j iterates from TL to TR
  findForEachLine(
    consecutivenessConsumer,
    board,
    {
      j: board.dimensions.width,
      i: (j: number) => Math.min(maxDiagonalLength, board.dimensions.width - j),
    },
    minimumSpan,
    (j, i) => ({
      x: j + i,
      y: i,
    }),
  );

  // - j iterates from TL to BL
  findForEachLine(
    consecutivenessConsumer,
    board,
    {
      j: board.dimensions.height - 1,
      i: (j: number) => Math.min(maxDiagonalLength, board.dimensions.height - (j + 1)),
    },
    minimumSpan,
    (j, i) => ({
      x: i,
      y: (j + 1) + i,
    }),
  );

  // find consecutiveness in each TR to BL diagonal span
  // - j iterates from TR to TL
  findForEachLine(
    consecutivenessConsumer,
    board,
    {
      j: board.dimensions.width,
      i: (j: number) => Math.min(maxDiagonalLength, board.dimensions.width - j),
    },
    minimumSpan,
    (j, i) => ({
      x: (board.dimensions.width - 1) - (j + i),
      y: i,
    }),
  );

  // - j iterates from TR to BR
  findForEachLine(
    consecutivenessConsumer,
    board,
    {
      j: board.dimensions.height - 1,
      i: (j: number) => Math.min(maxDiagonalLength, board.dimensions.height - (j + 1)),
    },
    minimumSpan,
    (j, i) => ({
      x: (board.dimensions.width - 1) - i,
      y: (j + 1) + i,
    }),
  );

  return consecutiveness;
}
