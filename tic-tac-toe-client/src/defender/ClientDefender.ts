import fpTimes from 'lodash/fp/times';

import { CellOwner } from '../meta-model/CellOwner';
import { Defender } from '../meta-model/Defender';
import { Game } from '../meta-model/Game';
import { GameAction } from '../meta-model/GameAction';
import { GameReaction } from '../meta-model/GameReaction';

const DefaultHeight = 3;
const DefaultWidth = 3;

export class ClientDefender implements Defender {
  handshake(): Promise<Game> {
    return Promise.resolve({
      board: {
        cells: fpTimes<CellOwner>(() => CellOwner.None)(DefaultWidth * DefaultHeight),
        dimensions: {
          height: DefaultHeight,
          width: DefaultWidth,
        },
      },
      consecutiveness: [],
    });
  }

  defend(__gameAction: GameAction): Promise<GameReaction> {
    return Promise.reject(new Error('not implemented'));
  }
}
