import { boardValue, commenceReaction } from './ReinforcedAgent';
import { isEnding } from '../../mechanics/GameRules';
import { prepareReaction } from '../../mechanics/Reactions';
import { BoardDimensions } from '../../meta-model/Board';
import { CellOwner } from '../../meta-model/CellOwner';
import { Defender } from '../../meta-model/Defender';
import { DQNReinforcedAgent } from './DQNReinforcedAgent';
import { Game } from '../../meta-model/Game';
import { GameAction } from '../../meta-model/GameAction';
import { GameReaction } from '../../meta-model/GameReaction';

const DefaultBoardDimensions: Readonly<BoardDimensions> = {
  height: 3,
  width: 3,
};

export class DQNDefender implements Defender {
  static ReadableName = 'DQN learning defender (In browser)';

  static agent = new DQNReinforcedAgent(DefaultBoardDimensions);

  handshake(): Promise<Game> {
    const cellCount = DefaultBoardDimensions.width * DefaultBoardDimensions.height;
    return Promise.resolve({
      board: {
        cells: Array.from({ length: cellCount }).map(() => CellOwner.None),
        dimensions: DefaultBoardDimensions,
      },
      consecutiveness: [],
      points: {
        [CellOwner.O]: 0,
        [CellOwner.X]: 0,
      },
    });
  }

  defend(gameAction: Readonly<GameAction>): Promise<GameReaction> {
    const reaction = prepareReaction(gameAction);

    if (isEnding(reaction.board)) {
      DQNDefender.agent.reward(boardValue(reaction.board));
      return Promise.resolve(reaction);
    }

    return Promise.resolve(
      commenceReaction(reaction, DQNDefender.agent),
    );
  }
}
