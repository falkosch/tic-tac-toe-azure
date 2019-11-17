import { prepareReaction } from '../mechanics/Reactions';
import { CellOwner } from '../meta-model/CellOwner';
import { Defender } from '../meta-model/Defender';
import { Game } from '../meta-model/Game';
import { GameAction } from '../meta-model/GameAction';
import { GameReaction } from '../meta-model/GameReaction';

export class MockDefender implements Defender {
  static ReadableName = 'Not reacting defender (Mock)';

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
    return Promise.resolve(prepareReaction(gameAction));
  }
}
