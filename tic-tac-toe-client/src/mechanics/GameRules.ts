import { Board } from '../meta-model/Board';
import { CellOwner, SpecificCellOwner } from '../meta-model/CellOwner';
import { Consecutive, GameView } from '../meta-model/GameView';

type Points = Record<SpecificCellOwner, number>;

export const countPoints = (
  board: Readonly<Board>,
  consecutive: ReadonlyArray<Consecutive>,
): Points => {
  const pointsTracking = {
    [CellOwner.O]: 0,
    [CellOwner.X]: 0,
  };
  consecutive.forEach(({ cellsAt }) => {
    const cellOwner = board.cells[cellsAt[0]];
    if (cellOwner !== CellOwner.None) {
      pointsTracking[cellOwner] += cellsAt.length;
    }
  });
  return pointsTracking;
};

export const pointsLeader = (points: Readonly<Points>): SpecificCellOwner | undefined => {
  let winnerPoints = 0;
  let winner;
  Object.entries(points).forEach(([cellOwnerKey, value]) => {
    if (winnerPoints < value) {
      winnerPoints = value;
      winner = cellOwnerKey as SpecificCellOwner;
    }
  });
  return winner;
};

const remainingMoves = (cells: ReadonlyArray<CellOwner>): number =>
  cells.reduce((acc, cellOwner) => acc + (cellOwner === CellOwner.None ? 1 : 0), 0);

export const isOneWinnerEnding = (gameView: Readonly<GameView>): boolean =>
  // for now, occurrence of a first consecutive sequence ends the game
  gameView.consecutive.length > 0;

export const isDrawEnding = (gameView: Readonly<GameView>): boolean =>
  !isOneWinnerEnding(gameView) && remainingMoves(gameView.board.cells) === 0;
