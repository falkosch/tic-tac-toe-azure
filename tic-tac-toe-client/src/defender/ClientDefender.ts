import fpTimes from 'lodash/fp/times';

import { AttackAction, GameAction } from '../meta-model/GameAction';
import { Board } from '../meta-model/Board';
import { CellOwner } from '../meta-model/CellOwner';
import { Defender } from '../meta-model/Defender';
import { Game } from '../meta-model/Game';
import { GameReaction } from '../meta-model/GameReaction';

const DefaultHeight = 3;
const DefaultWidth = 3;

type GameReactionModifier = (gameReaction: GameReaction) => GameReaction;

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

  defend(gameAction: GameAction): Promise<GameReaction> {
    let gameReaction: GameReaction = {
      board: gameAction.board,
      consecutiveness: [],
      endedReaction: undefined,
    };
    if (gameAction.attack) {
      gameReaction = this.handleAttack(gameAction.board, gameAction.attack)(gameReaction);
    }
    return Promise.resolve(gameReaction);
  }

  private handleAttack(board: Board, __attack: AttackAction): GameReactionModifier {
    return (gameReaction: GameReaction) => ({
      board,
      consecutiveness: gameReaction.consecutiveness,
      endedReaction: gameReaction.endedReaction,
    });
  }
}
