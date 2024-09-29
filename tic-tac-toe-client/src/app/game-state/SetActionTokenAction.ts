import { ActionToken, GameStateType } from './GameState';

export interface SetActionTokenActionPayload {
  actionToken?: ActionToken;
}

export function setActionToken(
  prevState: GameStateType,
  { actionToken }: SetActionTokenActionPayload,
): GameStateType {
  return {
    ...prevState,
    actionToken,
  };
}
