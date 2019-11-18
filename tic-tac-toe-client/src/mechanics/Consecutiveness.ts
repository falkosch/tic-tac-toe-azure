import { Board } from '../meta-model/Board';
import { CellOwner } from '../meta-model/CellOwner';
import { Consecutiveness } from '../meta-model/Game';
import { cellAtCoordinate, CellCoordinates } from './CellCoordinates';

type IteratorToCoordinates = (i: number) => CellCoordinates;
type IteratorsToCoordinates = (j: number, i: number) => CellCoordinates;

interface LineDimensions {
  j: number;
  i: (atJ: number) => number;
}

interface LineSpanTracking {
  cellsAt: ReadonlyArray<number>;
  consecutiveness: ReadonlyArray<Consecutiveness>;
  ownerOfSpan: Readonly<CellOwner>;
}

function addConsecutiveness(
  consecutiveness: ReadonlyArray<Consecutiveness>,
  cellsAt: ReadonlyArray<number>,
  minimumSpan: number,
  ownerOfSpan: Readonly<CellOwner>,
): Consecutiveness[] {
  if (cellsAt.length >= minimumSpan && ownerOfSpan !== CellOwner.None) {
    return [...consecutiveness, { cellsAt }];
  }
  return consecutiveness as Consecutiveness[];
}

function trackCellOwnerSpanChanges(
  { cells, dimensions }: Readonly<Board>,
  minimumSpan: number,
  iteratorToCoordinates: IteratorToCoordinates,
  { cellsAt, consecutiveness, ownerOfSpan }: LineSpanTracking,
  index: number,
): LineSpanTracking {
  const iAsCellAt = cellAtCoordinate(iteratorToCoordinates(index), dimensions);
  const ownerAtCell = cells[iAsCellAt];

  if (ownerOfSpan !== ownerAtCell) {
    return {
      cellsAt: [iAsCellAt],
      consecutiveness: addConsecutiveness(consecutiveness, cellsAt, minimumSpan, ownerOfSpan),
      ownerOfSpan: ownerAtCell,
    };
  }

  return {
    cellsAt: [...cellsAt, iAsCellAt],
    consecutiveness,
    ownerOfSpan,
  };
}

function findConsecutivenessInCellOwnerSpans(
  board: Readonly<Board>,
  lineDimension: number,
  minimumSpan: number,
  iteratorToCoordinates: IteratorToCoordinates,
): Consecutiveness[] {
  if (lineDimension < minimumSpan) {
    return [];
  }

  // first cell is our pivot cell for the first span
  const pivotCellAt = cellAtCoordinate(iteratorToCoordinates(0), board.dimensions);
  const initialSpan: LineSpanTracking = {
    cellsAt: [pivotCellAt],
    consecutiveness: [],
    ownerOfSpan: board.cells[pivotCellAt],
  };
  const lastSpan = Array.from({ length: lineDimension - 1 })
    .reduce(
      (tracking: LineSpanTracking, __, i) => trackCellOwnerSpanChanges(
        board,
        minimumSpan,
        iteratorToCoordinates,
        tracking,
        i + 1,
      ),
      initialSpan,
    );

  return addConsecutiveness(
    lastSpan.consecutiveness,
    lastSpan.cellsAt,
    minimumSpan,
    lastSpan.ownerOfSpan,
  );
}

function findConsecutivenessForEachLine(
  board: Readonly<Board>,
  lineDimensions: LineDimensions,
  minimumSpan: number,
  coordinatesFromIterators: IteratorsToCoordinates,
): Consecutiveness[] {
  return Array.from({ length: lineDimensions.j })
    .reduce(
      (consecutiveness: Consecutiveness[], __, j: number) => [
        ...consecutiveness,
        ...findConsecutivenessInCellOwnerSpans(
          board,
          lineDimensions.i(j),
          minimumSpan,
          (i) => coordinatesFromIterators(j, i),
        ),
      ],
      [],
    );
}

export function findConsecutiveness(board: Readonly<Board>, minimumSpan = 3): Consecutiveness[] {
  const maxDiagonalLength = Math.min(board.dimensions.height, board.dimensions.width);
  return [
    // find consecutiveness in each horizontal span
    ...findConsecutivenessForEachLine(
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
    ),
    // find consecutiveness in each vertical span
    ...findConsecutivenessForEachLine(
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
    ),
    // find consecutiveness in each TL to BR diagonal span
    // - j iterates from TL to TR
    ...findConsecutivenessForEachLine(
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
    ),
    // - j iterates from TL to BL
    ...findConsecutivenessForEachLine(
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
    ),
    // find consecutiveness in each TR to BL diagonal span
    // - j iterates from TR to TL
    ...findConsecutivenessForEachLine(
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
    ),
    // - j iterates from TR to BR
    ...findConsecutivenessForEachLine(
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
    ),
  ];
}
