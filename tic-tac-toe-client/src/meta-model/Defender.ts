import { Game } from './Game';
import { GameAction } from './GameAction';
import { GameReaction } from './GameReaction';

/**
 * Acts as the opponent in the Tic Tac Toe game. The defender acts usually second in the game.
 */
export interface Defender {

  /**
   * Reacts upon an action of the attacker and returns the representation of the effect of the
   * reaction.
   *
   * @param gameAction to defend upon
   * @return new game state after the reaction
   */
  defend(gameAction: Readonly<GameAction>): Promise<GameReaction>;

  /**
   * Initializes a new game state.
   */
  handshake(): Promise<Game>;
}
