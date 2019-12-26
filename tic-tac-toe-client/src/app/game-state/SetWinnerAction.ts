import { CellOwner } from '../../meta-model/CellOwner';
import { GameStateType } from './GameState';

export interface SetWinnerActionPayload {
  value?: Readonly<CellOwner> | Readonly<Error>;
}

export function setWinner(
  prevState: Readonly<GameStateType>,
  payload: Readonly<SetWinnerActionPayload>,
): GameStateType {
  const { value } = payload;
  return {
    ...prevState,
    winner: value,
  };
}
