import { buildBoardModifier } from './Actions';
import { countPoints } from './GameRules';
import { findConsecutiveness } from './Consecutiveness';
import { Game } from '../meta-model/Game';
import { GameAction } from '../meta-model/GameAction';
import { GameReaction } from '../meta-model/GameReaction';

export function prepareReaction(gameAction: Readonly<GameAction>): GameReaction {
  let reaction: Readonly<GameReaction> = {
    board: gameAction.board,
  };

  if (gameAction.attack) {
    reaction = {
      ...reaction,
      board: buildBoardModifier(gameAction.attack)(reaction.board),
    };
  }

  return reaction;
}

export function validate(
  __gameBefore: Readonly<Game>,
  __action: Readonly<GameAction>,
  __reaction: Readonly<GameReaction>,
): boolean {
  return true;
}

export function evaluateReaction(
  gameBefore: Readonly<Game>,
  action: Readonly<GameAction>,
  reaction: Readonly<GameReaction>,
): Game {
  if (validate(gameBefore, action, reaction)) {
    const consecutiveness = findConsecutiveness(reaction.board);
    return {
      board: reaction.board,
      consecutiveness,
      points: countPoints(reaction.board, consecutiveness),
    };
  }
  return gameBefore;
}
