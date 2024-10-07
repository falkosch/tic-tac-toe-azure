import { setActionToken } from './SetActionTokenAction';
import { setGameView } from './SetGameViewAction';
import { setWinner } from './SetWinnerAction';
import { GameStateType } from './GameState';
import { GameView } from '../../meta-model/GameView';

export interface StartNewGameActionPayload {
  gameView: Readonly<GameView>;
}

export const startNewGame = (
  prevState: Readonly<GameStateType>,
  payload: Readonly<StartNewGameActionPayload>,
): GameStateType => {
  const { gameView } = payload;
  let nextGameState = prevState;

  nextGameState = setActionToken(nextGameState, {});
  nextGameState = setGameView(nextGameState, { gameView });
  nextGameState = setWinner(nextGameState, { value: undefined });

  return nextGameState;
};
