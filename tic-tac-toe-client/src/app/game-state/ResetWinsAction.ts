import { GameStateType } from './GameState';
import { SpecificCellOwner } from '../../meta-model/CellOwner';

export interface ResetWinsActionPayload {
  player: SpecificCellOwner;
}

export function resetWins(
  prevState: GameStateType,
  { player }: ResetWinsActionPayload,
): GameStateType {
  return {
    ...prevState,
    wins: {
      ...prevState.wins,
      [player]: 0,
    },
  };
}
