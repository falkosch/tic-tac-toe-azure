import { CellOwner } from '../meta-model/CellOwner';
import { Defender } from '../meta-model/Defender';
import { Game } from '../meta-model/Game';
import { GameAction } from '../meta-model/GameAction';
import { GameReaction } from '../meta-model/GameReaction';

export class MockDefender implements Defender {
  handshake(): Promise<Game> {
    return Promise.resolve({
      board: {
        cells: [
          CellOwner.X, CellOwner.O, CellOwner.X,
          CellOwner.O, CellOwner.X, CellOwner.O,
          CellOwner.O, CellOwner.X, CellOwner.O,
        ],
        dimensions: {
          height: 3,
          width: 3,
        },
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
