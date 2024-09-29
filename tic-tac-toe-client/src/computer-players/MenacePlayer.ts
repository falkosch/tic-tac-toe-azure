import { findMenaceDecision } from './menace-match-boxes/MenaceAgent';
import { AttackGameAction } from '../meta-model/GameAction';
import { DefaultMenaceAgent } from './menace-match-boxes/DefaultMenaceAgent';
import { GameEndState } from '../meta-model/GameEndState';
import { GameView } from '../meta-model/GameView';
import { Player } from '../meta-model/Player';
import { PlayerTurn } from '../meta-model/PlayerTurn';
import { SpecificCellOwner } from '../meta-model/CellOwner';

/**
 * Implements the concept Menace Match Box Engine developed by Donald Michie. Code itself is based
 * upon {@link https://github.com/andrewmccarthy/menace}.
 */
export class MenacePlayer implements Player {
  async takeTurn(playerTurn: Readonly<PlayerTurn>): Promise<AttackGameAction> {
    const agent = new DefaultMenaceAgent(
      playerTurn.cellOwner,
      playerTurn.gameView.board.dimensions,
    );
    const decision = findMenaceDecision(agent, playerTurn.gameView.board.cells);
    return {
      affectedCellsAt: decision ? decision.cellsAtToAttack : [],
    };
  }

  async onGameStart(
    cellOwner: Readonly<SpecificCellOwner>,
    gameView: Readonly<GameView>,
  ): Promise<void> {
    const agent = new DefaultMenaceAgent(
      cellOwner,
      gameView.board.dimensions,
    );
    agent.startNewGame();
  }

  async onGameEnd(
    cellOwner: Readonly<SpecificCellOwner>,
    gameView: Readonly<GameView>,
    endState: Readonly<GameEndState>,
  ): Promise<void> {
    const agent = new DefaultMenaceAgent(
      cellOwner,
      gameView.board.dimensions,
    );
    if (endState.winner === undefined) {
      agent.rememberDraw();
    } else if (endState.winner === cellOwner) {
      agent.rememberWin();
    } else if (endState.winner !== cellOwner) {
      agent.rememberLoss();
    }
  }
}
