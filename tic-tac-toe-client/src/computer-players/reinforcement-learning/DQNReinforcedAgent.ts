import {
  DQNEnv, DQNOpt, DQNSolver, Solver,
} from 'reinforce-js';

import { loadAgent, persistAgent } from '../ai-agent/StorableAgent';
import { BoardDimensions } from '../../meta-model/Board';
import { Brains } from './DQNPretrainedBrain';
import { Decision } from '../ai-agent/Decision';
import { ReinforcedAgent, StateSpace } from './ReinforcedAgent';
import { SpecificCellOwner } from '../../meta-model/CellOwner';
import { StorableDQNAgent } from './StorableDQNAgent';

const agents: Record<string, Solver> = {};

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

/**
 * Encapsulates and persists the state of a DQN solver (the "brain") and provides the interface
 * for the decision and reward interaction between {@link DQNPlayer} and this agent. The DQN
 * solver is implemented by the package {@link 'reinforce-js'}.
 */
export class DQNReinforcedAgent implements ReinforcedAgent {
  static ObjectVersion = 1;

  private id: string;

  private solver: Solver;

  constructor(
    public cellOwner: SpecificCellOwner,
    { width, height }: Readonly<BoardDimensions>,
  ) {
    const cellCount = width * height;
    const actionCount = cellCount;
    const stateCount = cellCount;
    this.id = `dqn-${this.cellOwner}-${width}x${height}-${stateCount}-${actionCount}`;
    this.solver = agents[this.id];

    if (!this.solver) {
      const agentEnvironment = new DQNEnv(width, height, stateCount, actionCount);
      const agentOptions = new DQNOpt();
      this.solver = new DQNSolver(agentEnvironment, agentOptions);
      agents[this.id] = this.solver;

      const agentData = loadDQNAgent(this.id);
      if (agentData) {
        this.solver.fromJSON(agentData.network);
        (this.solver as any).learnTick = agentData.learnTick - (agentData.learnTick % agentOptions.get('keepExperienceInterval'));
      }

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

  private persist(): void {
    persistAgent<StorableDQNAgent>(this.id, DQNReinforcedAgent.ObjectVersion, {
      learnTick: (this.solver as any).learnTick,
      network: this.solver.toJSON(),
    });
  }
}
