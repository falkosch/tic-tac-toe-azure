import { findReinforcedDecision } from './reinforcement-learning/ReinforcedAgent';
import { getDQNReinforcedAgent } from './reinforcement-learning/DQNReinforcedAgent';
import { notifyEndState } from './ai-agent/AIAgent';
import { AttackGameAction } from '../meta-model/GameAction';
import { GameEndState } from '../meta-model/GameEndState';
import { GameView } from '../meta-model/GameView';
import { PlayerCreator } from '../meta-model/Player';
import { PlayerTurn } from '../meta-model/PlayerTurn';
import { SpecificCellOwner } from '../meta-model/CellOwner';

export const createDQNPlayer: PlayerCreator = async () => (
  {
    async takeTurn(playerTurn: Readonly<PlayerTurn>): Promise<AttackGameAction> {
      const agent = await getDQNReinforcedAgent(
        playerTurn.cellOwner,
        playerTurn.gameView.board.dimensions,
      );
      const decision = await findReinforcedDecision(agent, playerTurn.gameView.board);
      return {
        affectedCellsAt: decision ? decision.cellsAtToAttack : [],
      };
    },

    async onGameEnd(
      cellOwner: Readonly<SpecificCellOwner>,
      gameView: Readonly<GameView>,
      endState: Readonly<GameEndState>,
    ): Promise<void> {
      const agent = await getDQNReinforcedAgent(
        cellOwner,
        gameView.board.dimensions,
      );
      await notifyEndState(endState, agent);
    },
  }
);
