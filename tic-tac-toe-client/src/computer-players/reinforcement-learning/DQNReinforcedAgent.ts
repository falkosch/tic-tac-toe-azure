import {
  DQNEnv, DQNOpt, DQNSolver, Solver,
} from 'reinforce-js';

import { BoardDimensions } from '../../meta-model/Board';
import { Decision, ReinforcedAgent, StateSpace } from './ReinforcedAgent';
import { SpecificCellOwner } from '../../meta-model/CellOwner';

const agents: Record<string, Solver> = {};

interface StorableAgent {
  version: number;
  learnTick: number;
  network: any;
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

      const stored = localStorage.getItem(this.id);
      if (stored) {
        try {
          const parsed: StorableAgent = JSON.parse(stored);
          if (parsed && parsed.version === DQNReinforcedAgent.ObjectVersion) {
            this.solver.fromJSON(parsed.network);
            (this.solver as any).learnTick = parsed.learnTick;
          }
        } catch (e) {
          console.error('could not load agent data for ', this.id, ' due to ', e);
        }
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
    const data: StorableAgent = {
      version: DQNReinforcedAgent.ObjectVersion,
      learnTick: (this.solver as any).learnTick,
      network: this.solver.toJSON(),
    };
    localStorage.setItem(this.id, JSON.stringify(data));
  }
}
