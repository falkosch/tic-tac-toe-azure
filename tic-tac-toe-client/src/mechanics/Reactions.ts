import { buildAttackModifier } from './Actions';
import { GameAction } from '../meta-model/GameAction';
import { Game } from '../meta-model/Game';
import { GameReaction } from '../meta-model/GameReaction';

export function prepareReaction(gameAction: Readonly<GameAction>): GameReaction {
  let gameReaction: Readonly<GameReaction> = {
    board: gameAction.board,
    consecutiveness: [],
  };

  if (gameAction.attack) {
    const attackModifier = buildAttackModifier(gameAction.attack);
    gameReaction = {
      ...gameReaction,
      board: attackModifier(gameReaction.board),
    };
  }

  return gameReaction;
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
    return {
      board: reaction.board,
      consecutiveness: reaction.consecutiveness,
    };
  }
  return gameBefore;
}
