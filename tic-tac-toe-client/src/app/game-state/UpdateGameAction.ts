import { setGameView } from './SetGameViewAction';
import { GameStateType } from './GameState';
import { GameView } from '../../meta-model/GameView';

export interface UpdateGameActionPayload {
  gameView: Readonly<GameView>;
}

export const updateGame = (
  prevState: Readonly<GameStateType>,
  payload: Readonly<UpdateGameActionPayload>,
): GameStateType => {
  const { gameView } = payload;
  let nextGameState = prevState;

  nextGameState = setGameView(nextGameState, { gameView });

  return nextGameState;
};
