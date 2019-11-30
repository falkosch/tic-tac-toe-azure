import { Board } from '../meta-model/Board';
import { CellOwner, SpecificCellOwner } from '../meta-model/CellOwner';
import { Consecutiveness, GameView } from '../meta-model/GameView';

export type Points = Record<SpecificCellOwner, number>;

export function countPoints(
  board: Readonly<Board>,
  consecutiveness: ReadonlyArray<Consecutiveness>,
): Points {
  return consecutiveness.reduce(
    (pointsTrackingAcc, { cellsAt }) => {
      const cellOwner = board.cells[cellsAt[0]];
      if (cellOwner === CellOwner.None) {
        return pointsTrackingAcc;
      }

      return {
        ...pointsTrackingAcc,
        [cellOwner]: pointsTrackingAcc[cellOwner] + cellsAt.length,
      };
    },
    {
      [CellOwner.O]: 0,
      [CellOwner.X]: 0,
    },
  );
}

export function pointsLeader(points: Readonly<Points>): SpecificCellOwner | undefined {
  return Object.entries(points)
    .reduce(
      (winnerTrackingAcc, [cellOwner, value]) => {
        if (winnerTrackingAcc.points < value) {
          return {
            winner: cellOwner as SpecificCellOwner,
            points: value,
          };
        }
        return winnerTrackingAcc;
      },
      {
        points: Number.NEGATIVE_INFINITY,
      } as {
        winner?: SpecificCellOwner;
        points: number;
      },
    )
    .winner;
}

export function remainingMoves(cells: ReadonlyArray<CellOwner>): number {
  return cells.reduce((acc, cellOwner) => acc + (cellOwner === CellOwner.None ? 1 : 0), 0);
}

export function isEnding(gameView: Readonly<GameView>): boolean {
  if (remainingMoves(gameView.board.cells) === 0) {
    return true;
  }

  // for now, occurrence of a first consecutiveness sequence ends the game
  return gameView.consecutiveness.length > 0;
}
