import { GameView } from '../../meta-model/GameView';
import { GameStateType } from './GameState';

export interface SetGameViewActionPayload {
  gameView: GameView | undefined;
}

export function setGameView(
  prevState: GameStateType,
  { gameView }: SetGameViewActionPayload,
): GameStateType {
  return {
    ...prevState,
    gameView,
  };
}
