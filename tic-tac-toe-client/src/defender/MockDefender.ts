import fpTimes from 'lodash/fp/times';

import { CellOwner } from '../meta-model/Cell';
import { Defender } from '../meta-model/Defender';
import { Game } from '../meta-model/Game';
import { GameAction } from '../meta-model/GameAction';
import { GameReaction } from '../meta-model/GameReaction';

const DefaultHeight = 3;
const DefaultWidth = 3;

export default class MockDefender implements Defender {
  handshake(): Promise<Game> {
    return Promise.resolve({
      board: {
        cells: fpTimes<CellOwner>(() => CellOwner.None)(DefaultHeight * DefaultWidth),
        height: DefaultHeight,
        width: DefaultWidth,
      },
      consecutiveness: [],
    });
  }

  defend(gameAction: GameAction): Promise<GameReaction> {
    return Promise.resolve({
      board: gameAction.board,
      consecutiveness: [],
    });
  }
}
