import { addWin } from './AddWinAction';
import { setGameView } from './SetGameViewAction';
import { setWinner } from './SetWinnerAction';
import { CellOwner, SpecificCellOwner } from '../../meta-model/CellOwner';
import { GameEndState } from '../../meta-model/GameEndState';
import { GameStateType } from './GameState';
import { GameView } from '../../meta-model/GameView';

export interface EndGameActionPayload {
  endState: Readonly<GameEndState>;
  gameView: Readonly<GameView>;
}

export function endGame(
  prevState: Readonly<GameStateType>,
  payload: Readonly<EndGameActionPayload>,
): GameStateType {
  const { endState: { winner }, gameView } = payload;
  let nextGameState = prevState;

  nextGameState = setGameView(nextGameState, { gameView });
  nextGameState = setWinner(nextGameState, { value: winner });

  if (!(winner instanceof Error || winner === CellOwner.None)) {
    nextGameState = addWin(
      nextGameState,
      { player: winner as SpecificCellOwner },
    );
  }

  return nextGameState;
}
