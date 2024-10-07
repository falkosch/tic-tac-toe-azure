import { Mat } from 'recurrent-js';
import { DQNEnv, DQNOpt, DQNSolver, Solver } from 'reinforce-js';

import { BrainStatistics, loadAgent, persistAgent } from '../ai-agent/StorableAgent';
import { Decision, takeAny } from '../ai-agent/Decision';
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

const validOnlyArgMax = (stateVector: Readonly<Mat>, actionVector: Readonly<Mat>): number => {
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
};

// We need to patch the action policy to only select valid actions.
// TODO: propose a pull request for extending the decide function in reinforce-js.
const patchSolver = (getSolver: () => DQNSolver): void => {
  // The getSolver is only used to avoid the "parameter assignment" warning
  const solverAsAny = getSolver();

  // @ts-expect-error TS/2445 we need to patch this protected member
  solverAsAny.epsilonGreedyActionPolicy = (stateVector: Mat) => {
    // @ts-expect-error TS/2445 we need to access this protected member
    if (Math.random() < solverAsAny.currentEpsilon()) {
      const freeStates = Array.from(stateVector.w)
        .map((v, i) => (v === 0 ? i : -1))
        .filter((v) => v >= 0);
      return takeAny(freeStates)[0];
    }

    // @ts-expect-error TS/2445 we need to access this protected member
    return validOnlyArgMax(stateVector, solverAsAny.forwardQ(stateVector));
  };

  // @ts-expect-error TS/2445 we need to patch this protected member
  solverAsAny.getTargetQ = (s1: Mat, r0: number) => {
    // @ts-expect-error TS/2445 we need to access this protected member
    const targetActionVector = solverAsAny.forwardQ(s1);
    const targetActionIndex = validOnlyArgMax(s1, targetActionVector);
    return r0 + solverAsAny.gamma * targetActionVector.w[targetActionIndex];
  };
};

const createSolver = (
  width: number,
  height: number,
  stateCount: number,
  actionCount: number,
): DQNSolver => {
  const agentEnvironment = new DQNEnv(width, height, stateCount, actionCount);
  const agentOptions = new DQNOpt();
  agentOptions.setEpsilon(0.05);
  agentOptions.setEpsilonDecay(0.1, 0.05, 1000000);
  agentOptions.setNumberOfHiddenUnits([Math.floor((1 + actionCount / 2) * stateCount)]);

  const solver = new DQNSolver(agentEnvironment, agentOptions);
  patchSolver(() => solver);
  return solver;
};

const newBrainStatistics = (): BrainStatistics => {
  return {
    draws: 0,
    losses: 0,
    wins: 0,
  };
};

const loadBrainAndStatistics = async (
  id: string,
  solverCreator: () => DQNSolver,
): Promise<SolverWithStatistics> => {
  if (id in agents) {
    return agents[id];
  }

  let statistics: BrainStatistics;
  const solver = solverCreator();
  const loadedAgentData = await loadAgent(id, dqnObjectVersion, Brains[id]);

  if (loadedAgentData) {
    solver.fromJSON(loadedAgentData.network);
    statistics = {
      draws: loadedAgentData.draws,
      losses: loadedAgentData.losses,
      wins: loadedAgentData.wins,
    };

    // Defy an NPE in the DQN solver when the learn tick is not at an experience 0-offset.
    // Only concerns persisted DQN brains as their experience stack is not persisted.
    const keepExperienceInterval = solver.getOpt().get('keepExperienceInterval');
    const experienceOffset = loadedAgentData.wins % keepExperienceInterval;
    // @ts-expect-error TS/2445 we need to patch this protected member
    solver.learnTick = loadedAgentData.wins - experienceOffset;
  } else {
    statistics = newBrainStatistics();
  }

  const agent = { solver, statistics };
  agents[id] = agent;
  return agent;
};

export const getDQNReinforcedAgent: AIAgentCreator<ReinforcedAgent> = async (
  cellOwner,
  boardDimensions,
) => {
  const { height, width } = boardDimensions;
  const cellCount = width * height;
  const id = `dqn-${cellOwner}-${width}x${height}-${cellCount}-${cellCount}`;
  const agentData = await loadBrainAndStatistics(id, () =>
    createSolver(width, height, cellCount, cellCount),
  );

  const persist = async (): Promise<void> => {
    const network = agentData.solver.toJSON() as unknown as StorableDQNAgent['network'];
    const brain: StorableDQNAgent = { ...agentData.statistics, network };
    await persistAgent(id, dqnObjectVersion, brain);
  };

  /**
   * Encapsulates and persists the state of a DQN solver (the "brain") and provides the interface
   * for the decision and reward interaction between {@link DQNPlayer} and this agent. The DQN
   * solver is implemented by the package {@link 'reinforce-js'}.
   */
  return {
    cellOwner,

    async decide(prior): Promise<Decision> {
      const action = agentData.solver.decide(prior.states);
      agentData.solver.learn(-0.1);
      return {
        cellsAtToAttack: [action],
      };
    },

    async rememberDraw(): Promise<void> {
      agentData.solver.learn(0.25);
      agentData.statistics.draws += 1;
      await persist();
    },

    async rememberLoss(): Promise<void> {
      agentData.solver.learn(-1.0);
      agentData.statistics.losses += 1;
      await persist();
    },

    async rememberWin(): Promise<void> {
      agentData.solver.learn(1.0);
      agentData.statistics.wins += 1;
      await persist();
    },
  };
};
