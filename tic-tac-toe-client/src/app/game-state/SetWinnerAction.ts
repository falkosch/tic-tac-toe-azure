import { CellOwner } from '../../meta-model/CellOwner';
import { GameStateType } from './GameState';

export interface SetWinnerActionPayload {
  value?: Readonly<CellOwner> | Readonly<Error>;
}

export function setWinner(
  prevState: GameStateType,
  { value }: SetWinnerActionPayload,
): GameStateType {
  return {
    ...prevState,
    winner: value,
  };
}
