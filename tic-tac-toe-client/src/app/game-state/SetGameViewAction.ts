import { GameView } from '../../meta-model/GameView';
import { GameStateType } from './GameState';

export interface SetGameViewActionPayload {
  gameView: Readonly<GameView> | undefined;
}

export function setGameView(
  prevState: Readonly<GameStateType>,
  payload: Readonly<SetGameViewActionPayload>,
): GameStateType {
  const { gameView } = payload;
  return {
    ...prevState,
    gameView,
  };
}
