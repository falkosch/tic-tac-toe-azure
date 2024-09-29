import { buildReactionModifier } from '../mechanics/Reactions';
import { CellOwner } from '../meta-model/CellOwner';
import { Defender } from '../meta-model/Defender';
import { Game } from '../meta-model/Game';
import { GameAction } from '../meta-model/GameAction';
import { GameReaction } from '../meta-model/GameReaction';

export class MockDefender implements Defender {
  handshake(): Promise<Game> {
    return Promise.resolve(
      {
        board: {
          cells: [
            CellOwner.X, CellOwner.O, CellOwner.None,
            CellOwner.None, CellOwner.None, CellOwner.None,
            CellOwner.None, CellOwner.None, CellOwner.None,
          ],
          dimensions: {
            height: 3,
            width: 3,
          },
        },
        consecutiveness: [],
      },
    );
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
