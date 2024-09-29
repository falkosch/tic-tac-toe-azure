import { Board } from '../meta-model/Board';
import { CellOwner, SpecificCellOwner } from '../meta-model/CellOwner';
import { Consecutiveness, GameView } from '../meta-model/GameView';

export type Points = Record<SpecificCellOwner, number>;

export function countPoints(
  board: Readonly<Board>,
  consecutiveness: ReadonlyArray<Consecutiveness>,
): Points {
  const pointsTracking = {
    [CellOwner.O]: 0,
    [CellOwner.X]: 0,
  };
  consecutiveness.forEach(({ cellsAt }) => {
    const cellOwner = board.cells[cellsAt[0]];
    if (cellOwner !== CellOwner.None) {
      pointsTracking[cellOwner] += cellsAt.length;
    }
  });
  return pointsTracking;
}

export function pointsLeader(points: Readonly<Points>): SpecificCellOwner | undefined {
  let winnerPoints = 0;
  let winner;

  Object.keys(points)
    .forEach((cellOwnerKey) => {
      const cellOwner = cellOwnerKey as SpecificCellOwner;
      const value = points[cellOwner];
      if (winnerPoints < value) {
        winnerPoints = value;
        winner = cellOwner;
      }
    });

  return winner;
}

export function remainingMoves(cells: ReadonlyArray<CellOwner>): number {
  return cells.reduce((acc, cellOwner) => acc + (cellOwner === CellOwner.None ? 1 : 0), 0);
}

export function isOneWinnerEnding(gameView: Readonly<GameView>): boolean {
  // for now, occurrence of a first consecutiveness sequence ends the game
  return gameView.consecutiveness.length > 0;
}

export function isDrawEnding(gameView: Readonly<GameView>): boolean {
  return !isOneWinnerEnding(gameView)
    && remainingMoves(gameView.board.cells) === 0;
}
