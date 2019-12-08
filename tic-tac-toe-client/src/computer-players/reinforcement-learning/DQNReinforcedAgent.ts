import {
  DQNEnv, DQNOpt, DQNSolver, Solver,
} from 'reinforce-js';

import { loadAgent, persistAgent, BrainStatistics } from '../ai-agent/StorableAgent';
import { BoardDimensions } from '../../meta-model/Board';
import { Brains } from './DQNPretrainedBrain';
import { Decision } from '../ai-agent/Decision';
import { ReinforcedAgent, StateSpace } from './ReinforcedAgent';
import { SpecificCellOwner } from '../../meta-model/CellOwner';
import { StorableDQNAgent } from './StorableDQNAgent';

interface SolverWithStatistics {
  solver: Solver;
  statistics: BrainStatistics;
}

const agents: Record<string, SolverWithStatistics> = {};

function loadDQNAgent(id: string): StorableDQNAgent | undefined {
  const agentData = loadAgent<StorableDQNAgent>(id, DQNReinforcedAgent.ObjectVersion);
  if (agentData) {
    return agentData;
  }
  if (id in Brains) {
    return Brains[id];
  }
  return undefined;
}

function createSolver(
  width: number,
  height: number,
  stateCount: number,
  actionCount: number,
): Solver {
  const agentEnvironment = new DQNEnv(width, height, stateCount, actionCount);
  const agentOptions = new DQNOpt();
  agentOptions.setNumberOfHiddenUnits([50]);
  return new DQNSolver(agentEnvironment, agentOptions);
}

/**
 * Encapsulates and persists the state of a DQN solver (the "brain") and provides the interface
 * for the decision and reward interaction between {@link DQNPlayer} and this agent. The DQN
 * solver is implemented by the package {@link 'reinforce-js'}.
 */
export class DQNReinforcedAgent implements ReinforcedAgent {
  static ObjectVersion = 2;

  private id: string;

  private solver: Solver;

  private statistics: BrainStatistics = {
    draws: 0,
    losses: 0,
    wins: 0,
  };

  constructor(
    public cellOwner: SpecificCellOwner,
    { width, height }: Readonly<BoardDimensions>,
  ) {
    const cellCount = width * height;
    const actionCount = cellCount;
    const stateCount = cellCount;
    this.id = `dqn-${this.cellOwner}-${width}x${height}-${stateCount}-${actionCount}`;

    if (this.id in agents) {
      const solverWithStatistics = agents[this.id];
      this.solver = solverWithStatistics.solver;
      this.statistics = solverWithStatistics.statistics;
    } else {
      this.solver = createSolver(width, height, stateCount, actionCount);

      const agentData = loadDQNAgent(this.id);
      if (agentData) {
        this.solver.fromJSON(agentData.network);

        // Defy an NPE in the DQN solver when the learn tick is not at an experience 0-offset.
        // Only concerns persisted DQN brains as their experience stack is not persisted.
        const experienceOffset = agentData.learnTick % this.solver.getOpt().get('keepExperienceInterval');
        (this.solver as any).learnTick = agentData.learnTick - experienceOffset;

        this.statistics = {
          draws: agentData.draws,
          losses: agentData.losses,
          wins: agentData.wins,
        };
      }

      agents[this.id] = {
        solver: this.solver,
        statistics: this.statistics,
      };

      this.persist();
    }
  }

  decide(prior: Readonly<StateSpace>): Decision {
    const action = this.solver.decide(prior.states);
    return {
      cellsAtToAttack: [action],
    };
  }

  reward(value: number): void {
    this.solver.learn(value);
    this.persist();
  }

  rememberDraw(): void {
    this.statistics.draws += 1;
    this.persist();
  }

  rememberLoss(): void {
    this.statistics.losses += 1;
    this.persist();
  }

  rememberWin(): void {
    this.statistics.wins += 1;
    this.persist();
  }

  private persist(): void {
    persistAgent<StorableDQNAgent>(this.id, DQNReinforcedAgent.ObjectVersion, {
      ...this.statistics,
      learnTick: (this.solver as any).learnTick,
      network: this.solver.toJSON(),
    });
  }
}
