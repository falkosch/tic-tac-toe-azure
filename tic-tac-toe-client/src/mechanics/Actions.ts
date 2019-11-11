import { Board } from '../meta-model/Board';
import { CellOwner } from '../meta-model/CellOwner';
import { GameAction } from '../meta-model/GameAction';

export function commenceAttack(board: Board, cellAt: number): GameAction {
  return {
    board,
    attack: {
      affectedCellsAt: [cellAt],
      newOwner: CellOwner.X,
    },
  };
}
