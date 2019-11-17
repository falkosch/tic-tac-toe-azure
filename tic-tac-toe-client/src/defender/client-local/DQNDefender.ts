import { DQNEnv, DQNOpt, DQNSolver } from 'reinforce-js';

import { prepareReaction } from '../../mechanics/Reactions';
import { BoardDimensions } from '../../meta-model/Board';
import { CellOwner } from '../../meta-model/CellOwner';
import { Defender } from '../../meta-model/Defender';
import { Game } from '../../meta-model/Game';
import { GameAction } from '../../meta-model/GameAction';
import { GameReaction } from '../../meta-model/GameReaction';

type Decider = (cellsAsEnvStates: number[]) => number;
type RewardInducer = (reward: number) => void;
type CellUpdater = (cellOwner: CellOwner, cellAt: number) => CellOwner;

const DefaultBoardDimensions: Readonly<BoardDimensions> = {
  height: 3,
  width: 3,
};

function cellToEnvState(cellOwner: CellOwner): number {
  if (cellOwner === CellOwner.None) {
    return 1.0;
  }
  return -1.0;
}

function buildCellUpdater(agentDecisionAsCellAt: number): CellUpdater {
  return (cellOwner, cellAt) => {
    if (cellAt === agentDecisionAsCellAt) {
      return CellOwner.O;
    }
    return cellOwner;
  };
}

function commenceReaction(
  gameReaction: Readonly<GameReaction>,
  decide: Decider,
  induceReward: RewardInducer,
): GameReaction {
  const cellsAsEnvStates = gameReaction.board.cells.map(cellToEnvState);

  let reward = Number.NEGATIVE_INFINITY;

  for (let i = 0; i < 100; i += 1) {
    const agentDecisionAsCellAt = decide(cellsAsEnvStates);
    const chosenCell = gameReaction.board.cells[agentDecisionAsCellAt];
    reward = cellToEnvState(chosenCell);
    induceReward(reward);

    if (reward >= 0) {
      const cellUpdater = buildCellUpdater(agentDecisionAsCellAt);
      return {
        ...gameReaction,
        board: {
          ...gameReaction.board,
          cells: gameReaction.board.cells.map(cellUpdater),
        },
      };
    }
  }

  return gameReaction;
}

export class DQNDefender implements Defender {
  static ReadableName = 'DQN learning defender (In browser)';

  static numCells = DefaultBoardDimensions.width * DefaultBoardDimensions.height;

  static agent: DQNSolver = (() => {
    const agentEnvironment = new DQNEnv(
      DefaultBoardDimensions.width,
      DefaultBoardDimensions.height,
      DQNDefender.numCells,
      DQNDefender.numCells,
    );
    const agentOptions = new DQNOpt();
    return new DQNSolver(agentEnvironment, agentOptions);
  })();

  handshake(): Promise<Game> {
    return Promise.resolve({
      board: {
        cells: Array.from({ length: DQNDefender.numCells }).map(() => CellOwner.None),
        dimensions: DefaultBoardDimensions,
      },
      consecutiveness: [],
    });
  }

  defend(gameAction: Readonly<GameAction>): Promise<GameReaction> {
    let gameReaction = prepareReaction(gameAction);

    if (DQNDefender.agent !== undefined) {
      gameReaction = commenceReaction(
        gameReaction,
        (cellsAsEnvStates) => DQNDefender.agent.decide(cellsAsEnvStates),
        (reward) => DQNDefender.agent.learn(reward),
      );
    }

    return Promise.resolve(gameReaction);
  }
}
