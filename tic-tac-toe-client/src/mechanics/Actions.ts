import { AttackGameAction } from '../meta-model/GameAction';
import { CellOwner } from '../meta-model/CellOwner';
import { Board } from '../meta-model/Board';

export interface BoardModifier {
  (board: Readonly<Board>): Board;
}

export interface CellModifier {
  (currentCellOwner: Readonly<CellOwner>, currentCellAt: number): CellOwner;
}

export function buildCellModifier(
  attack: Readonly<AttackGameAction>,
  newOwner: Readonly<CellOwner>,
): CellModifier {
  return (currentCellOwner, currentCellAt) => {
    if (attack.affectedCellsAt.indexOf(currentCellAt) < 0) {
      return currentCellOwner;
    }
    if (currentCellOwner !== CellOwner.None) {
      return currentCellOwner;
    }
    return newOwner;
  };
}

export function buildBoardModifier(
  attack: Readonly<AttackGameAction>,
  newOwner: Readonly<CellOwner>,
): BoardModifier {
  const cellModifier = buildCellModifier(attack, newOwner);
  return board => ({
    cells: board.cells.map(cellModifier),
    dimensions: board.dimensions,
  });
}
