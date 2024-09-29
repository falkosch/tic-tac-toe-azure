import { ActionToken, GameStateType } from './GameState';

export interface SetActionTokenActionPayload {
  actionToken?: ActionToken;
}

export function setActionToken(
  prevState: Readonly<GameStateType>,
  payload: Readonly<SetActionTokenActionPayload>,
): GameStateType {
  const { actionToken } = payload;
  return {
    ...prevState,
    actionToken,
  };
}
