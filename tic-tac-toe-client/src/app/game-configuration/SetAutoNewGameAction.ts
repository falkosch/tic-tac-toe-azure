import { GameConfigurationType } from './GameConfiguration';

export interface SetAutoNewGameActionPayload {
  value: boolean;
}

export function setAutoNewGame(
  prevState: Readonly<GameConfigurationType>,
  payload: Readonly<SetAutoNewGameActionPayload>,
): GameConfigurationType {
  const { value } = payload;
  return {
    ...prevState,
    autoNewGame: value,
  };
}
