import {
  DQNEnv, DQNOpt, DQNSolver, Solver,
} from 'reinforce-js';

import { BoardDimensions } from '../../meta-model/Board';
import { Decision, ReinforcedAgent, StateSpace } from './ReinforcedAgent';
import { SpecificCellOwner } from '../../meta-model/CellOwner';

const agents: Record<string, Solver> = {};

export class DQNReinforcedAgent implements ReinforcedAgent {
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
      agentOptions.setNumberOfHiddenUnits([100]);
      agentOptions.setEpsilonDecay(1.0, 0.1, 1000);
      this.solver = new DQNSolver(agentEnvironment, agentOptions);
      agents[this.id] = this.solver;

      const storedDQN = localStorage.getItem(this.id);
      if (storedDQN === undefined || storedDQN === null) {
        localStorage.setItem(this.id, JSON.stringify(this.solver.toJSON()));
      } else {
        this.solver.fromJSON(JSON.parse(storedDQN));
      }
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
    localStorage.setItem(this.id, JSON.stringify(this.solver.toJSON()));
  }
}
