import { GameConfigurationType } from './GameConfiguration';

export interface SetAutoNewGameActionPayload {
  value: boolean;
}

export function setAutoNewGame(
  prevState: GameConfigurationType,
  { value }: SetAutoNewGameActionPayload,
): GameConfigurationType {
  return {
    ...prevState,
    autoNewGame: value,
  };
}
