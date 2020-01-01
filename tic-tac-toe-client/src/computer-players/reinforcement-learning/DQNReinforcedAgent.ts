import { Mat } from 'recurrent-js';
import {
  DQNEnv, DQNOpt, DQNSolver, Solver,
} from 'reinforce-js';

import { loadAgent, persistAgent, BrainStatistics } from '../ai-agent/StorableAgent';
import { takeAny, Decision } from '../ai-agent/Decision';
import { AIAgentCreator } from '../ai-agent/AIAgent';
import { Brains } from './DQNPretrainedBrain';
import { ReinforcedAgent } from './ReinforcedAgent';
import { StorableDQNAgent } from './StorableDQNAgent';

interface SolverWithStatistics {
  solver: Solver;
  statistics: BrainStatistics;
}

const agents: Record<string, SolverWithStatistics> = {};

const dqnObjectVersion = 4;

async function loadDQNAgent(id: string): Promise<StorableDQNAgent | undefined> {
  return loadAgent<StorableDQNAgent>(id, dqnObjectVersion, Brains[id]);
}

function validOnlyArgMax(stateVector: Readonly<Mat>, actionVector: Readonly<Mat>): number {
  let maxValidValue = Number.NEGATIVE_INFINITY;
  let maxValidIndex = -1;
  actionVector.w.forEach((v: number, i: number) => {
    const cellState = stateVector.w[i];
    const cellIsFree = cellState === 0;
    if (cellIsFree && v > maxValidValue) {
      maxValidValue = v;
      maxValidIndex = i;
    }
  });
  return maxValidIndex;
}

function createSolver(
  width: number,
  height: number,
  stateCount: number,
  actionCount: number,
): Solver {
  const agentEnvironment = new DQNEnv(width, height, stateCount, actionCount);
  const agentOptions = new DQNOpt();
  agentOptions.setEpsilon(0.05);
  agentOptions.setEpsilonDecay(1, 0.1, 255168);
  agentOptions.setNumberOfHiddenUnits([Math.floor((1 + actionCount / 2) * stateCount)]);

  const solver = new DQNSolver(agentEnvironment, agentOptions);

  // We need to patch the action policy to only select valid actions.
  // TODO: propose a pull request for extending the decide function in reinforce-js.
  {
    const solverAsAny: any = solver;

    solverAsAny.epsilonGreedyActionPolicy = (stateVector: Mat) => {
      if (Math.random() < solverAsAny.currentEpsilon()) {
        return takeAny(
          stateVector.w
            .map((v: number, i: number): number => (v === 0 ? i : -1))
            .filter((v: number) => v >= 0) as ReadonlyArray<number>,
        )[0];
      }

      return validOnlyArgMax(stateVector, solverAsAny.forwardQ(stateVector));
    };

    solverAsAny.getTargetQ = (s1: Mat, r0: number) => {
      const targetActionVector = solverAsAny.forwardQ(s1);
      const targetActionIndex = validOnlyArgMax(s1, targetActionVector);
      const qMax = r0 + solverAsAny.gamma * targetActionVector.w[targetActionIndex];
      return qMax;
    };
  }

  return solver;
}

async function loadBrainAndStatistics(id: string, solver: Solver): Promise<BrainStatistics> {
  const agentData = await loadDQNAgent(id);
  if (!agentData) {
    return {
      draws: 0,
      losses: 0,
      wins: 0,
    };
  }

  solver.fromJSON(agentData.network);

  // Defy an NPE in the DQN solver when the learn tick is not at an experience 0-offset.
  // Only concerns persisted DQN brains as their experience stack is not persisted.
  const experienceOffset = agentData.wins % solver.getOpt().get('keepExperienceInterval');
  // eslint-disable-next-line no-param-reassign
  (solver as any).learnTick = agentData.wins - experienceOffset;

  return {
    draws: agentData.draws,
    losses: agentData.losses,
    wins: agentData.wins,
  };
}

export const getDQNReinforcedAgent: AIAgentCreator<ReinforcedAgent> = async (
  cellOwner,
  boardDimensions,
) => {
  const { height, width } = boardDimensions;
  const cellCount = width * height;
  const actionCount = cellCount;
  const stateCount = cellCount;
  const id = `dqn-${cellOwner}-${width}x${height}-${stateCount}-${actionCount}`;

  let solver: Solver;
  let statistics: BrainStatistics;

  const persist = async (): Promise<void> => persistAgent<StorableDQNAgent>(
    id,
    dqnObjectVersion,
    {
      ...statistics,
      network: solver.toJSON(),
    },
  );

  if (id in agents) {
    const solverWithStatistics = agents[id];
    solver = solverWithStatistics.solver;
    statistics = solverWithStatistics.statistics;
  } else {
    solver = createSolver(width, height, stateCount, actionCount);
    statistics = await loadBrainAndStatistics(id, solver);
    agents[id] = { solver, statistics };
  }

  /**
   * Encapsulates and persists the state of a DQN solver (the "brain") and provides the interface
   * for the decision and reward interaction between {@link DQNPlayer} and this agent. The DQN
   * solver is implemented by the package {@link 'reinforce-js'}.
   */
  return {
    cellOwner,

    async decide(prior): Promise<Decision> {
      const action = solver.decide(prior.states);
      return {
        cellsAtToAttack: [action],
      };
    },

    async rememberDraw(): Promise<void> {
      solver.learn(0.25);
      statistics.draws += 1;
      await persist();
    },

    async rememberLoss(): Promise<void> {
      solver.learn(-1.0);
      statistics.losses += 1;
      await persist();
    },

    async rememberWin(): Promise<void> {
      solver.learn(1.0);
      statistics.wins += 1;
      await persist();
    },
  };
};
