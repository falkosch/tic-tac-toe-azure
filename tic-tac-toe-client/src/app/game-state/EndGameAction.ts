import { addWin } from './AddWinAction';
import { setGameView } from './SetGameViewAction';
import { setWinner } from './SetWinnerAction';
import { CellOwner } from '../../meta-model/CellOwner';
import { GameEndState } from '../../meta-model/GameEndState';
import { GameStateType } from './GameState';

export interface EndGameActionPayload {
  endState: Readonly<GameEndState>;
}

export const endGame = (
  prevState: Readonly<GameStateType>,
  payload: Readonly<EndGameActionPayload>,
): GameStateType => {
  const {
    endState: { visitee, gameView },
  } = payload;

  let nextGameState = prevState;

  nextGameState = setGameView(nextGameState, { gameView });

  visitee({
    drawEndState() {
      nextGameState = setWinner(nextGameState, { value: CellOwner.None });
    },
    erroneousEndState(error) {
      nextGameState = setWinner(nextGameState, { value: error });
    },
    oneWinnerEndState(winner) {
      nextGameState = setWinner(nextGameState, { value: winner });
      nextGameState = addWin(nextGameState, { player: winner });
    },
  });

  return nextGameState;
};
