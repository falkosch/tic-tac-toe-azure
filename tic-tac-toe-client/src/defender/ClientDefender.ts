import fpTimes from 'lodash/fp/times';

import { buildReactionModifier } from '../mechanics/Reactions';
import { GameAction } from '../meta-model/GameAction';
import { CellOwner } from '../meta-model/CellOwner';
import { Defender } from '../meta-model/Defender';
import { Game } from '../meta-model/Game';
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

  defend(gameAction: Readonly<GameAction>): Promise<GameReaction> {
    let gameReaction: Readonly<GameReaction> = {
      board: gameAction.board,
      consecutiveness: [],
      endedReaction: undefined,
    };

    if (gameAction.attack) {
      const reactionModifier = buildReactionModifier(gameAction.attack, gameAction.board);
      gameReaction = reactionModifier(gameReaction);
    }

    return Promise.resolve(gameReaction);
  }
}
