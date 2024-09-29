import { Board } from '../meta-model/Board';
import { CellOwner } from '../meta-model/CellOwner';
import { Consecutiveness } from '../meta-model/Game';
import { cellAtCoordinate, CellCoordinates } from './CellCoordinates';

type IteratorToCoordinates = (i: number) => CellCoordinates;
type IteratorsToCoordinates = (j: number, i: number) => CellCoordinates;

interface LineDimensions {
  j: number;
  i: number;
}

function findConsecutivenessOnLine(
  board: Readonly<Board>,
  lineDimensions: LineDimensions,
  minimumSpan: number,
  iteratorToCoordinates: IteratorToCoordinates,
): Consecutiveness[] {
  const { dimensions } = board;
  const consecutiveness: Consecutiveness[] = [];

  // first cell is our pivot cell for the first span
  let cellsAt: number[] = [cellAtCoordinate(iteratorToCoordinates(0), dimensions)];
  let ownerOfSpan: CellOwner = board.cells[cellsAt[0]];

  Array.from({ length: lineDimensions.i })
    .forEach((__, i) => {
      // skip pivot cell
      if (i === 0) return;

      const iAsCellAt = cellAtCoordinate(iteratorToCoordinates(i), dimensions);
      const ownerAtCell = board.cells[iAsCellAt];

      if (ownerOfSpan !== ownerAtCell) {
        if (cellsAt.length >= minimumSpan) {
          consecutiveness.push({ cellsAt });
        }

        cellsAt = [];
        ownerOfSpan = ownerAtCell;
      }

      cellsAt.push(iAsCellAt);
    });

  if (cellsAt.length >= minimumSpan) {
    consecutiveness.push({ cellsAt });
  }

  return consecutiveness;
}


function findConsecutivenessOnBoard(
  board: Readonly<Board>,
  lineDimensions: LineDimensions,
  minimumSpan: number,
  coordinatesFromIterators: IteratorsToCoordinates,
): Consecutiveness[] {
  let consecutiveness: Consecutiveness[] = [];

  Array.from({ length: lineDimensions.j })
    .forEach((__, j) => {
      const iteratorToCoordinates: IteratorToCoordinates = (i) => coordinatesFromIterators(j, i);

      consecutiveness = [
        ...consecutiveness,
        ...findConsecutivenessOnLine(board, lineDimensions, minimumSpan, iteratorToCoordinates),
      ];
    });

  return consecutiveness;
}

export function findConsecutiveness(board: Readonly<Board>): Consecutiveness[] {
  const minimumSpan = 3;

  return [
    ...findConsecutivenessOnBoard(
      board,
      { j: board.dimensions.height, i: board.dimensions.width },
      minimumSpan,
      (j, i) => ({ x: i, y: j }),
    ),
    ...findConsecutivenessOnBoard(
      board,
      { j: board.dimensions.width, i: board.dimensions.height },
      minimumSpan,
      (j, i) => ({ x: j, y: i }),
    ),
  ];
}
