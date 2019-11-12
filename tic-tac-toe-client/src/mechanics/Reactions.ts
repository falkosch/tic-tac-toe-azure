import { buildAttackModifier } from './Actions';
import { AttackAction, GameAction } from '../meta-model/GameAction';
import { Board } from '../meta-model/Board';
import { Game } from '../meta-model/Game';
import { GameReaction } from '../meta-model/GameReaction';

export type ReactionModifier = (gameReaction: Readonly<GameReaction>) => GameReaction;

export function buildReactionModifier(
  attack: Readonly<AttackAction>,
  board: Readonly<Board>,
): ReactionModifier {
  const attackModifier = buildAttackModifier(attack);

  return (gameReaction) => ({
    board: attackModifier(board),
    consecutiveness: gameReaction.consecutiveness,
    endedReaction: gameReaction.endedReaction,
  });
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
