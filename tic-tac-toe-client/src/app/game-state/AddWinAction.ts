import { GameStateType } from './GameState';
import { SpecificCellOwner } from '../../meta-model/CellOwner';

export interface AddWinActionPayload {
  player: SpecificCellOwner | undefined;
}

export function addWin(
  prevState: GameStateType,
  { player }: AddWinActionPayload,
): GameStateType {
  if (player === undefined) {
    return { ...prevState };
  }
  return {
    ...prevState,
    wins: {
      ...prevState.wins,
      [player]: prevState.wins[player] + 1,
    },
  };
}
