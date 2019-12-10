import { findMenaceDecision } from './menace-match-boxes/MenaceAgent';
import { notifyEndState } from './ai-agent/AIAgent';
import { AttackGameAction } from '../meta-model/GameAction';
import { getMenaceAgent } from './menace-match-boxes/DefaultMenaceAgent';
import { GameEndState } from '../meta-model/GameEndState';
import { GameView } from '../meta-model/GameView';
import { PlayerCreator } from '../meta-model/Player';
import { PlayerTurn } from '../meta-model/PlayerTurn';
import { SpecificCellOwner } from '../meta-model/CellOwner';

export const createMenacePlayer: PlayerCreator = async () => (
  {
    /**
     * Implements the concept Menace Match Box Engine developed by Donald Michie. Code itself is
     * based upon {@link https://github.com/andrewmccarthy/menace}.
     */
    async takeTurn(playerTurn: Readonly<PlayerTurn>): Promise<AttackGameAction> {
      const agent = await getMenaceAgent(
        playerTurn.cellOwner,
        playerTurn.gameView.board.dimensions,
      );
      const decision = await findMenaceDecision(agent, playerTurn.gameView.board.cells);
      return {
        affectedCellsAt: decision ? decision.cellsAtToAttack : [],
      };
    },

    async onGameStart(
      cellOwner: Readonly<SpecificCellOwner>,
      gameView: Readonly<GameView>,
    ): Promise<void> {
      const agent = await getMenaceAgent(cellOwner, gameView.board.dimensions);
      await agent.startNewGame();
    },

    async onGameEnd(
      cellOwner: Readonly<SpecificCellOwner>,
      gameView: Readonly<GameView>,
      endState: Readonly<GameEndState>,
    ): Promise<void> {
      const agent = await getMenaceAgent(cellOwner, gameView.board.dimensions);
      await notifyEndState(endState, agent);
    },
  }
);
