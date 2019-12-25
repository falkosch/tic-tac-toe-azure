import { setGameView } from './SetGameViewAction';
import { GameStateType } from './GameState';
import { GameView } from '../../meta-model/GameView';

export interface UpdateGameActionPayload {
  gameView: Readonly<GameView>;
}

export function updateGame(
  prevState: GameStateType,
  { gameView }: UpdateGameActionPayload,
): GameStateType {
  let nextGameState = prevState;

  nextGameState = setGameView(nextGameState, { gameView });

  return nextGameState;
}
