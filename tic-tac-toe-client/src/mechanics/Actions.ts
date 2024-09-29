import { AttackAction, GameAction } from '../meta-model/GameAction';
import { Board } from '../meta-model/Board';
import { CellOwner } from '../meta-model/CellOwner';

export function prepareAttack(board: Readonly<Board>, cellAt: number): GameAction {
  return {
    board,
    attack: {
      affectedCellsAt: [cellAt],
      newOwner: CellOwner.X,
    },
  };
}

export type CellModifier = (
  currentCellOwner: Readonly<CellOwner>,
  currentCellAt: number
) => CellOwner;

export function buildCellModifier(attack: Readonly<AttackAction>): CellModifier {
  return (currentCellOwner, currentCellAt) => {
    if (attack.affectedCellsAt.indexOf(currentCellAt) < 0) {
      return currentCellOwner;
    }

    if (currentCellOwner !== CellOwner.None) {
      return currentCellOwner;
    }

    return attack.newOwner;
  };
}

export type AttackModifier = (board: Readonly<Board>) => Board;

export function buildAttackModifier(
  attack: Readonly<AttackAction>,
): AttackModifier {
  const cellModifier = buildCellModifier(attack);

  return (board) => ({
    cells: board.cells.map(cellModifier),
    dimensions: board.dimensions,
  });
}
