import { findReinforcedDecision } from './reinforcement-learning/ReinforcedAgent';
import { AttackGameAction } from '../meta-model/GameAction';
import { DQNReinforcedAgent } from './reinforcement-learning/DQNReinforcedAgent';
import { Player } from '../meta-model/Player';
import { PlayerTurn } from '../meta-model/PlayerTurn';

export class DQNPlayer implements Player {
  async takeTurn(playerTurn: Readonly<PlayerTurn>): Promise<AttackGameAction> {
    const agent = new DQNReinforcedAgent(
      playerTurn.cellOwner,
      playerTurn.gameView.board.dimensions,
    );
    const decision = findReinforcedDecision(agent, playerTurn.gameView.board);
    return {
      affectedCellsAt: decision ? decision.cellsAtToAttack : [],
    };
  }
}
