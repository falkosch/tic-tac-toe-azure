import { GameConfigurationType, PlayerType } from './GameConfiguration';
import { SpecificCellOwner } from '../../meta-model/CellOwner';

export interface SetPlayerTypeActionPayload {
  player: Readonly<SpecificCellOwner>;
  playerType: Readonly<PlayerType>;
}

export function setPlayerType(
  prevState: Readonly<GameConfigurationType>,
  payload: Readonly<SetPlayerTypeActionPayload>,
): GameConfigurationType {
  const { player, playerType } = payload;
  return {
    ...prevState,
    playerTypes: {
      ...prevState.playerTypes,
      [player]: playerType,
    },
  };
}
