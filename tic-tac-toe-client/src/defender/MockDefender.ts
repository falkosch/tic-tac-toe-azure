import { findConsecutiveness } from '../mechanics/Consecutiveness';
import { prepareReaction } from '../mechanics/Reactions';
import { CellOwner } from '../meta-model/CellOwner';
import { Defender } from '../meta-model/Defender';
import { Game } from '../meta-model/Game';
import { GameAction } from '../meta-model/GameAction';
import { GameReaction } from '../meta-model/GameReaction';

export class MockDefender implements Defender {
  static ReadableName = 'Not reacting defender (Mock)';

  handshake(): Promise<Game> {
    const board = {
      cells: [
        CellOwner.X, CellOwner.X, CellOwner.X,
        CellOwner.X, CellOwner.X, CellOwner.X,
        CellOwner.X, CellOwner.None, CellOwner.X,
      ],
      dimensions: {
        height: 3,
        width: 3,
      },
    };

    return Promise.resolve({
      board,
      consecutiveness: findConsecutiveness(board),
    });
  }

  defend(gameAction: Readonly<GameAction>): Promise<GameReaction> {
    return Promise.resolve(prepareReaction(gameAction));
  }
}
