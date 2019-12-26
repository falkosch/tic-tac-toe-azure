import { setActionToken } from './SetActionTokenAction';
import { setGameView } from './SetGameViewAction';
import { setWinner } from './SetWinnerAction';
import { GameStateType } from './GameState';
import { GameView } from '../../meta-model/GameView';

export interface StartNewGameActionPayload {
  gameView: Readonly<GameView>;
}

export function startNewGame(
  prevState: GameStateType,
  { gameView }: StartNewGameActionPayload,
): GameStateType {
  let nextGameState = prevState;

  nextGameState = setActionToken(nextGameState, {});
  nextGameState = setGameView(nextGameState, { gameView });
  nextGameState = setWinner(nextGameState, { value: undefined });

  return nextGameState;
}
