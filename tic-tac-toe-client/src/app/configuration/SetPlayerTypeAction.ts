import { GameConfigurationType, PlayerType } from './GameConfiguration';
import { SpecificCellOwner } from '../../meta-model/CellOwner';

export interface SetPlayerTypeActionPayload {
  player: SpecificCellOwner;
  playerType: PlayerType;
}

export function setPlayerType(
  prevState: GameConfigurationType,
  { player, playerType }: SetPlayerTypeActionPayload,
): GameConfigurationType {
  return {
    ...prevState,
    playerTypes: {
      ...prevState.playerTypes,
      [player]: playerType,
    },
  };
}
