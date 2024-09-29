import { GameStateType } from './GameState';

export interface SetInProgressActionPayload {
  value: boolean;
}

export function setInProgress(
  prevState: GameStateType,
  { value }: SetInProgressActionPayload,
): GameStateType {
  return {
    ...prevState,
    inProgress: value,
  };
}
