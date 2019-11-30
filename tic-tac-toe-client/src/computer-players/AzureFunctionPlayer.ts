import { AttackGameAction } from '../meta-model/GameAction';
import { Player } from '../meta-model/Player';
import { PlayerTurn } from '../meta-model/PlayerTurn';

/**
 * TODO Preliminary, actual implementation will call Azure Function at
 * fstictactoegame.azurewebsites.net
 */
export class AzureFunctionPlayer implements Player {
  takeTurn(__playerTurn: Readonly<PlayerTurn>): Promise<AttackGameAction> {
    throw new Error('not implemented yet');
  }
}
