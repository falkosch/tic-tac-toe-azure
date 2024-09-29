import {
  DQNEnv, DQNOpt, DQNSolver, Solver,
} from 'reinforce-js';

import { loadAgent, persistAgent, BrainStatistics } from '../ai-agent/StorableAgent';
import { AIAgentCreator } from '../ai-agent/AIAgent';
import { Brains } from './DQNPretrainedBrain';
import { Decision } from '../ai-agent/Decision';
import { ReinforcedAgent } from './ReinforcedAgent';
import { StorableDQNAgent } from './StorableDQNAgent';

interface SolverWithStatistics {
  solver: Solver;
  statistics: BrainStatistics;
}

const agents: Record<string, SolverWithStatistics> = {};

const dqnObjectVersion = 3;

async function loadDQNAgent(id: string): Promise<StorableDQNAgent | undefined> {
  return loadAgent<StorableDQNAgent>(id, dqnObjectVersion, Brains[id]);
}

function createSolver(
  width: number,
  height: number,
  stateCount: number,
  actionCount: number,
): Solver {
  const agentEnvironment = new DQNEnv(width, height, stateCount, actionCount);
  const agentOptions = new DQNOpt();
  agentOptions.setNumberOfHiddenUnits([500]);
  agentOptions.setEpsilonDecay(1, 0.1, 255168);
  return new DQNSolver(agentEnvironment, agentOptions);
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
    await persist();
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

    async reward(value: number): Promise<void> {
      solver.learn(value);
      await persist();
    },

    async rememberDraw(): Promise<void> {
      statistics.draws += 1;
      await persist();
    },

    async rememberLoss(): Promise<void> {
      statistics.losses += 1;
      await persist();
    },

    async rememberWin(): Promise<void> {
      statistics.wins += 1;
      await persist();
    },
  };
};
