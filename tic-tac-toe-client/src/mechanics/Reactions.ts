import { GameAction } from '../meta-model/GameAction';
import { Game } from '../meta-model/Game';
import { GameReaction } from '../meta-model/GameReaction';

function validate(__gameBefore: Game, __action: GameAction, __reaction: GameReaction): boolean {
  return true;
}

export function evaluateReaction(
  gameBefore: Game,
  action: GameAction,
  reaction: GameReaction,
): Game {
  if (validate(gameBefore, action, reaction)) {
    return {
      board: reaction.board,
      consecutiveness: reaction.consecutiveness,
    };
  }
  return gameBefore;
}
