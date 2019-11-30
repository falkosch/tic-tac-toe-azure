import { AttackGameAction } from '../meta-model/GameAction';
import { Player } from '../meta-model/Player';
import { PlayerTurn } from '../meta-model/PlayerTurn';

export class MockPlayer implements Player {
  async takeTurn(__playerTurn: Readonly<PlayerTurn>): Promise<AttackGameAction> {
    return { affectedCellsAt: [] };
  }
}
