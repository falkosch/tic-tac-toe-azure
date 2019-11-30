import { AttackGameAction } from './GameAction';
import { GameView } from './GameView';
import { PlayerTurn } from './PlayerTurn';
import { SpecificCellOwner } from './CellOwner';

/**
 * Enables players to interact with the game.
 */
export interface Player {
  takeTurn(playerTurn: Readonly<PlayerTurn>): Promise<AttackGameAction>;
  onGameViewUpdate?(cellOwner: Readonly<SpecificCellOwner>, gameView: Readonly<GameView>): void;
}
