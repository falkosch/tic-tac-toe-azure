import { addWin } from './AddWinAction';
import { setGameView } from './SetGameViewAction';
import { setInProgress } from './SetInProgressAction';
import { setWinner } from './SetWinnerAction';
import { CellOwner } from '../../meta-model/CellOwner';
import { GameEndState } from '../../meta-model/GameEndState';
import { GameStateType } from './GameState';
import { GameView } from '../../meta-model/GameView';

export interface EndGameActionPayload {
  endState: Readonly<GameEndState>;
  gameView: Readonly<GameView>;
}

export function endGame(
  prevState: GameStateType,
  {
    endState,
    gameView,
  }: EndGameActionPayload,
): GameStateType {
  let nextGameState = prevState;

  nextGameState = setGameView(nextGameState, { gameView });
  nextGameState = setInProgress(nextGameState, { value: false });
  nextGameState = setWinner(nextGameState, { value: endState.winner || CellOwner.None });

  if (!(endState.winner instanceof Error)) {
    nextGameState = addWin(nextGameState, { player: endState.winner });
  }

  return nextGameState;
}
